// backend/src/services/nfce.service.ts
import { Prisma, StatusDocumento } from '@prisma/client';
import { NfceRepository } from '../repositories/nfce.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { ProdutoRepository } from '../repositories/produto.repository.js';
import { FinanceiroRepository } from '../repositories/financeiro.repository.js';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso.js';
import { calcularTotaisNfe } from '../utils/tributosEngine.js';
import { gerarXmlNfce400, gerarXmlCancelamentoNFe } from '../utils/xmlNfeGenerator.js';
import type { ItemNfe, NFCeDocumento } from '../types/fiscal.js';
import { mapEmpresaParaEmitente } from '../utils/fiscalMappers.js';
import { CertificadoService } from './certificado.service.js';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../utils/xmlSigner.js';
import { autorizarNfe, enviarEvento } from './nfeSefazClient.js';
import { formatarDataHoraSefaz } from '../utils/dataHoraSefaz.js';

// URL do portal de consulta pública da NFC-e por UF — usada tanto para montar o
// QR Code (padrão V3 "online": <base>?p=<chave44>|3|<tpAmb>, sem hash/CSC — a
// SEFAZ valida a chave em tempo real quando o QR é lido) quanto o campo
// <urlChave> (a mesma URL de consulta, exigida pelo schema em infNFeSupl).
// ⚠️ Só o DF foi confirmado; as demais UFs precisam da URL real de consulta
// pública de NFC-e de cada Secretaria da Fazenda antes de usar em produção.
const URL_CONSULTA_NFCE_POR_UF: Record<string, string> = {
  // http (não https) — confirmado contra rejeição real da SEFAZ ("Endereco do
  // site da UF da consulta via QR-Code diverge do previsto"): a SEFAZ valida
  // essa URL contra uma tabela própria por UF, e o esquema precisa bater exatamente.
  DF: 'http://www.fazenda.df.gov.br/nfce/qrcode',
};
const URL_CONSULTA_NFCE_PADRAO = 'https://www.nfce.fazenda.gov.br/portal/consultaNFCe.aspx';

interface ItemNfceInput {
  produtoId?: string;
  codigoProduto?: string;
  descricao?: string;
  ncm?: string;
  cest?: string;
  cfop?: string;
  unidadeMedida?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotalBruto?: number;
  cstICMS?: string;
  csosnICMS?: string;
  aliquotaICMS?: number;
  baseCalculoICMS?: number;
  valorICMS?: number;
  cstPIS?: string;
  aliquotaPIS?: number;
  valorPIS?: number;
  cstCOFINS?: string;
  aliquotaCOFINS?: number;
  valorCOFINS?: number;
  valorTributosAproximados?: number;
}

interface PagamentoNfceInput {
  indPag?: string;
  tPag?: string;
  xPag?: string;
  vPag?: number;
  dPag?: string | Date;
  tpIntegra?: string;
  CNPJPag?: string;
  UFPag?: string;
  CNPJInstPag?: string;
  tBand?: string;
  cAut?: string;
  CNPJReceb?: string;
  idTermPag?: string;
}

interface EmitirNfceInput {
  empresaId: string;
  itens: ItemNfceInput[];
  consumidorIdentificado?: boolean;
  consumidorDoc?: string;
  consumidorNome?: string;
  valorDesconto?: number;
  valorAcrescimo?: number;
  naturezaOperacao?: string;
  tpEmis?: number;
  tpNF?: number;
  idDest?: number;
  finNFe?: number;
  indFinal?: number;
  indPres?: number;
  procEmi?: string;
  verProc?: string;
  formaPagamento?: string;
  valorPago?: number;
  valorRecebido?: number;
  tokenCscId?: string;
  infAdFisco?: string;
  infCpl?: string;
  pagamentos?: PagamentoNfceInput[];
  xPag?: string;
  dPag?: string | Date;
  tpIntegra?: string;
  CNPJInstPag?: string;
  tBand?: string;
  cAut?: string;
  CNPJReceb?: string;
  idTermPag?: string;
  [key: string]: unknown;
}

interface ProdutoEstoqueRef {
  id: string;
  estoqueAtual: number;
}

const PROTOCOLO_MOCK_SUFIXO_BASE = 1000000;
const PROTOCOLO_MOCK_SUFIXO_RANGE = 9000000;

export class NfceService {
  private nfceRepo: NfceRepository;
  private clienteRepo: ClienteRepository;
  private produtoRepo: ProdutoRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;
  private certificadoService: CertificadoService;

  constructor() {
    this.nfceRepo = new NfceRepository();
    this.clienteRepo = new ClienteRepository();
    this.produtoRepo = new ProdutoRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
    this.certificadoService = new CertificadoService();
  }

  async listarNfces(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: {
      status?: StatusDocumento | StatusDocumento[];
      dataInicio?: Date;
      dataFim?: Date;
      consumidorId?: string;
      numero?: number;
      serie?: number;
      chave?: string;
    }
  ) {
    return this.nfceRepo.findAll({
      empresaId,
      status: filtros?.status,
      dataInicio: filtros?.dataInicio,
      dataFim: filtros?.dataFim,
      consumidorId: filtros?.consumidorId,
      numero: filtros?.numero,
      serie: filtros?.serie,
      chaveAcesso: filtros?.chave,
      page,
      limit
    });
  }

  async buscarPorId(id: string, empresaId?: string) {
    const nfce = await this.nfceRepo.findById(id);
    if (empresaId && nfce && nfce.empresaId !== empresaId) return null;
    return nfce;
  }

  async buscarPorChave(chave: string, empresaId?: string) {
    const nfce = await this.nfceRepo.findByChave(chave);
    if (empresaId && nfce && nfce.empresaId !== empresaId) return null;
    return nfce;
  }

  async buscarPorProtocolo(protocolo: string) {
    return this.nfceRepo.findByProtocolo(protocolo);
  }

  async emitirNfce(data: EmitirNfceInput) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    // Valida certificado
    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // Valida itens
    if (!data.itens || data.itens.length === 0) {
      throw new Error('NFC-e deve ter pelo menos um item');
    }

    // Valida consumidor identificado
    let consumidorId = null;
    if (data.consumidorIdentificado && data.consumidorDoc) {
      const consumidor = await this.clienteRepo.findByDocumento(data.consumidorDoc);
      if (!consumidor) {
        throw new Error('Consumidor não encontrado. Cadastre-o primeiro ou desmarque a identificação.');
      }
      consumidorId = consumidor.id;
    }

    // Gera número e série
    const numero = await this.getProximoNumero(data.empresaId);
    const serie = empresa.serieNfce || 1;

    // Gera chave de acesso
    const aamm = new Date().toISOString().slice(2, 4) +
      (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: empresa.codigoUF,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '65',
      serie,
      numero,
      tipoEmissao: 1
    });

    // Resolve os defaults de cada item ANTES de somar os totais — os mesmos
    // defaults que criarItem() aplica ao persistir. Antes, os totais do
    // cabeçalho eram somados a partir de data.itens "cru" (sem defaults),
    // enquanto os itens persistidos (e o XML) usavam os valores com default
    // do criarItem(); qualquer campo omitido pelo chamador (ex.: valorICMS,
    // valorTributosAproximados) produzia cabeçalho e itens divergentes —
    // rejeitado pela SEFAZ ("Total ... difere do somatorio dos itens").
    const itensResolvidos = data.itens.map((item) => this.resolverItem(item));

    // Calcula totais com desconto e acréscimo
    const totais = calcularTotaisNfe(
      itensResolvidos as unknown as ItemNfe[],
      0, // frete
      0, // seguro
      0, // outras despesas
      data.valorDesconto || 0
    );

    const valorTotalFinal = totais.valorTotalNota + (data.valorAcrescimo || 0);

    // Prepara dados da NFC-e
    const nfceData: Prisma.NFCeUncheckedCreateInput = {
      modelo: '65',
      serie,
      numero,
      chaveAcesso: chaveCompleta,
      dataHoraEmissao: new Date(),
      naturezaOperacao: data.naturezaOperacao || 'Venda a Consumidor Final',
      ambiente: empresa.ambienteEmissao,
      tipoEmissao: String(data.tpEmis || 1),
      status: 'PROCESSANDO',
      consumidorIdentificado: data.consumidorIdentificado || false,

      // Campos do leiaute 4.00
      tpNF: data.tpNF || 1,
      idDest: data.idDest || 1,
      finNFe: data.finNFe || 1,
      indFinal: data.indFinal || 1,
      indPres: data.indPres || 2,
      procEmi: data.procEmi || '0',
      verProc: data.verProc || 'SUP-TECNOLOGIA-4.00',

      // Valores
      valorTotalProdutos: totais.valorTotalProdutos,
      valorTotalDesconto: data.valorDesconto || 0,
      valorTotalAcrescimo: data.valorAcrescimo || 0,
      valorTotalTributosAprox: totais.valorTotalTributosAproximados,
      valorTotalNota: valorTotalFinal,

      // Pagamento — em dinheiro (01) com troco, vPag deve ser o valor
      // efetivamente recebido (não o total da nota), senão vTroco = vPag - vNF
      // não bate com o troco informado e a SEFAZ rejeita ("Valor do troco incorreto").
      formaPagamento: data.formaPagamento || '17',
      valorPago: data.valorPago ?? (data.formaPagamento === '01' && data.valorRecebido ? data.valorRecebido : valorTotalFinal),
      valorTroco: data.formaPagamento === '01' ? Math.max(0, (data.valorRecebido || 0) - valorTotalFinal) : 0,

      // QR Code (padrão V3 "online" da NT 2015.002: <base>?p=<chave44>|3|<tpAmb>)
      urlQrCode: `${URL_CONSULTA_NFCE_POR_UF[empresa.uf] || URL_CONSULTA_NFCE_PADRAO}?p=${chaveCompleta}|3|${empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2}`,
      tokenCscId: data.tokenCscId || '000001',

      // Informações adicionais
      infAdFisco: data.infAdFisco,
      infCpl: data.infCpl,

      // Relacionamentos
      empresaId: data.empresaId,
      consumidorId: consumidorId || undefined,

      // Preenchido após a geração do XML, logo abaixo
      xmlAssinado: '',
    };

    // Cria NFC-e
    const nfce = await this.nfceRepo.create(nfceData);

    // Cria itens (usando os mesmos valores resolvidos já somados nos totais acima)
    const itensCriados = [];
    for (const item of itensResolvidos) {
      itensCriados.push(await this.criarItem(nfce.id, item));
    }

    // Cria pagamentos
    if (data.pagamentos && data.pagamentos.length > 0) {
      for (const pag of data.pagamentos) {
        await this.criarPagamento(nfce.id, pag);
      }
    } else {
      // Pagamento padrão (mesma regra do vPag do cabeçalho acima)
      await this.criarPagamento(nfce.id, {
        tPag: data.formaPagamento || '17',
        xPag: data.xPag || this.getDescricaoPagamento(data.formaPagamento || '17'),
        vPag: data.valorPago ?? (data.formaPagamento === '01' && data.valorRecebido ? data.valorRecebido : valorTotalFinal),
        dPag: data.dPag,
        tpIntegra: data.tpIntegra || '1',
        CNPJInstPag: data.CNPJInstPag,
        tBand: data.tBand,
        cAut: data.cAut,
        CNPJReceb: data.CNPJReceb,
        idTermPag: data.idTermPag,
      });
    }

    // Atualiza número
    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroNfce: numero + 1
    });

    // Monta o DTO fiscal e gera o XML (ainda não transmitido à SEFAZ)
    const itensParaXml: ItemNfe[] = itensCriados.map((item) => ({
      id: item.id,
      codigoProduto: item.codigoProduto,
      descricao: item.descricao,
      ncm: item.ncm,
      cest: item.cest || undefined,
      cfop: item.cfop,
      unidadeMedida: item.unidadeMedida,
      quantidade: Number(item.quantidade),
      valorUnitario: Number(item.valorUnitario),
      valorTotalBruto: Number(item.valorTotalBruto),
      origemMercadoria: 0,
      cstICMS: item.cstICMS,
      csosnICMS: item.csosnICMS || undefined,
      aliquotaICMS: Number(item.aliquotaICMS),
      baseCalculoICMS: Number(item.baseCalculoICMS),
      valorICMS: Number(item.valorICMS),
      cstPIS: item.cstPIS,
      aliquotaPIS: Number(item.aliquotaPIS ?? 0),
      valorPIS: Number(item.valorPIS ?? 0),
      cstCOFINS: item.cstCOFINS,
      aliquotaCOFINS: Number(item.aliquotaCOFINS ?? 0),
      valorCOFINS: Number(item.valorCOFINS ?? 0),
      valorTributosAproximados: Number(item.valorTributosAprox ?? 0),
    }));

    const nfceDocumento: NFCeDocumento = {
      id: nfce.id,
      modelo: '65',
      serie,
      numero,
      chaveAcesso: chaveCompleta,
      dataHoraEmissao: formatarDataHoraSefaz(nfce.dataHoraEmissao),
      naturezaOperacao: data.naturezaOperacao || 'Venda a Consumidor Final',
      ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2,
      tipoEmissao: 1,
      status: 'AUTORIZADA',
      emitente: mapEmpresaParaEmitente(empresa),
      consumidorIdentificado: data.consumidorIdentificado || false,
      consumidorCpf: data.consumidorDoc,
      consumidorNome: data.consumidorNome,
      itens: itensParaXml,
      valorTotalProdutos: totais.valorTotalProdutos,
      valorTotalDesconto: data.valorDesconto || 0,
      valorTotalAcrescimo: data.valorAcrescimo || 0,
      valorTotalTributosAproximados: totais.valorTotalTributosAproximados,
      valorTotalNota: valorTotalFinal,
      formaPagamento: (nfceData.formaPagamento as NFCeDocumento['formaPagamento']) || '17',
      valorPago: Number(nfceData.valorPago),
      valorTroco: Number(nfceData.valorTroco),
      urlQrCode: nfceData.urlQrCode as string,
      tokenCscId: nfceData.tokenCscId as string,
      urlConsultaChave: URL_CONSULTA_NFCE_POR_UF[empresa.uf] || URL_CONSULTA_NFCE_PADRAO,
      tpNF: data.tpNF as 0 | 1 | undefined,
      idDest: data.idDest as 1 | 2 | 3 | undefined,
      finNFe: data.finNFe as 1 | 2 | 3 | 4 | undefined,
      indFinal: data.indFinal as 0 | 1 | undefined,
      indPres: data.indPres as 0 | 1 | 2 | 3 | 4 | 5 | 9 | undefined,
      procEmi: nfceData.procEmi as string,
      verProc: nfceData.verProc as string,
      tpEmis: 1,
      infAdFisco: data.infAdFisco,
      infCpl: data.infCpl,
      protocoloAutorizacao: '',
      dataHoraAutorizacao: formatarDataHoraSefaz(),
      xmlAssinado: '',
    };

    const xmlSemAssinatura = gerarXmlNfce400(nfceDocumento);

    const certificado = await this.certificadoService.obterCertificadoDecriptado(data.empresaId);
    if (!certificado) {
      throw new Error('Certificado digital não configurado para esta empresa');
    }
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    // 'infNFeSupl' (QR Code) precisa vir ANTES de <Signature> no documento final
    // (exigido pelo schema) — ver o comentário de `inserirApos` em xmlSigner.ts.
    const xml = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertPem, 'infNFeSupl');

    // Transmissão real à SEFAZ (mesmo webservice da NFe — NFC-e é o modelo 65 da
    // mesma família), controlada por SEFAZ_TRANSMISSAO_REAL (ver nfe.service.ts).
    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let statusFinal: 'AUTORIZADA' | 'REJEITADA' | 'PROCESSANDO' = 'AUTORIZADA';
    let protocolo = `1352600${Math.floor(PROTOCOLO_MOCK_SUFIXO_BASE + Math.random() * PROTOCOLO_MOCK_SUFIXO_RANGE)}`;
    let xmlRetorno: string | undefined;

    if (transmissaoReal) {
      const resultado = await autorizarNfe({
        uf: empresa.uf,
        ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 'producao' : 'homologacao',
        cUF: empresa.codigoUF,
        xmlAssinado: xml,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
        modelo: '65',
      });
      xmlRetorno = resultado.xmlRetorno;

      if (resultado.autorizado && resultado.nProt) {
        statusFinal = 'AUTORIZADA';
        protocolo = resultado.nProt;
      } else if (resultado.nRec) {
        statusFinal = 'PROCESSANDO';
      } else {
        statusFinal = 'REJEITADA';
        const motivo = resultado.xMotivo || 'motivo não informado';
        await this.nfceRepo.updateStatus(nfce.id, 'REJEITADA', undefined, xml, motivo, xmlRetorno);
        throw new Error(`SEFAZ rejeitou a NFC-e: ${motivo} (cStat ${resultado.cStat})`);
      }
    } else {
      console.warn('[NFCe] SEFAZ_TRANSMISSAO_REAL não está ativo — emissão em modo mock (XML assinado, mas não transmitido).');
    }

    await this.nfceRepo.updateStatus(nfce.id, statusFinal, protocolo, xml, undefined, xmlRetorno);

    // Baixa estoque
    const itensValidos = data.itens.filter(
      (i): i is ItemNfceInput & { produtoId: string } => Boolean(i.produtoId)
    );
    if (itensValidos.length > 0) {
      const produtos = await this.produtoRepo.findByIds(itensValidos.map((i) => i.produtoId), data.empresaId) as unknown as ProdutoEstoqueRef[];
      const produtoMap = new Map(produtos.map((p) => [p.id, p]));
      for (const item of itensValidos) {
        const produto = produtoMap.get(item.produtoId);
        if (produto) {
          await this.produtoRepo.update(item.produtoId, data.empresaId, {
            estoqueAtual: Math.max(0, Number(produto.estoqueAtual) - (item.quantidade || 0))
          });
        }
      }
    }

    // Cria título financeiro se for a prazo (não dinheiro e não PIX)
    if (data.formaPagamento !== '01' && data.formaPagamento !== '17' && data.formaPagamento !== '90') {
      await this.financeiroRepo.create({
        tipo: 'RECEBER',
        numeroDocumento: `NFCe-${numero}/01`,
        descricao: `NFC-e ${numero} - ${data.naturezaOperacao || 'Venda'}`,
        categoria: 'VENDA_PRODUTOS',
        pessoaNome: data.consumidorNome || 'Consumidor Não Identificado',
        pessoaDocumento: data.consumidorDoc || '00000000000000',
        dataEmissao: new Date(),
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        valorOriginal: valorTotalFinal,
        status: 'PENDENTE',
        formaPagamento: data.formaPagamento || '17',
        documentoOrigemTipo: 'NFCE',
        documentoOrigemChave: chaveCompleta,
        empresaId: data.empresaId,
        clienteId: consumidorId || undefined
      });
    }

    // Busca NFC-e completa com todos os relacionamentos
    const nfceFinal = await this.nfceRepo.findById(nfce.id);

    return {
      ...nfceFinal,
      xmlAssinado: xml
    };
  }

  // Aplica os mesmos defaults que antes só existiam em criarItem(), mas cedo o
  // bastante para alimentar tanto calcularTotaisNfe() (cabeçalho) quanto a
  // persistência do item — garantindo que os dois nunca divirjam.
  private resolverItem(item: ItemNfceInput): Required<Omit<ItemNfceInput, 'produtoId' | 'cest'>> & Pick<ItemNfceInput, 'produtoId' | 'cest'> {
    const totalBruto = item.valorTotalBruto ?? (item.quantidade || 0) * (item.valorUnitario || 0);
    const aliquotaICMS = item.aliquotaICMS ?? 18;

    return {
      produtoId: item.produtoId,
      codigoProduto: item.codigoProduto || '',
      descricao: item.descricao || '',
      ncm: item.ncm || '',
      cest: item.cest,
      cfop: item.cfop || '5102',
      unidadeMedida: item.unidadeMedida || 'UN',
      quantidade: item.quantidade || 0,
      valorUnitario: item.valorUnitario || 0,
      valorTotalBruto: totalBruto,
      // csosnICMS presente ⇒ cstICMS não se aplica (mutuamente exclusivos no leiaute)
      cstICMS: item.csosnICMS ? '' : (item.cstICMS || '00'),
      csosnICMS: item.csosnICMS || '',
      // `??` (não `||`): 0 é um valor legítimo aqui (ex.: item sob CSOSN sem
      // base própria) — `||` trocava um 0 explícito pelo padrão, inflando o
      // vBC/vICMS do documento e causando "Total da BC ICMS difere do somatorio
      // dos itens" na SEFAZ mesmo quando o item já tinha o valor certo (0).
      aliquotaICMS,
      baseCalculoICMS: item.baseCalculoICMS ?? totalBruto,
      valorICMS: item.valorICMS ?? (totalBruto * aliquotaICMS / 100),
      cstPIS: item.cstPIS || '01',
      aliquotaPIS: item.aliquotaPIS ?? 1.65,
      valorPIS: item.valorPIS ?? (totalBruto * 1.65 / 100),
      cstCOFINS: item.cstCOFINS || '01',
      aliquotaCOFINS: item.aliquotaCOFINS ?? 7.6,
      valorCOFINS: item.valorCOFINS ?? (totalBruto * 7.6 / 100),
      valorTributosAproximados: item.valorTributosAproximados ?? (totalBruto * 0.314),
    };
  }

  private async criarItem(nfceId: string, item: ItemNfceInput) {
    return this.nfceRepo.createItem(nfceId, {
      codigoProduto: item.codigoProduto || '',
      descricao: item.descricao || '',
      ncm: item.ncm || '',
      cest: item.cest,
      cfop: item.cfop || '5102',
      unidadeMedida: item.unidadeMedida || 'UN',
      quantidade: item.quantidade || 0,
      valorUnitario: item.valorUnitario || 0,
      valorTotalBruto: item.valorTotalBruto || 0,
      cstICMS: item.csosnICMS ? undefined : (item.cstICMS || '00'),
      csosnICMS: item.csosnICMS || undefined,
      aliquotaICMS: item.aliquotaICMS ?? 18,
      baseCalculoICMS: item.baseCalculoICMS ?? 0,
      valorICMS: item.valorICMS ?? 0,
      cstPIS: item.cstPIS || '01',
      aliquotaPIS: item.aliquotaPIS ?? 1.65,
      valorPIS: item.valorPIS ?? 0,
      cstCOFINS: item.cstCOFINS || '01',
      aliquotaCOFINS: item.aliquotaCOFINS ?? 7.6,
      valorCOFINS: item.valorCOFINS ?? 0,
      valorTributosAprox: item.valorTributosAproximados ?? 0,
    });
  }

  private async criarPagamento(nfceId: string, pag: PagamentoNfceInput) {
    return this.nfceRepo.createPagamento(nfceId, {
      indPag: pag.indPag || '0',
      tPag: pag.tPag || '17',
      xPag: pag.xPag || this.getDescricaoPagamento(pag.tPag || '17'),
      vPag: pag.vPag || 0,
      dPag: pag.dPag,
      tpIntegra: pag.tpIntegra || '1',
      CNPJPag: pag.CNPJPag,
      UFPag: pag.UFPag,
      CNPJInstPag: pag.CNPJInstPag,
      tBand: pag.tBand,
      cAut: pag.cAut,
      CNPJReceb: pag.CNPJReceb,
      idTermPag: pag.idTermPag,
    });
  }

  private async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroNfce || 1);
  }

  private getDescricaoPagamento(codigo: string): string {
    const descricoes: Record<string, string> = {
      '01': 'Dinheiro',
      '02': 'Cheque',
      '03': 'Cartão de Crédito',
      '04': 'Cartão de Débito',
      '05': 'Crédito Loja',
      '10': 'Vale Alimentação',
      '11': 'Vale Refeição',
      '12': 'Vale Presente',
      '13': 'Vale Combustível',
      '15': 'Boleto Bancário',
      '17': 'PIX',
      '90': 'Sem Pagamento',
      '99': 'Outros',
    };
    return descricoes[codigo] || 'Outros';
  }

  async cancelarNfce(id: string, motivo: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (nfce.status === 'CANCELADA') {
      throw new Error('NFC-e já está cancelada');
    }

    // Valida TJust (15-255 caracteres)
    if (motivo.length < 15) {
      throw new Error('Motivo deve ter no mínimo 15 caracteres (TJust)');
    }
    if (motivo.length > 255) {
      throw new Error('Motivo deve ter no máximo 255 caracteres (TJust)');
    }

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';

    if (transmissaoReal) {
      if (nfce.status !== 'AUTORIZADA' || !nfce.protocoloAutorizacao) {
        throw new Error('Apenas NFC-e autorizadas pela SEFAZ podem ser canceladas');
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) throw new Error('Empresa não encontrada');

      const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

      const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;
      const xmlEvento = gerarXmlCancelamentoNFe({
        chaveAcessoNFe: nfce.chaveAcesso,
        cnpjAutor: empresa.cnpj,
        sequencialEvento: 1,
        justificativa: motivo,
        protocoloAutorizacao: nfce.protocoloAutorizacao,
        ambiente,
      });
      const xmlEventoAssinado = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEvento({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        xmlEventoAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
        modelo: '65',
      });

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou o cancelamento: ${resultado.xMotivo || 'motivo não informado'} (cStat ${resultado.cStat})`);
      }
    }

    // Cancela título financeiro se existir
    try {
      const titulos = await this.financeiroRepo.findManyByDocumentoOrigem(nfce.chaveAcesso);
      for (const titulo of titulos) {
        await this.financeiroRepo.cancelarTitulo(titulo.id, motivo);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cancelar título financeiro:', error);
    }

    return this.nfceRepo.cancelar(id, motivo);
  }

  async getEstatisticas(empresaId: string) {
    return this.nfceRepo.getEstatisticas(empresaId);
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfceRepo.getTotalVendas(empresaId, startDate, endDate);
  }

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.nfceRepo.getResumoMensal(empresaId, ano, mes);
  }

  async baixarXml(id: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (!nfce.xmlAssinado) {
      throw new Error('XML da NFC-e não disponível');
    }

    return nfce.xmlAssinado;
  }

  async gerarDanfce(id: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    // [AutoPatch Backlog] TODO: Implementar geração real do cupom fiscal (DANFE NFC-e) em PDF/térmica
    // (58mm ou 80mm), incluindo QR Code (urlQrCode já calculado) e código de barras
    // da chave de acesso. Requer escolher biblioteca de geração de PDF/ESC-POS no backend.
    return {
      chaveAcesso: nfce.chaveAcesso,
      numero: nfce.numero,
      serie: nfce.serie,
      valorTotal: nfce.valorTotalNota,
      consumidor: nfce.consumidor?.razaoSocial || 'Consumidor Não Identificado',
      urlQrCode: nfce.urlQrCode
    };
  }

  async getProdutosMaisVendidos(empresaId: string, startDate?: Date, endDate?: Date, limit: number = 10) {
    return this.nfceRepo.getProdutosMaisVendidos(empresaId, startDate, endDate, limit);
  }
}