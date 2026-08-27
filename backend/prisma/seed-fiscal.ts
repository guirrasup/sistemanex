// prisma/seed-fiscal.ts
import { PrismaClient } from '@prisma/client'
import { gerarChaveAcessoNFe, gerarChaveAcessoNFSe } from '../src/utils/chaveAcesso.js'

const prisma = new PrismaClient()

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
  return `<?xml version="1.0" encoding="UTF-8"?>
<${tipo} xmlns="http://www.portalfiscal.inf.br/${tipo.toLowerCase()}">
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

async function main() {
  console.log('🌱 Iniciando seed fiscal...')

  // ============================================
  // 1. Buscar empresa e dados existentes
  // ============================================
  // 🔥 INCLUIR ENDERECO NA BUSCA
  const empresa = await prisma.empresa.findFirst({
    where: { cnpj: '18.236.447/0001-90' },
    include: {
      endereco: true // 🔥 ESSENCIAL!
    }
  })

  if (!empresa) {
    console.error('❌ Empresa não encontrada. Execute o seed principal primeiro.')
    process.exit(1)
  }

  console.log(`✅ Empresa encontrada: ${empresa.razaoSocial} (${empresa.id})`)

  // 🔥 GARANTIR QUE ENDERECO EXISTE
  if (!empresa.endereco) {
    console.error('❌ Empresa sem endereço. Execute o seed principal primeiro.')
    process.exit(1)
  }

  // Buscar clientes
  const clientes = await prisma.cliente.findMany({
    where: { empresaId: empresa.id },
    include: { endereco: true }
  })

  if (clientes.length === 0) {
    console.error('❌ Nenhum cliente encontrado. Execute o seed principal primeiro.')
    process.exit(1)
  }

  console.log(`✅ ${clientes.length} clientes encontrados`)

  // Buscar produtos
  const produtos = await prisma.produto.findMany({
    where: { empresaId: empresa.id }
  })

  console.log(`✅ ${produtos.length} produtos encontrados`)

  // Buscar serviços
  const servicos = await prisma.servico.findMany({
    where: { empresaId: empresa.id }
  })

  console.log(`✅ ${servicos.length} serviços encontrados`)

  // Buscar transportadoras
  const transportadoras = await prisma.transportadora.findMany({
    where: { empresaId: empresa.id }
  })

  console.log(`✅ ${transportadoras.length} transportadoras encontradas`)

  // 🔥 CODIGO UF PARA CHAVES
  const codigoUf = empresa.endereco.codigoMunicipio.slice(0, 2) || '35'

  // ============================================
  // 2. Criar NF-e (Modelo 55) - 10 notas
  // ============================================
  console.log('\n📄 Gerando NF-e...')

  const nfeCount = await prisma.nFe.count({ where: { empresaId: empresa.id } })
  let numeroNfe = 100 + nfeCount

  for (let i = 0; i < 10; i++) {
    const cliente = clientes[i % clientes.length]
    const numItens = Math.floor(Math.random() * 4) + 1
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
      const valorUnit = prod.precoVenda * (0.9 + Math.random() * 0.2)
      const total = qtd * valorUnit
      const icms = total * (prod.aliquotaICMS / 100)
      const pis = total * (prod.aliquotaPIS / 100)
      const cofins = total * (prod.aliquotaCOFINS / 100)
      const ipi = total * ((prod.aliquotaIPI || 0) / 100)
      const tributosAprox = total * 0.314

      valorTotalProdutos += total
      baseCalculoICMS += total
      valorTotalICMS += icms
      valorTotalPIS += pis
      valorTotalCOFINS += cofins
      valorTotalIPI += ipi
      valorTotalTributosAprox += tributosAprox

      const itemData: any = {
        codigoProduto: prod.codigo,
        descricao: prod.descricao,
        ncm: prod.ncm,
        cest: prod.cest,
        cfop: prod.cfopPadrao,
        unidadeMedida: prod.unidade,
        quantidade: qtd,
        valorUnitario: Number(valorUnit.toFixed(2)),
        valorTotalBruto: Number(total.toFixed(2)),
        origemMercadoria: 0,
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
        valorTributosAprox: Number(tributosAprox.toFixed(2))
      }

      if (prod.aliquotaIPI) {
        itemData.cstIPI = '50'
        itemData.aliquotaIPI = prod.aliquotaIPI
        itemData.valorIPI = Number(ipi.toFixed(2))
      }

      itens.push(itemData)
    }

    const valorTotalNota = Number((valorTotalProdutos + valorTotalIPI).toFixed(2))
    const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0')

    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: codigoUf,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '55',
      serie: empresa.serieNfe || 1,
      numero: numeroNfe,
      tipoEmissao: 1,
    })

    const dataEmissao = gerarDataAleatoria(90)

    await prisma.nFe.create({
      data: {
        modelo: '55',
        serie: empresa.serieNfe || 1,
        numero: numeroNfe,
        chaveAcesso: chaveCompleta,
        dataHoraEmissao: dataEmissao,
        dataHoraSaida: dataEmissao,
        naturezaOperacao: i % 2 === 0 ? 'Venda de Mercadorias' : 'Venda para Consumo',
        ambiente: empresa.ambienteEmissao || 1,
        tipoEmissao: 1,
        tipoDocumento: 1,
        finalidade: 1,
        consumidorFinal: i % 3 === 0,
        presencaComprador: 2,
        status: i % 8 === 0 ? 'CANCELADA' : 'AUTORIZADA',
        valorTotalProdutos: Number(valorTotalProdutos.toFixed(2)),
        valorTotalFrete: 0,
        valorTotalSeguro: 0,
        valorTotalDesconto: 0,
        valorTotalOutrasDesp: 0,
        baseCalculoICMS: Number(baseCalculoICMS.toFixed(2)),
        valorTotalICMS: Number(valorTotalICMS.toFixed(2)),
        baseCalculoICMSST: 0,
        valorTotalICMSST: 0,
        valorTotalIPI: Number(valorTotalIPI.toFixed(2)),
        valorTotalPIS: Number(valorTotalPIS.toFixed(2)),
        valorTotalCOFINS: Number(valorTotalCOFINS.toFixed(2)),
        valorTotalIBS: Number((valorTotalProdutos * 0.01).toFixed(2)),
        valorTotalCBS: Number((valorTotalProdutos * 0.009).toFixed(2)),
        valorTotalTributosAprox: Number(valorTotalTributosAprox.toFixed(2)),
        valorTotalNota: valorTotalNota,
        formaPagamento: i % 3 === 0 ? '17' : i % 3 === 1 ? '03' : '01',
        informacoesAdicionais: 'Emitido via SUP TECNOLOGIA ERP',
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
            modalidadeFrete: 0,
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
      }
    })

    numeroNfe++
  }

  console.log(`✅ 10 NF-e criadas`)

  // ============================================
  // 3. Criar NFS-e (Padrão Nacional) - 10 notas
  // ============================================
  console.log('\n📄 Gerando NFS-e...')

  const nfseCount = await prisma.nFSe.count({ where: { empresaId: empresa.id } })
  let numeroNfse = 100 + nfseCount

  for (let i = 0; i < 10; i++) {
    const cliente = clientes[(i + 3) % clientes.length]
    const servico = servicos[i % servicos.length]
    const valorServico = servico.valorUnitario * (0.8 + Math.random() * 0.4)
    const aliquotaISS = servico.aliquotaISS || 5.0
    const baseISS = valorServico
    const valorISS = baseISS * (aliquotaISS / 100)
    const valorPIS = valorServico * (servico.aliquotaPIS / 100)
    const valorCOFINS = valorServico * (servico.aliquotaCOFINS / 100)
    const valorIRRF = valorServico * (servico.aliquotaIRRF / 100)
    const valorCSLL = valorServico * (servico.aliquotaCSLL / 100)
    const valorLiquido = valorServico - valorISS - valorPIS - valorCOFINS - valorIRRF - valorCSLL

    const dataEmissao = gerarDataAleatoria(60)

    const { chaveCompleta, codigoVerificacao } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: empresa.endereco.codigoMunicipio,
      ambienteGerador: 1,
      tipoInscricao: 1,
      documentoEmitente: empresa.cnpj,
      numeroNfse: numeroNfse,
      anoMesDPS: new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0'),
    })

    await prisma.nFSe.create({
      data: {
        chaveAcesso: chaveCompleta,
        numeroNfse: numeroNfse,
        serieDPS: empresa.serieNfse || 1,
        numeroDPS: numeroNfse,
        dataCompetencia: dataEmissao,
        dataHoraEmissao: dataEmissao,
        dataHoraProcessamento: dataEmissao,
        codigoVerificacao: codigoVerificacao,
        ambiente: empresa.ambienteEmissao || 1,
        tipoEmissao: 1,
        status: i % 8 === 0 ? 'CANCELADA' : 'AUTORIZADA',
        valorTotalServicos: Number(valorServico.toFixed(2)),
        valorTotalDescontos: 0,
        valorTotalDeducoes: 0,
        baseCalculoISS: Number(baseISS.toFixed(2)),
        valorTotalISS: Number(valorISS.toFixed(2)),
        valorTotalISSRetido: i % 3 === 0 ? Number(valorISS.toFixed(2)) : 0,
        valorTotalRetencoesFed: Number((valorPIS + valorCOFINS + valorIRRF + valorCSLL).toFixed(2)),
        valorTotalIBS: Number((valorServico * 0.01).toFixed(2)),
        valorTotalCBS: Number((valorServico * 0.009).toFixed(2)),
        valorLiquidoNfse: Number(valorLiquido.toFixed(2)),
        valorTotalNotaFinal: Number(valorLiquido.toFixed(2)),
        informacoesComplementares: 'Documento emitido via SUP TECNOLOGIA ERP - NFS-e Padrão Nacional',
        xmlAssinado: gerarXmlAssinado('NFSe', numeroNfse, chaveCompleta),
        urlVisualizacao: 'https://www.nfse.gov.br/consultapublica',
        empresaId: empresa.id,
        tomadorId: cliente.id,
        servicoId: servico.id,
        tributacaoISSQN: 1,
        tipoRetencaoISS: i % 3 === 0 ? 2 : 1,
        aliquotaISS: aliquotaISS,
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
      }
    })

    numeroNfse++
  }

  console.log(`✅ 10 NFS-e criadas`)

  // ============================================
  // 4. Criar NFC-e (Modelo 65) - 5 notas
  // ============================================
  console.log('\n📄 Gerando NFC-e...')

  const nfceCount = await prisma.nFCe.count({ where: { empresaId: empresa.id } })
  let numeroNfce = 100 + nfceCount

  for (let i = 0; i < 5; i++) {
    const cliente = clientes[(i + 5) % clientes.length]
    const numItens = Math.floor(Math.random() * 3) + 1
    const itens = []
    let valorTotalProdutos = 0
    let valorTotalTributosAprox = 0

    for (let j = 0; j < numItens; j++) {
      const prod = produtos[(j + 2) % produtos.length]
      const qtd = Math.floor(Math.random() * 3) + 1
      const total = qtd * prod.precoVenda
      const icms = total * (prod.aliquotaICMS / 100)
      const pis = total * (prod.aliquotaPIS / 100)
      const cofins = total * (prod.aliquotaCOFINS / 100)

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
      codigoUf: codigoUf,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '65',
      serie: empresa.serieNfce || 1,
      numero: numeroNfce,
      tipoEmissao: 1,
    })

    await prisma.nFCe.create({
      data: {
        modelo: '65',
        serie: empresa.serieNfce || 1,
        numero: numeroNfce,
        chaveAcesso: chaveAcesso,
        dataHoraEmissao: dataEmissao,
        naturezaOperacao: 'Venda a Consumidor Final',
        ambiente: empresa.ambienteEmissao || 1,
        tipoEmissao: 1,
        status: i % 5 === 0 ? 'CANCELADA' : 'AUTORIZADA',
        consumidorIdentificado: i % 2 === 0,
        consumidorCpfCnpj: i % 2 === 0 ? cliente.documento : null,
        consumidorNome: i % 2 === 0 ? cliente.razaoSocial : null,
        valorTotalProdutos: valorTotalNota,
        valorTotalDesconto: 0,
        valorTotalAcrescimo: 0,
        valorTotalTributosAprox: Number(valorTotalTributosAprox.toFixed(2)),
        valorTotalNota: valorTotalNota,
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
      }
    })

    numeroNfce++
  }

  console.log(`✅ 5 NFC-e criadas`)

  // ============================================
  // 5. Criar CT-e (Modelo 57) - 5 notas
  // ============================================
  console.log('\n📄 Gerando CT-e...')

  const cteCount = await prisma.cTe.count({ where: { empresaId: empresa.id } })
  let numeroCte = 100 + cteCount

  for (let i = 0; i < 5; i++) {
    const remetente = clientes[(i + 2) % clientes.length]
    const destinatario = clientes[(i + 4) % clientes.length]
    const transportadora = transportadoras[i % transportadoras.length]
    const valorFrete = gerarValor(500, 3000)
    const peso = gerarValor(100, 500)

    const dataEmissao = gerarDataAleatoria(45)

    const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0')

    const { chaveCompleta: chaveAcesso } = gerarChaveAcessoNFe({
      codigoUf: codigoUf,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '57',
      serie: 1,
      numero: numeroCte,
      tipoEmissao: 1,
    })

    await prisma.cTe.create({
      data: {
        modelo: '57',
        serie: 1,
        numero: numeroCte,
        chaveAcesso: chaveAcesso,
        dataHoraEmissao: dataEmissao,
        naturezaOperacao: 'Prestação de Serviço de Transporte Rodoviário de Cargas',
        cfop: '6353',
        ambiente: empresa.ambienteEmissao || 1,
        tipoEmissao: 1,
        status: i % 5 === 0 ? 'CANCELADA' : 'AUTORIZADA',
        remetenteId: remetente.id,
        destinatarioId: destinatario.id,
        tomadorServico: 0,
        municipioInicioCod: '3550308',
        municipioInicioNome: 'São Paulo',
        municipioInicioUf: 'SP',
        municipioFimCod: '3304557',
        municipioFimNome: 'Rio de Janeiro',
        municipioFimUf: 'RJ',
        produtoPredominante: 'Equipamentos Eletrônicos',
        valorCargaAverbada: gerarValor(10000, 50000),
        pesoBrutoKg: Number(peso.toFixed(1)),
        pesoLiquidoKg: Number((peso * 0.9).toFixed(1)),
        quantidadeVolumes: Math.floor(Math.random() * 10) + 1,
        especieVolumes: 'Caixas',
        cubagemM3: Number((Math.random() * 5 + 1).toFixed(2)),
        chavesNFeTransportadas: JSON.stringify(['35260818236447000190550010000010411123456784']),
        rntrc: transportadora?.rntrc || '1234567',
        veiculoPlaca: `BRA${String(1000 + i * 123).slice(0, 4)}`,
        veiculoUf: 'SP',
        motoristaNome: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Souza'][i],
        motoristaCpf: ['123.456.789-00', '987.654.321-00', '456.789.123-00', '789.123.456-00', '321.654.987-00'][i],
        valorTotalFrete: Number(valorFrete.toFixed(2)),
        fretePeso: Number((valorFrete * 0.4).toFixed(2)),
        freteValor: Number((valorFrete * 0.3).toFixed(2)),
        pedagio: Number((Math.random() * 100 + 50).toFixed(2)),
        taxaGris: Number((Math.random() * 50 + 20).toFixed(2)),
        outrasTaxas: Number((Math.random() * 30 + 10).toFixed(2)),
        valorReceber: Number(valorFrete.toFixed(2)),
        cstICMS: '00',
        baseCalculoICMS: Number(valorFrete.toFixed(2)),
        aliquotaICMS: 12.0,
        valorICMS: Number((valorFrete * 0.12).toFixed(2)),
        valorPIS: Number((valorFrete * 0.0065).toFixed(2)),
        valorCOFINS: Number((valorFrete * 0.03).toFixed(2)),
        valorTributosAprox: Number((valorFrete * 0.1565).toFixed(2)),
        protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        dataHoraAutorizacao: dataEmissao,
        xmlAssinado: gerarXmlAssinado('CTe', numeroCte, chaveAcesso),
        empresaId: empresa.id,
        transportadoraId: transportadora?.id || null
      }
    })

    numeroCte++
  }

  console.log(`✅ 5 CT-e criadas`)

  // ============================================
  // 6. Criar NFA-e (Modelo 01-AVULSA) - 5 notas
  // ============================================
  console.log('\n📄 Gerando NFA-e...')

  const nfaeCount = await prisma.nFAe.count({ where: { empresaId: empresa.id } })
  let numeroNfae = 900 + nfaeCount

  for (let i = 0; i < 5; i++) {
    const cliente = clientes[(i + 6) % clientes.length]
    const dataEmissao = gerarDataAleatoria(20)

    const chaveAcesso = `NFAE${String(numeroNfae).padStart(10, '0')}${Date.now().toString().slice(-10)}`

    await prisma.nFAe.create({
      data: {
        modelo: '01-AVULSA',
        serie: 900,
        numero: numeroNfae,
        chaveAcesso: chaveAcesso,
        dataHoraEmissao: dataEmissao,
        naturezaOperacao: 'Venda Avulsa de Mercadorias',
        motivoEmissao: i % 2 === 0 ? 'FEIRAS_EVENTOS' : 'PRODUTOR_RURAL',
        descricaoMotivo: i % 2 === 0 ? 'Participação em Feira/Evento' : 'Produtor Rural sem Inscrição Estadual',
        ambiente: 1,
        status: i % 5 === 0 ? 'CANCELADA' : 'AUTORIZADA',
        requerenteTipo: 'PF',
        requerenteCpfCnpj: '123.456.789-00',
        requerenteNome: ['João da Silva', 'Maria Oliveira', 'José Santos', 'Ana Pereira', 'Carlos Lima'][i],
        requerenteInscricao: null,
        requerenteLogradouro: 'Rua das Feiras',
        requerenteNumero: String(100 + i * 50),
        requerenteBairro: 'Centro',
        requerenteMunicipio: 'São Paulo',
        requerenteUf: 'SP',
        requerenteCep: '01000-000',
        requerenteTelefone: '(11) 9999-9999',
        requerenteEmail: `requerente${i}@email.com`,
        destinatarioId: cliente.id,
        valorTotalProdutos: gerarValor(100, 2000),
        baseCalculoICMS: gerarValor(100, 2000),
        aliquotaICMSMediana: 18.0,
        valorTotalICMS: gerarValor(18, 360),
        valorTotalNota: gerarValor(118, 2360),
        guiaDAENumero: `DAE${String(numeroNfae).padStart(10, '0')}`,
        guiaDAECodigoBarras: `12345678901234567890123456789012345678901234${String(numeroNfae).padStart(5, '0')}`,
        guiaDAEChavePix: `pix${Math.random().toString(36).substring(7)}`,
        guiaDAEVencimento: new Date(dataEmissao.getTime() + 15 * 24 * 60 * 60 * 1000),
        guiaDAEValor: gerarValor(18, 360),
        guiaDAEStatus: i % 3 === 0 ? 'PAGO' : 'AGUARDANDO_PAGAMENTO',
        orgaoEmissorSefaz: 'SEFAZ/SP - Posto Fiscal da Capital',
        protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        dataHoraAutorizacao: dataEmissao,
        xmlAssinado: gerarXmlAssinado('NFAe', numeroNfae, chaveAcesso),
        empresaId: empresa.id
      }
    })

    numeroNfae++
  }

  console.log(`✅ 5 NFA-e criadas`)

  // ============================================
  // 7. Estatísticas finais
  // ============================================
  console.log('\n📊 ===== RESUMO DO SEED FISCAL =====')
  console.log(`📄 NF-e: 10 notas criadas`)
  console.log(`📄 NFS-e: 10 notas criadas`)
  console.log(`📄 NFC-e: 5 notas criadas`)
  console.log(`📄 CT-e: 5 notas criadas`)
  console.log(`📄 NFA-e: 5 notas criadas`)
  console.log(`📊 TOTAL: 35 documentos fiscais`)
  console.log('🎉 Seed fiscal concluído com sucesso!\n')

  const titulosCount = await prisma.tituloFinanceiro.count({
    where: { empresaId: empresa.id }
  })
  console.log(`💰 Títulos financeiros: ${titulosCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed fiscal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })