// prisma/seed-fiscal.ts
// Precisa vir antes de tudo: rodando via `npx tsx prisma/seed-fiscal.ts`
// diretamente (em vez de `npx prisma db seed`), o Prisma CLI não carrega o
// .env sozinho — sem isso, DATABASE_URL fica undefined e o PrismaClient falha
// ao inicializar.
import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { gerarChaveAcessoNFe, gerarChaveAcessoNFSe } from '../src/utils/chaveAcesso.js'

const prisma = new PrismaClient()

// 🔥 CNPJ da empresa alvo — configurável via env porque o cadastro de
// clientes tem `documento` globalmente único no schema (não por empresa):
// se a empresa "padrão" abaixo já tiver esses documentos fictícios
// reservados por outra empresa no banco, ela nunca ganha clientes pelo
// seed.ts e este script falha com "Nenhum cliente encontrado".
const CNPJ_EMPRESA_FISCAL = process.env.SEED_FISCAL_CNPJ || '18236447000190'

// 🔥 LIMITES DE SEGURANÇA (mitigação CWE-770 / CWE-400)
const PAGE_SIZE = 100
const MAX_PAGE_ITERATIONS = 1000
const MAX_CLIENTES = 10000
const MAX_PRODUTOS = 10000
const MAX_SERVICOS = 10000
const MAX_TRANSPORTADORAS = 10000
const MAX_DOCS_POR_TIPO = 1000
const MAX_ITENS_POR_NOTA = 50

// 🔥 FUNÇÕES AUXILIARES
function gerarDataAleatoria(diasAtras: number): Date {
  const data = new Date()
  data.setDate(data.getDate() - Math.floor(Math.random() * diasAtras))
  return data
}

function gerarValor(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2))
}

function gerarXmlAssinado(tipo: string, numero: number, chave: string): string {
  const modelo = tipo === 'NFe' ? '55' : tipo === 'NFCe' ? '65' : tipo === 'CTe' ? '57' : ''
  const namespace = tipo === 'NFSe'
    ? 'http://www.sped.fazenda.gov.br/nfse'
    : `http://www.portalfiscal.inf.br/${tipo.toLowerCase()}`

  return `<?xml version="1.0" encoding="UTF-8"?>
<${tipo} xmlns="${namespace}">
  <inf${tipo} Id="${tipo}${chave}" versao="4.00">
    <ide>
      <cUF>35</cUF>
      <cNF>${chave.slice(35, 43)}</cNF>
      <mod>${modelo}</mod>
      <serie>1</serie>
      <nNF>${numero}</nNF>
      <dhEmi>${new Date().toISOString()}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>3550308</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${chave.slice(-1)}</cDV>
      <tpAmb>1</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>0</indFinal>
      <indPres>2</indPres>
      <procEmi>0</procEmi>
      <verProc>SUP-TECNOLOGIA-4.00</verProc>
    </ide>
    <emit>
      <CNPJ>18236447000190</CNPJ>
      <xNome>SUP TECNOLOGIA EM SISTEMAS LTDA</xNome>
      <enderEmit>
        <xLgr>Avenida Paulista</xLgr>
        <nro>1374</nro>
        <xBairro>Bela Vista</xBairro>
        <cMun>3550308</cMun>
        <xMun>São Paulo</xMun>
        <UF>SP</UF>
        <CEP>01310100</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
      </enderEmit>
      <IE>114882901110</IE>
      <CRT>1</CRT>
    </emit>
  </inf${tipo}>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#${tipo}${chave}">
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${Buffer.from(`DIGEST-${chave}`).toString('base64').slice(0, 28)}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${Buffer.from(`SIGNATURE-${chave}`).toString('base64')}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${Buffer.from(`CERT-${chave}`).toString('base64').slice(0, 100)}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</${tipo}>`
}

// 🔥 BUSCA PAGINADA POR CURSOR COM LIMITE DE ITERAÇÕES E DE REGISTROS (CWE-770)
//    ✅ CORREÇÃO: só dispara erro se realmente não conseguimos buscar tudo o que foi pedido
async function buscarPaginadoPorCursor<T extends { id: string }>(
  buscar: (cursor: string | undefined, take: number) => Promise<T[]>,
  maxRegistros: number,
  pageSize: number = PAGE_SIZE
): Promise<T[]> {
  const todos: T[] = []
  let cursor: string | undefined = undefined
  let iteracoes = 0

  while (iteracoes < MAX_PAGE_ITERATIONS) {
    const restante = maxRegistros - todos.length
    if (restante <= 0) break

    const take = Math.min(pageSize, restante)
    const lote = await buscar(cursor, take)
    todos.push(...lote)

    if (lote.length < take) break

    cursor = lote[lote.length - 1].id
    iteracoes++
  }

  // Só dispara erro se realmente não conseguimos buscar tudo o que foi pedido
  if (todos.length < maxRegistros && iteracoes >= MAX_PAGE_ITERATIONS) {
    console.error('❌ Limite de iterações de paginação atingido (possível loop infinito).')
    process.exit(1)
  }

  return todos
}

// 🔥 PRÓXIMO NÚMERO COM LIMITE (evita crescimento descontrolado)
//    ✅ CORREÇÃO: usa aggregate(_max) em vez de findFirst + orderBy (evita full scan + sort)
// ✅ campoNumero: o nome da coluna varia por modelo (NFSe usa numeroNfse,
// CTe usa nCT — ver schema.prisma; os demais usam numero).
async function obterProximoNumero(
  model: 'nFe' | 'nFSe' | 'nFCe' | 'cTe' | 'nFAe',
  empresaId: string,
  base: number,
  campoNumero: string = 'numero'
): Promise<number> {
  const resultado = await (prisma[model] as any).aggregate({
    where: { empresaId },
    _max: { [campoNumero]: true },
  })

  const ultimoNumero: number | null = resultado?._max?.[campoNumero] ?? null
  const proximo = ultimoNumero !== null ? Math.max(ultimoNumero + 1, base) : base

  if (proximo > base + MAX_DOCS_POR_TIPO) {
    console.error(`❌ Limite de ${MAX_DOCS_POR_TIPO} documentos por tipo excedido para ${model}.`)
    process.exit(1)
  }

  return proximo
}

// 🔥 HELPER DE TRANSAÇÃO EM LOTES (defesa em profundidade contra locks excessivos)
async function criarEmLotes<T>(
  registros: T[],
  criar: (data: T) => Prisma.PrismaPromise<any>,
  tamanhoLote: number = PAGE_SIZE
): Promise<void> {
  for (let i = 0; i < registros.length; i += tamanhoLote) {
    const lote = registros.slice(i, i + tamanhoLote)
    await prisma.$transaction(lote.map(criar))
  }
}

async function main() {
  console.log('🌱 Iniciando seed fiscal...')

  // ============================================
  // 1. Buscar empresa e dados existentes
  // ============================================
  const empresa = await prisma.empresa.findFirst({
    where: { cnpj: CNPJ_EMPRESA_FISCAL },
    select: {
      id: true,
      razaoSocial: true,
      nomeFantasia: true,
      cnpj: true,
      inscricaoMunicipal: true,
      serieNfe: true,
      serieNfse: true,
      serieNfce: true,
      ambienteEmissao: true,
      endereco: {
        select: {
          logradouro: true,
          numero: true,
          bairro: true,
          codigoMunicipio: true,
          nomeMunicipio: true,
          uf: true,
          cep: true
        }
      }
    }
  })

  if (!empresa) {
    console.error('❌ Empresa não encontrada. Execute o seed principal primeiro.')
    process.exit(1)
  }

  console.log(`✅ Empresa encontrada: ${empresa.razaoSocial} (${empresa.id})`)

  if (!empresa.endereco) {
    console.error('❌ Empresa sem endereço. Execute o seed principal primeiro.')
    process.exit(1)
  }

  const codigoMunicipio = empresa.endereco.codigoMunicipio
  if (!codigoMunicipio || codigoMunicipio.length < 2) {
    console.error('❌ Empresa sem código de município válido no endereço.')
    process.exit(1)
  }

  // 🔥 BUSCAR COM PAGINAÇÃO + LIMITES
  console.log('\n🔍 Buscando dados com paginação...')

  const clientes = await buscarPaginadoPorCursor(
    (cursor, take) =>
      prisma.cliente.findMany({
        where: { empresaId: empresa.id },
        include: { endereco: true },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' }
      }),
    MAX_CLIENTES
  )

  if (clientes.length === 0) {
    console.error('❌ Nenhum cliente encontrado. Execute o seed principal primeiro.')
    process.exit(1)
  }
  console.log(`✅ ${clientes.length} clientes encontrados`)

  const produtos = await buscarPaginadoPorCursor(
    (cursor, take) =>
      prisma.produto.findMany({
        where: { empresaId: empresa.id },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' }
      }),
    MAX_PRODUTOS
  )

  if (produtos.length === 0) {
    console.error('❌ Nenhum produto encontrado. Execute o seed principal primeiro.')
    process.exit(1)
  }
  console.log(`✅ ${produtos.length} produtos encontrados`)

  const servicos = await buscarPaginadoPorCursor(
    (cursor, take) =>
      prisma.servico.findMany({
        where: { empresaId: empresa.id },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' }
      }),
    MAX_SERVICOS
  )

  if (servicos.length === 0) {
    console.error('❌ Nenhum serviço encontrado. Execute o seed principal primeiro.')
    process.exit(1)
  }
  console.log(`✅ ${servicos.length} serviços encontrados`)

  const transportadoras = await buscarPaginadoPorCursor(
    (cursor, take) =>
      prisma.transportadora.findMany({
        where: { empresaId: empresa.id },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' }
      }),
    MAX_TRANSPORTADORAS
  )
  console.log(`✅ ${transportadoras.length} transportadoras encontradas`)

  const codigoUf = codigoMunicipio.slice(0, 2) || '35'

  // ============================================
  // 2. Criar NF-e (Modelo 55) - 10 notas
  // ============================================
  console.log('\n📄 Gerando NF-e...')

  let numeroNfe = await obterProximoNumero('nFe', empresa.id, 100)
  const nfeData: any[] = []

  for (let i = 0; i < 10; i++) {
    const cliente = clientes[i % clientes.length]
    const numItens = Math.min(Math.floor(Math.random() * 4) + 1, MAX_ITENS_POR_NOTA)
    const itens = []

    let valorTotalProdutos = 0
    let baseCalculoICMS = 0
    let valorTotalICMS = 0
    let valorTotalPIS = 0
    let valorTotalCOFINS = 0
    let valorTotalIPI = 0
    let valorTotalTributosAprox = 0

    for (let j = 0; j < numItens; j++) {
      const prod = produtos[j % produtos.length]
      const qtd = Math.floor(Math.random() * 5) + 1
      const valorUnit = Number(prod.precoVenda) * (0.9 + Math.random() * 0.2)
      const total = qtd * valorUnit
      const icms = total * (Number(prod.aliquotaICMS) / 100)
      const pis = total * (Number(prod.aliquotaPIS) / 100)
      const cofins = total * (Number(prod.aliquotaCOFINS) / 100)
      const ipi = total * (Number(prod.aliquotaIPI || 0) / 100)
      const tributosAprox = total * 0.314

      valorTotalProdutos += total
      baseCalculoICMS += total
      valorTotalICMS += icms
      valorTotalPIS += pis
      valorTotalCOFINS += cofins
      valorTotalIPI += ipi
      valorTotalTributosAprox += tributosAprox

      // ✅ Nomes de campo do schema real do ItemNFe (vProd/pICMS/vBC/vTotTrib
      // etc., não os nomes "amigáveis" de uma versão anterior do modelo — ver
      // o create real em nfe.service.ts:emitirNfe).
      const itemData: any = {
        codigoProduto: prod.codigo,
        descricao: prod.descricao,
        ncm: prod.ncm,
        cest: prod.cest,
        cfop: prod.cfopPadrao,
        unidadeMedida: prod.unidade,
        quantidade: qtd,
        valorUnitario: Number(valorUnit.toFixed(2)),
        vProd: Number(total.toFixed(2)),
        origemMercadoria: '0',
        cstICMS: '00',
        pICMS: prod.aliquotaICMS,
        vBC: Number(total.toFixed(2)),
        vICMS: Number(icms.toFixed(2)),
        cstPIS: '01',
        pPIS: prod.aliquotaPIS,
        vPIS: Number(pis.toFixed(2)),
        cstCOFINS: '01',
        pCOFINS: prod.aliquotaCOFINS,
        vCOFINS: Number(cofins.toFixed(2)),
        vTotTrib: Number(tributosAprox.toFixed(2))
      }

      if (prod.aliquotaIPI) {
        itemData.cstIPI = '50'
        itemData.pIPI = prod.aliquotaIPI
        itemData.vIPI = Number(ipi.toFixed(2))
      }

      itens.push(itemData)
    }

    const valorTotalNota = Number((valorTotalProdutos + valorTotalIPI).toFixed(2))
    const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0')

    const { chaveCompleta, codigoNumerico: cNF, dv } = gerarChaveAcessoNFe({
      codigoUf,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '55',
      serie: empresa.serieNfe || 1,
      numero: numeroNfe,
      tipoEmissao: 1,
    })

    const dataEmissao = gerarDataAleatoria(90)
    const tpAmbNum = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2

    // ✅ Nomes/tipos de campo do schema real da NFe (natOp/tpNF/idDest/vBC/vNF
    // etc., em vez dos nomes "amigáveis" de uma versão anterior do modelo —
    // ver o create real em nfe.service.ts:emitirNfe). formaPagamento não é
    // persistido como coluna própria da NFe (fica no relacionamento
    // PagamentoNFe, não criado aqui por simplicidade do seed).
    nfeData.push({
      modelo: '55',
      cUF: codigoUf,
      cNF,
      serie: empresa.serieNfe || 1,
      numero: numeroNfe,
      chaveAcesso: chaveCompleta,
      natOp: i % 2 === 0 ? 'Venda de Mercadorias' : 'Venda para Consumo',
      indPag: '0',
      dhEmi: dataEmissao,
      dhSaiEnt: dataEmissao,
      tpNF: '1',
      idDest: '1',
      cMunFG: codigoMunicipio,
      tpImp: '1',
      tpEmis: '1',
      cDV: String(dv),
      tpAmb: String(tpAmbNum),
      finNFe: '1',
      indFinal: i % 3 === 0 ? '1' : '0',
      indPres: '2',
      procEmi: '0',
      verProc: 'SUP-TECNOLOGIA-4.00',
      status: i % 8 === 0 ? 'CANCELADA' : 'AUTORIZADA',
      vProd: Number(valorTotalProdutos.toFixed(2)),
      vBC: Number(baseCalculoICMS.toFixed(2)),
      vICMS: Number(valorTotalICMS.toFixed(2)),
      vIPI: Number(valorTotalIPI.toFixed(2)),
      vPIS: Number(valorTotalPIS.toFixed(2)),
      vCOFINS: Number(valorTotalCOFINS.toFixed(2)),
      vIBS: Number((valorTotalProdutos * 0.01).toFixed(2)),
      vCBS: Number((valorTotalProdutos * 0.009).toFixed(2)),
      vTotTrib: Number(valorTotalTributosAprox.toFixed(2)),
      vNF: valorTotalNota,
      infCpl: 'Emitido via SUP TECNOLOGIA ERP',
      protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
      dataHoraAutorizacao: dataEmissao,
      xmlAssinado: gerarXmlAssinado('NFe', numeroNfe, chaveCompleta),
      empresaId: empresa.id,
      destinatarioId: cliente.id,
      itens: { create: itens },
      duplicatas: {
        create: [{
          numero: `${numeroNfe}/01`,
          dataVencimento: new Date(dataEmissao.getTime() + 30 * 24 * 60 * 60 * 1000),
          valor: valorTotalNota,
          status: 'PENDENTE'
        }]
      },
      transporte: {
        create: {
          modalidadeFrete: '0',
          transportadoraNome: transportadoras[i % transportadoras.length]?.razaoSocial || 'Transportadora Padrão',
          transportadoraCnpj: transportadoras[i % transportadoras.length]?.cnpj || '00.000.000/0000-00',
          veiculoPlaca: `BRA${String(1000 + i * 123).slice(0, 4)}`,
          veiculoUf: 'SP',
          volumesQuantidade: numItens,
          volumesEspecie: 'VOLUMES',
          volumesPesoLiquido: Number((Math.random() * 100 + 10).toFixed(1)),
          volumesPesoBruto: Number((Math.random() * 120 + 15).toFixed(1))
        }
      }
    })

    numeroNfe++
  }

  // ✅ CORREÇÃO: transação em lotes (defesa em profundidade)
  await criarEmLotes(nfeData, (data) => prisma.nFe.create({ data }))

  console.log(`✅ 10 NF-e criadas`)

  // ============================================
  // 3. Criar NFS-e (Padrão Nacional) - 10 notas
  // ============================================
  console.log('\n📄 Gerando NFS-e...')

  let numeroNfse = await obterProximoNumero('nFSe', empresa.id, 100, 'numeroNfse')
  const nfseData: any[] = []

  for (let i = 0; i < 10; i++) {
    const cliente = clientes[(i + 3) % clientes.length]
    const servico = servicos[i % servicos.length]
    const valorServico = Number(servico.valorUnitario) * (0.8 + Math.random() * 0.4)
    const aliquotaISS = Number(servico.aliquotaISS) || 5.0
    const baseISS = valorServico
    const valorISS = baseISS * (aliquotaISS / 100)
    const valorPIS = valorServico * (Number(servico.aliquotaPIS) / 100)
    const valorCOFINS = valorServico * (Number(servico.aliquotaCOFINS) / 100)
    const valorIRRF = valorServico * (Number(servico.aliquotaIRRF) / 100)
    const valorCSLL = valorServico * (Number(servico.aliquotaCSLL) / 100)
    const valorLiquido = valorServico - valorISS - valorPIS - valorCOFINS - valorIRRF - valorCSLL

    const dataEmissao = gerarDataAleatoria(60)

    const { chaveCompleta, codigoVerificacao } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: codigoMunicipio,
      ambienteGerador: 1,
      tipoInscricao: 1,
      documentoEmitente: empresa.cnpj,
      numeroNfse,
      anoMesDPS: new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0'),
    })

    // ✅ Nomes de campo do schema real da NFSe: sem sub-objetos emitente/
    // tomador — são colunas soltas prestador*/tomador* na própria tabela
    // (ver model NFSe no schema.prisma).
    nfseData.push({
      chaveAcesso: chaveCompleta,
      numeroNfse,
      serieDPS: empresa.serieNfse || 1,
      numeroDPS: numeroNfse,
      dataCompetencia: dataEmissao,
      dataHoraEmissao: dataEmissao,
      dataHoraProcessamento: dataEmissao,
      codigoVerificacao,
      ambiente: empresa.ambienteEmissao || 'HOMOLOGACAO',
      tipoEmissao: '1',
      status: i % 8 === 0 ? 'CANCELADA' : 'AUTORIZADA',

      prestadorCnpj: empresa.cnpj,
      prestadorInscricaoMunicipal: empresa.inscricaoMunicipal || '00000000',
      prestadorRazaoSocial: empresa.razaoSocial,
      prestadorNomeFantasia: empresa.nomeFantasia,
      prestadorLogradouro: empresa.endereco.logradouro,
      prestadorNumero: empresa.endereco.numero,
      prestadorBairro: empresa.endereco.bairro,
      prestadorCodigoMunicipio: empresa.endereco.codigoMunicipio,
      prestadorNomeMunicipio: empresa.endereco.nomeMunicipio,
      prestadorUf: empresa.endereco.uf,
      prestadorCep: empresa.endereco.cep,

      tomadorTipoPessoa: cliente.tipoPessoa === 'PF' ? 'PF' : 'PJ',
      tomadorDocumento: cliente.documento,
      tomadorRazaoSocial: cliente.razaoSocial,
      tomadorLogradouro: cliente.endereco?.logradouro || '',
      tomadorNumero: cliente.endereco?.numero || 'S/N',
      tomadorBairro: cliente.endereco?.bairro || '',
      tomadorCodigoMunicipio: cliente.endereco?.codigoMunicipio || codigoMunicipio,
      tomadorNomeMunicipio: cliente.endereco?.nomeMunicipio || '',
      tomadorUf: cliente.endereco?.uf || empresa.endereco.uf,
      tomadorCep: cliente.endereco?.cep || '',

      codigoTributacaoNacional: servico.codigoTributacaoNacional || '010701',
      codigoTributacaoMunicipal: servico.codigoTributacaoMunicipal || '0107',
      descricaoServico: servico.descricao,
      codigoNBS: servico.codigoNBS || '112202000',

      localPrestacaoCodigoMunicipio: empresa.endereco.codigoMunicipio,
      localPrestacaoNomeMunicipio: empresa.endereco.nomeMunicipio,
      localPrestacaoUf: empresa.endereco.uf,

      valorServico: Number(valorServico.toFixed(2)),
      valorTotalServicos: Number(valorServico.toFixed(2)),
      valorTotalDescontos: 0,
      valorTotalDeducoes: 0,
      baseCalculoISS: Number(baseISS.toFixed(2)),
      valorTotalISS: Number(valorISS.toFixed(2)),
      valorTotalISSRetido: i % 3 === 0 ? Number(valorISS.toFixed(2)) : 0,
      valorTotalRetencoesFederais: Number((valorPIS + valorCOFINS + valorIRRF + valorCSLL).toFixed(2)),
      valorTotalIBS: Number((valorServico * 0.01).toFixed(2)),
      valorLiquidoNfse: Number(valorLiquido.toFixed(2)),
      valorTotalNotaFinal: Number(valorLiquido.toFixed(2)),
      informacoesComplementares: 'Documento emitido via SUP TECNOLOGIA ERP - NFS-e Padrão Nacional',
      xmlAssinado: gerarXmlAssinado('NFSe', numeroNfse, chaveCompleta),
      urlVisualizacaoNacional: 'https://www.nfse.gov.br/consultapublica',
      empresaId: empresa.id,
      tomadorId: cliente.id,
      servicoId: servico.id,
      tributacaoISSQN: 1,
      tipoRetencaoISS: i % 3 === 0 ? 2 : 1,
      aliquotaISS,
      valorISS: Number(valorISS.toFixed(2)),
      aliquotaPIS: servico.aliquotaPIS,
      valorPIS: Number(valorPIS.toFixed(2)),
      retidoPIS: false,
      aliquotaCOFINS: servico.aliquotaCOFINS,
      valorCOFINS: Number(valorCOFINS.toFixed(2)),
      retidoCOFINS: false,
      aliquotaIRRF: servico.aliquotaIRRF,
      valorIRRF: Number(valorIRRF.toFixed(2)),
      aliquotaCSLL: servico.aliquotaCSLL,
      valorCSLL: Number(valorCSLL.toFixed(2)),
      aliquotaINSS: servico.aliquotaINSS || 0,
      valorINSS: 0,
      aliquotaIBSUF: 0.05,
      valorIBSUF: Number((valorServico * 0.0005).toFixed(2)),
      aliquotaIBSMun: 0.05,
      valorIBSMun: Number((valorServico * 0.0005).toFixed(2)),
      aliquotaCBS: 0.90,
      valorCBS: Number((valorServico * 0.009).toFixed(2))
    })

    numeroNfse++
  }

  // ✅ CORREÇÃO: transação em lotes
  await criarEmLotes(nfseData, (data) => prisma.nFSe.create({ data }))

  console.log(`✅ 10 NFS-e criadas`)

  // ============================================
  // 4. Criar NFC-e (Modelo 65) - 5 notas
  // ============================================
  console.log('\n📄 Gerando NFC-e...')

  let numeroNfce = await obterProximoNumero('nFCe', empresa.id, 100)
  const nfceData: any[] = []

  for (let i = 0; i < 5; i++) {
    const cliente = clientes[(i + 5) % clientes.length]
    const numItens = Math.min(Math.floor(Math.random() * 3) + 1, MAX_ITENS_POR_NOTA)
    const itens = []
    let valorTotalProdutos = 0
    let valorTotalTributosAprox = 0

    for (let j = 0; j < numItens; j++) {
      const prod = produtos[(j + 2) % produtos.length]
      const qtd = Math.floor(Math.random() * 3) + 1
      const total = qtd * Number(prod.precoVenda)
      const icms = total * (Number(prod.aliquotaICMS) / 100)
      const pis = total * (Number(prod.aliquotaPIS) / 100)
      const cofins = total * (Number(prod.aliquotaCOFINS) / 100)

      valorTotalProdutos += total
      valorTotalTributosAprox += total * 0.314

      itens.push({
        codigoProduto: prod.codigo,
        descricao: prod.descricao,
        ncm: prod.ncm,
        cest: prod.cest,
        cfop: '5102',
        unidadeMedida: prod.unidade,
        quantidade: qtd,
        valorUnitario: prod.precoVenda,
        valorTotalBruto: Number(total.toFixed(2)),
        cstICMS: '00',
        aliquotaICMS: prod.aliquotaICMS,
        baseCalculoICMS: Number(total.toFixed(2)),
        valorICMS: Number(icms.toFixed(2)),
        cstPIS: '01',
        aliquotaPIS: prod.aliquotaPIS,
        valorPIS: Number(pis.toFixed(2)),
        cstCOFINS: '01',
        aliquotaCOFINS: prod.aliquotaCOFINS,
        valorCOFINS: Number(cofins.toFixed(2)),
        valorTributosAprox: Number((total * 0.314).toFixed(2))
      })
    }

    const valorTotalNota = Number(valorTotalProdutos.toFixed(2))
    const dataEmissao = gerarDataAleatoria(30)
    const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0')

    const { chaveCompleta: chaveAcesso } = gerarChaveAcessoNFe({
      codigoUf,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '65',
      serie: empresa.serieNfce || 1,
      numero: numeroNfce,
      tipoEmissao: 1,
    })

    nfceData.push({
      modelo: '65',
      serie: empresa.serieNfce || 1,
      numero: numeroNfce,
      chaveAcesso,
      dataHoraEmissao: dataEmissao,
      naturezaOperacao: 'Venda a Consumidor Final',
      ambiente: empresa.ambienteEmissao || 'HOMOLOGACAO',
      tipoEmissao: '1',
      status: i % 5 === 0 ? 'CANCELADA' : 'AUTORIZADA',
      consumidorIdentificado: i % 2 === 0,
      consumidorCpfCnpj: i % 2 === 0 ? cliente.documento : null,
      consumidorNome: i % 2 === 0 ? cliente.razaoSocial : null,
      valorTotalProdutos: valorTotalNota,
      valorTotalDesconto: 0,
      valorTotalAcrescimo: 0,
      valorTotalTributosAprox: Number(valorTotalTributosAprox.toFixed(2)),
      valorTotalNota,
      formaPagamento: i % 2 === 0 ? '17' : '03',
      valorPago: valorTotalNota,
      valorTroco: 0,
      urlQrCode: `https://www.nfce.fazenda.gov.br/qrcode?p=${Math.random().toString(36).substring(7)}`,
      tokenCscId: '000001',
      protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
      dataHoraAutorizacao: dataEmissao,
      xmlAssinado: gerarXmlAssinado('NFCe', numeroNfce, chaveAcesso),
      empresaId: empresa.id,
      consumidorId: i % 2 === 0 ? cliente.id : null,
      itens: { create: itens }
    })

    numeroNfce++
  }

  // ✅ CORREÇÃO: transação em lotes
  await criarEmLotes(nfceData, (data) => prisma.nFCe.create({ data }))

  console.log(`✅ 5 NFC-e criadas`)

  // ============================================
  // 5. Criar CT-e (Modelo 57) - 5 notas
  // ============================================
  console.log('\n📄 Gerando CT-e...')

  let numeroCte = await obterProximoNumero('cTe', empresa.id, 100, 'nCT')
  const cteData: any[] = []

  for (let i = 0; i < 5; i++) {
    const remetente = clientes[(i + 2) % clientes.length]
    const destinatario = clientes[(i + 4) % clientes.length]
    const transportadora = transportadoras[i % transportadoras.length]
    const valorFrete = gerarValor(500, 3000)
    const peso = gerarValor(100, 500)
    const valorCarga = gerarValor(10000, 50000)

    const dataEmissao = gerarDataAleatoria(45)
    const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0')

    const { chaveCompleta: chaveAcesso, codigoNumerico: cCT, dv: cDV } = gerarChaveAcessoNFe({
      codigoUf,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '57',
      serie: 1,
      numero: numeroCte,
      tipoEmissao: 1,
    })

    // ✅ ALINHADO AO SCHEMA REAL DO CTe (nomes/tipos de campo do leiaute SEFAZ,
    // não os nomes simplificados de uma versão antiga do modelo). Veículo/
    // condutor não existem no CT-e 4.00 — migraram para o MDF-e (ver
    // comentário do model CTe no schema.prisma); RNTRC vem da Transportadora.
    cteData.push({
      cUF: codigoUf,
      cCT,
      CFOP: '6353',
      natOp: 'Prestação de Serviço de Transporte de Cargas',
      mod: '57',
      serie: 1,
      nCT: numeroCte,
      dhEmi: dataEmissao,
      tpImp: '1',
      tpEmis: '1',
      cDV: String(cDV),
      tpAmb: empresa.ambienteEmissao === 'PRODUCAO' ? '1' : '2',
      tpCTe: 'NORMAL',
      procEmi: '0',
      verProc: 'SEED-1.0',
      cMunEnv: codigoMunicipio,
      xMunEnv: 'Sao Paulo',
      UFEnv: 'SP',
      modal: 'RODOVIARIO',
      tpServ: 'NORMAL',
      cMunIni: codigoMunicipio,
      xMunIni: 'Sao Paulo',
      UFIni: 'SP',
      cMunFim: '3304557',
      xMunFim: 'Rio de Janeiro',
      UFFim: 'RJ',
      retira: '1',
      indIEToma: 'NAO_CONTRIBUINTE',
      toma: 'REMETENTE',
      vTPrest: Number(valorFrete.toFixed(2)),
      vRec: Number(valorFrete.toFixed(2)),
      CST00: '00',
      vBC00: Number(valorFrete.toFixed(2)),
      pICMS00: 12.0,
      vICMS00: Number((valorFrete * 0.12).toFixed(2)),
      vCarga: Number(valorCarga.toFixed(2)),
      proPred: 'Equipamentos Eletrônicos',
      vCargaAverb: Number(valorCarga.toFixed(2)),
      nFat: String(numeroCte),
      vOrig: Number(valorFrete.toFixed(2)),
      vLiq: Number(valorFrete.toFixed(2)),
      status: i % 5 === 0 ? 'CANCELADA' : 'AUTORIZADA',
      chaveAcesso,
      xmlAssinado: gerarXmlAssinado('CTe', numeroCte, chaveAcesso),
      empresaId: empresa.id,
      emitenteId: empresa.id,
      remetenteId: remetente.id,
      destinatarioId: destinatario.id,
      transportadoraId: transportadora?.id,
      quantidades: {
        create: [{ cUnid: '01', tpMed: 'PESO BRUTO', qCarga: Number(peso.toFixed(4)) }]
      }
    })

    numeroCte++
  }

  // ✅ CORREÇÃO: transação em lotes
  await criarEmLotes(cteData, (data) => prisma.cTe.create({ data }))

  console.log(`✅ 5 CT-e criados`)

  console.log('\n========================================')
  console.log('RESUMO DO SEED FISCAL')
  console.log('========================================')
  console.log('10 NF-e, 10 NFS-e, 5 NFC-e e 5 CT-e criados com sucesso!')
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('Erro no seed fiscal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })