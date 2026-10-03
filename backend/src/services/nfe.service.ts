// backend/src/services/nfe.service.ts
import { logger } from '../lib/logger.js';
import { Prisma } from '@prisma/client';
import { NfeRepository } from '../repositories/nfe.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ProdutoRepository } from '../repositories/produto.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { FinanceiroRepository } from '../repositories/financeiro.repository.js';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso.js';
import { calcularTotaisNfe } from '../utils/tributosEngine.js';
import { gerarXmlNfe400, gerarXmlCartaCorrecao, gerarXmlCancelamentoNFe, gerarXmlInutilizacaoNFe } from '../utils/xmlNfeGenerator.js';
import type { ItemNfe, NFeDocumento, FormaPagamento } from '../types/fiscal.js';
import type { FiltroNFe } from '../repositories/nfe.repository.js';
import { mapEmpresaParaEmitente, mapClienteParaTomador } from '../utils/fiscalMappers.js';
import { CertificadoService } from './certificado.service.js';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../utils/xmlSigner.js';
import { autorizarNfe, consultarRecibo, enviarEvento, inutilizarNfe } from './nfeSefazClient.js';
import { formatarDataHoraSefaz } from '../utils/dataHoraSefaz.js';

interface ItemNfeRequestInput {
  produtoId: string;
  quantidade?: number;
  valorUnitario?: number;
}


interface EmitirNfeInput {
  empresaId: string;
  destinatarioId: string;
  itens?: ItemNfeRequestInput[];
  naturezaOperacao?: string;
  formaPagamento?: string;
  informacoesAdicionais?: string;
  consumidorFinal?: boolean;
  [key: string]: unknown;
}

export class NfeService {
  private nfeRepo: NfeRepository;
  private clienteRepo: ClienteRepository;
  private produtoRepo: ProdutoRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;
  private certificadoService: CertificadoService;

  constructor() {
    this.nfeRepo = new NfeRepository();
    this.clienteRepo = new ClienteRepository();
    this.produtoRepo = new ProdutoRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
    this.certificadoService = new CertificadoService();
  }

  async emitirNfe(data: EmitirNfeInput) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    const destinatario = await this.clienteRepo.findById(data.destinatarioId);
    if (!destinatario) throw new Error('Destinatário não encontrado');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // 🔥 CFOP depende de UF emitente x UF destinatário (mesmo estado = família 5xxx,
    // interestadual = 6xxx, exterior = 7xxx) — não é um atributo fixo do produto.
    // Calculado aqui (antes dos itens) porque idDest também precisa disso; usar o
    // cfopPadrao do produto sem ajustar causava rejeição real da SEFAZ ("CFOP de
    // operacao interna e idDest <> 1") sempre que o cliente era de outro estado.
    const idDestPreCalc: 1 | 2 | 3 =
      destinatario.tipoPessoa === 'EXTERIOR' ? 3 :
      empresa.uf === destinatario.endereco.uf ? 1 : 2;
    const prefixoCfopSaida = idDestPreCalc === 1 ? '5' : idDestPreCalc === 2 ? '6' : '7';

    // 🔥 Deriva SEMPRE do endereço (mesma fonte que o XML usa no <cUF> do corpo
    // do documento) — nunca do campo espelhado empresa.codigoUF. Os dois só
    // ficam em sincronia quando toda atualização de endereço passa pela rota
    // normal (empresaMappers.ts recalcula o espelho); um reparo direto no
    // banco (feito nesta mesma sessão, num incidente anterior) corrigiu
    // endereco.codigoMunicipio mas não o espelho, e isso sozinho já bastou pra
    // fazer a chave de acesso (gerada com o campo desatualizado) divergir do
    // <cUF> do corpo (gerado a partir do endereço já corrigido) — rejeição
    // real da SEFAZ: "Erro na Chave de Acesso - Campo ID nao corresponde".
    const cUF = empresa.endereco?.codigoMunicipio?.slice(0, 2) || empresa.codigoUF;

    const itensCompletos: ItemNfe[] = await Promise.all(
      (data.itens || []).map(async (item, idx) => {
        const produto = await this.produtoRepo.findById(item.produtoId, data.empresaId);
        if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);

        const cfopAjustado = prefixoCfopSaida + (produto.cfopPadrao || '5102').slice(1);

        const quantidade = item.quantidade || 1;
        const valorUnitario = item.valorUnitario || Number(produto.precoVenda);
        const valorTotal = quantidade * valorUnitario;
        const aliquotaICMS = Number(produto.aliquotaICMS);
        const aliquotaPIS = Number(produto.aliquotaPIS);
        const aliquotaCOFINS = Number(produto.aliquotaCOFINS);
        // 🔥 IPI/IBS/CBS nunca eram calculados aqui — a nota real (autorizada e
        // gravada) saía sempre com esses 3 tributos zerados, mesmo quando a tela
        // do emissor mostrava valores diferentes de zero (que eram calculados só
        // no preview do frontend, com números fixos no código, nunca chegando
        // ao backend). Produto.aliquotaIBS é um campo único (não separado por
        // UF/Município no schema) — divide 50/50, mesma convenção já usada em
        // outros modelos do schema que têm os dois campos separados.
        const aliquotaIPI = Number(produto.aliquotaIPI ?? 0);
        const aliquotaIBS = Number(produto.aliquotaIBS ?? 0);
        const aliquotaIBSUF = aliquotaIBS / 2;
        const aliquotaIBSMun = aliquotaIBS / 2;
        const aliquotaCBS = Number(produto.aliquotaCBS ?? 0);

        // CSOSN 102/103/300/400/500 não têm vBC/vICMS próprios (ICMSSN102/ICMSSN500
        // não declaram esses campos) — a SEFAZ rejeita ("Total da BC ICMS difere do
        // somatorio dos itens") se o total do documento contabilizar um valor que
        // nenhum item realmente declarou. calcularTotaisNfe() soma o que estiver
        // aqui, então zerar na origem mantém item e total consistentes.
        const csosnSemBasePropria = ['102', '103', '300', '400', '500'];
        const semIcmsPropriaBase = !!produto.csosnICMS && csosnSemBasePropria.includes(produto.csosnICMS);

        return {
          id: produto.id || `item-${idx}`,
          codigoProduto: produto.codigo,
          descricao: produto.descricao,
          ncm: produto.ncm,
          cest: produto.cest || undefined,
          cfop: cfopAjustado,
          unidadeMedida: produto.unidade,
          quantidade,
          valorUnitario,
          valorTotalBruto: valorTotal,
          origemMercadoria: Number(produto.origem ?? '0') as ItemNfe['origemMercadoria'],
          cstICMS: produto.cstICMS || '00',
          csosnICMS: produto.csosnICMS || undefined,
          aliquotaICMS,
          baseCalculoICMS: semIcmsPropriaBase ? 0 : valorTotal,
          valorICMS: semIcmsPropriaBase ? 0 : (valorTotal * aliquotaICMS) / 100,
          cstPIS: '01',
          aliquotaPIS,
          valorPIS: (valorTotal * aliquotaPIS) / 100,
          cstCOFINS: '01',
          aliquotaCOFINS,
          valorCOFINS: (valorTotal * aliquotaCOFINS) / 100,
          cstIPI: produto.cstIPI || undefined,
          aliquotaIPI,
          valorIPI: (valorTotal * aliquotaIPI) / 100,
          cstIBSCBS: '000',
          aliquotaIBSUF,
          valorIBSUF: (valorTotal * aliquotaIBSUF) / 100,
          aliquotaIBSMun,
          valorIBSMun: (valorTotal * aliquotaIBSMun) / 100,
          aliquotaCBS,
          valorCBS: (valorTotal * aliquotaCBS) / 100,
          valorTributosAproximados: valorTotal * 0.314,
        };
      })
    );

    const totais = calcularTotaisNfe(itensCompletos, 0, 0, 0, 0);
    // Certificado decifrado ANTES de reservar o número: uma falha aqui não pode
    // queimar um número da sequência (a reserva é definitiva).
    const certificado = await this.certificadoService.obterCertificadoDecriptado(data.empresaId);
    if (!certificado) {
      throw new Error('Certificado digital não configurado para esta empresa');
    }
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    const numero = await this.empresaRepo.reservarNumero(data.empresaId, 'proximoNumeroNfe');
    const aamm = new Date().toISOString().slice(2, 4) +
                 (new Date().getMonth() + 1).toString().padStart(2, '0');

    const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;

    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: cUF,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '55',
      serie: empresa.serieNfe,
      numero,
      tipoEmissao: 1,
    });

    const idDest = idDestPreCalc;

    const emitenteFiscal = mapEmpresaParaEmitente(empresa);
    const destinatarioFiscal = mapClienteParaTomador(destinatario);

    const dataHoraEmissaoISO = formatarDataHoraSefaz();

    const nfeDocumento: NFeDocumento = {
      id: '',
      modelo: '55',
      serie: empresa.serieNfe,
      numero,
      chaveAcesso: chaveCompleta,
      dataHoraEmissao: dataHoraEmissaoISO,
      dataHoraSaida: dataHoraEmissaoISO,
      naturezaOperacao: data.naturezaOperacao || 'Venda de Mercadorias',
      ambiente,
      tipoEmissao: 1,
      tipoDocumento: 1,
      finalidade: 1,
      // A SEFAZ rejeita ("Operacao com nao contribuinte deve indicar operacao
      // com consumidor final") quando o destinatário é não contribuinte
      // (indIEDest=9) e indFinal não é 1 — então nesse caso o padrão é sempre
      // consumidor final, a menos que o chamador informe explicitamente o contrário.
      consumidorFinal: data.consumidorFinal ?? destinatarioFiscal.indicadorIEDestinatario === '9',
      presencaComprador: 2,
      status: 'AUTORIZADA',
      idDest,
      tpImp: 1,
      emitente: emitenteFiscal,
      destinatario: destinatarioFiscal,
      itens: itensCompletos,
      transporte: { modalidadeFrete: 9 },
      duplicatas: [],
      valorTotalProdutos: totais.valorTotalProdutos,
      valorTotalFrete: totais.valorTotalFrete,
      valorTotalSeguro: totais.valorTotalSeguro,
      valorTotalDesconto: totais.valorTotalDesconto,
      valorTotalOutrasDespesas: totais.valorTotalOutrasDespesas,
      baseCalculoICMS: totais.baseCalculoICMS,
      valorTotalICMS: totais.valorTotalICMS,
      baseCalculoICMSST: totais.baseCalculoICMSST,
      valorTotalICMSST: totais.valorTotalICMSST,
      valorTotalIPI: totais.valorTotalIPI,
      valorTotalPIS: totais.valorTotalPIS,
      valorTotalCOFINS: totais.valorTotalCOFINS,
      valorTotalIBS: totais.valorTotalIBS,
      valorTotalCBS: totais.valorTotalCBS,
      valorTotalTributosAproximados: totais.valorTotalTributosAproximados,
      valorTotalNota: totais.valorTotalNota,
      formaPagamento: (data.formaPagamento as FormaPagamento) || '17',
      protocoloAutorizacao: '',
      dataHoraAutorizacao: dataHoraEmissaoISO,
      informacoesAdicionais: data.informacoesAdicionais || '',
      xmlAssinado: '',
    };

    const xmlSemAssinatura = gerarXmlNfe400(nfeDocumento);

    const xml = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertPem);

    // Transmissão real à SEFAZ, controlada por variável de ambiente: enquanto a empresa
    // não tiver um certificado ICP-Brasil genuíno registrado na Receita Federal, deixe
    // SEFAZ_TRANSMISSAO_REAL desligado (padrão) para continuar operando em modo mock
    // durante o desenvolvimento/demonstração local.
    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let statusFinal: 'AUTORIZADA' | 'REJEITADA' | 'PROCESSANDO' = 'AUTORIZADA';
    let protocoloFinal: string | null = null;
    let motivoRejeicaoFinal: string | undefined;
    let xmlRetornoFinal: string | undefined;
    let reciboLoteFinal: string | undefined;

    if (transmissaoReal) {
      const resultado = await autorizarNfe({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        cUF,
        xmlAssinado: xml,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      xmlRetornoFinal = resultado.xmlRetorno;
      if (resultado.autorizado && resultado.nProt) {
        statusFinal = 'AUTORIZADA';
        protocoloFinal = resultado.nProt;
      } else if (resultado.nRec) {
        // SEFAZ processou em lote (assíncrono) — o recibo é guardado e consultado
        // via NFeRetAutorizacao4 em consultarSituacao().
        statusFinal = 'PROCESSANDO';
        reciboLoteFinal = resultado.nRec;
      } else {
        statusFinal = 'REJEITADA';
        motivoRejeicaoFinal = resultado.xMotivo || 'Rejeitado pela SEFAZ sem motivo informado';
      }
    } else {
      logger.warn('[NFe] SEFAZ_TRANSMISSAO_REAL não está ativo — emissão em modo mock (XML assinado, mas não transmitido).');
    }

    const nfeCreateData: Prisma.NFeUncheckedCreateInput = {
      modelo: '55',
      serie: empresa.serieNfe,
      numero,
      chaveAcesso: chaveCompleta,
      cUF,
      cNF: chaveCompleta.slice(35, 43),
      natOp: nfeDocumento.naturezaOperacao,
      indPag: '0',
      mod: '55',
      dhEmi: new Date(),
      dhSaiEnt: new Date(),
      tpNF: '1',
      idDest: idDest.toString(),
      cMunFG: empresa.codigoMunicipio,
      tpImp: '1',
      tpEmis: '1',
      cDV: chaveCompleta.slice(-1),
      tpAmb: ambiente.toString(),
      finNFe: '1',
      indFinal: '0',
      indPres: '2',
      procEmi: '0',
      verProc: 'SUP-TECNOLOGIA-4.00',
      status: statusFinal,
      vBC: totais.baseCalculoICMS,
      vICMS: totais.valorTotalICMS,
      vBCST: totais.baseCalculoICMSST,
      vST: totais.valorTotalICMSST,
      vProd: totais.valorTotalProdutos,
      vFrete: totais.valorTotalFrete,
      vSeg: totais.valorTotalSeguro,
      vDesc: totais.valorTotalDesconto,
      vIPI: totais.valorTotalIPI,
      vPIS: totais.valorTotalPIS,
      vCOFINS: totais.valorTotalCOFINS,
      vOutro: totais.valorTotalOutrasDespesas,
      vNF: totais.valorTotalNota,
      vTotTrib: totais.valorTotalTributosAproximados,
      vIBS: totais.valorTotalIBS,
      vCBS: totais.valorTotalCBS,
      infCpl: nfeDocumento.informacoesAdicionais,
      xmlAssinado: xml,
      xmlRetorno: xmlRetornoFinal,
      dataHoraAutorizacao: statusFinal === 'AUTORIZADA' ? new Date() : null,
      protocoloAutorizacao: protocoloFinal,
      motivoRejeicao: motivoRejeicaoFinal,
      reciboLote: reciboLoteFinal,
      empresaId: data.empresaId,
      destinatarioId: data.destinatarioId,
      itens: {
        create: itensCompletos.map((item, idx) => ({
          nItem: idx + 1,
          codigoProduto: item.codigoProduto,
          descricao: item.descricao,
          ncm: item.ncm,
          cest: item.cest,
          cfop: item.cfop,
          unidadeMedida: item.unidadeMedida,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          vProd: item.valorTotalBruto,
          vDesc: item.descontoItem || 0,
          codigoEAN: item.codigoEAN,
          codigoEANTrib: item.codigoEANTrib,
          origemMercadoria: item.origemMercadoria.toString(),
          cstICMS: item.cstICMS,
          pICMS: item.aliquotaICMS,
          vBC: item.baseCalculoICMS,
          vICMS: item.valorICMS,
          cstPIS: item.cstPIS,
          pPIS: item.aliquotaPIS,
          vPIS: item.valorPIS,
          cstCOFINS: item.cstCOFINS,
          pCOFINS: item.aliquotaCOFINS,
          vCOFINS: item.valorCOFINS,
          vTotTrib: item.valorTributosAproximados,
        })),
      },
    };

    const nfeCriada = await this.nfeRepo.create(nfeCreateData);


    await this.produtoRepo.baixarEstoque(
      data.empresaId,
      (data.itens || []).map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade || 0 }))
    );

    await this.financeiroRepo.create({
      tipo: 'RECEBER',
      numeroDocumento: `NFE-${numero}/01`,
      descricao: `NF-e ${numero}`,
      categoria: 'VENDA_PRODUTOS',
      pessoaNome: destinatario.razaoSocial,
      pessoaDocumento: destinatario.documento,
      dataEmissao: new Date(),
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      valorOriginal: totais.valorTotalNota,
      status: 'PENDENTE',
      formaPagamento: 'PIX / Boleto',
      documentoOrigemTipo: 'NFE',
      documentoOrigemChave: chaveCompleta,
      empresaId: data.empresaId,
      clienteId: data.destinatarioId
    });

    return { ...nfeCriada, xml };
  }


  async cancelarNfe(id: string, motivo: string, empresaId: string) {
    const nfe = await this.nfeRepo.findById(id);
    if (!nfe) throw new Error('NF-e não encontrada');
    if (nfe.empresaId !== empresaId) throw new Error('Acesso negado');
    if (nfe.status === 'CANCELADA') throw new Error('NF-e já está cancelada');

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';

    if (transmissaoReal) {
      if (nfe.status !== 'AUTORIZADA' || !nfe.protocoloAutorizacao) {
        throw new Error('Apenas NF-e autorizadas pela SEFAZ podem ser canceladas');
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) throw new Error('Empresa não encontrada');

      const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

      const nSeqEvento = (await this.nfeRepo.contarEventosPorTipo(nfe.id, '110111')) + 1;
      const xmlEvento = gerarXmlCancelamentoNFe({
        chaveAcessoNFe: nfe.chaveAcesso,
        cnpjAutor: empresa.cnpj,
        sequencialEvento: nSeqEvento,
        justificativa: motivo,
        protocoloAutorizacao: nfe.protocoloAutorizacao,
      });
      const xmlEventoAssinado = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEvento({
        uf: empresa.uf,
        ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 'producao' : 'homologacao',
        xmlEventoAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      await this.nfeRepo.criarEvento({
        chaveNFe: nfe.chaveAcesso,
        tpEvento: '110111',
        nSeqEvento,
        dhEvento: new Date(),
        cStat: resultado.cStat || '000',
        xMotivo: resultado.xMotivo || '',
        xmlEvento: xmlEventoAssinado,
        xmlRetorno: resultado.xmlRetorno,
        empresaId,
        nfeId: nfe.id,
      });

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou o cancelamento: ${resultado.xMotivo || 'motivo não informado'} (cStat ${resultado.cStat})`);
      }
    }

    const nfeCancelada = await this.nfeRepo.cancelar(id, motivo);

    const titulo = await this.financeiroRepo.findByDocumentoOrigem(nfe.chaveAcesso);
    if (titulo) {
      await this.financeiroRepo.cancelarTitulo(titulo.id, motivo);
    }

    return nfeCancelada;
  }

  async listarNfes(filtros: FiltroNFe) {
    return this.nfeRepo.findAll(filtros);
  }

  async buscarPorId(id: string, empresaId?: string) {
    const nfe = await this.nfeRepo.findById(id);
    if (empresaId && nfe && nfe.empresaId !== empresaId) return null;
    return nfe;
  }

  async buscarPorChave(chave: string, empresaId?: string) {
    const nfe = await this.nfeRepo.findByChave(chave);
    if (empresaId && nfe && nfe.empresaId !== empresaId) return null;
    return nfe;
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfeRepo.getTotalVendas(empresaId, startDate, endDate);
  }

  async buscarPorProtocolo(protocolo: string, empresaId?: string) {
    const nfe = await this.nfeRepo.findByProtocolo(protocolo);
    if (empresaId && nfe && nfe.empresaId !== empresaId) return null;
    return nfe;
  }

  async getEstatisticas(empresaId: string) {
    return this.nfeRepo.getEstatisticas(empresaId);
  }

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.nfeRepo.getResumoMensal(empresaId, ano, mes);
  }

  /**
   * Gera, assina e transmite (quando SEFAZ_TRANSMISSAO_REAL=true) o evento de
   * Carta de Correção (CC-e, 110110) via RecepcaoEvento4. Em modo mock, apenas
   * registra o evento localmente, como antes.
   */
  async enviarCartaCorrecao(params: {
    empresaId: string;
    chaveAcesso: string;
    cnpjAutor: string;
    textoCorrecao: string;
  }) {
    const nfe = await this.nfeRepo.findByChave(params.chaveAcesso);
    if (!nfe) throw new Error('NF-e não encontrada');
    if (nfe.empresaId !== params.empresaId) throw new Error('Acesso negado');

    const empresa = await this.empresaRepo.findById(params.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    const nSeqEvento = (await this.nfeRepo.contarEventosPorTipo(nfe.id, '110110')) + 1;
    const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;

    const xmlEvento = gerarXmlCartaCorrecao({
      chaveAcessoNFe: params.chaveAcesso,
      cnpjAutor: params.cnpjAutor,
      sequencialEvento: nSeqEvento,
      textoCorrecao: params.textoCorrecao,
      ambiente,
    });

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let xmlEventoFinal = xmlEvento;
    let cStat = '000';
    let xMotivo = 'Evento registrado localmente - aguardando integração com o webservice de eventos da SEFAZ';
    let nProt: string | undefined;
    let xmlRetorno: string | undefined;

    if (transmissaoReal) {
      const certificado = await this.certificadoService.obterCertificadoDecriptado(params.empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
      xmlEventoFinal = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEvento({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        xmlEventoAssinado: xmlEventoFinal,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      cStat = resultado.cStat || '999';
      xMotivo = resultado.xMotivo || 'Rejeitado pela SEFAZ sem motivo informado';
      nProt = resultado.nProt;
      xmlRetorno = resultado.xmlRetorno;

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou a carta de correção: ${xMotivo} (cStat ${cStat})`);
      }
    } else {
      logger.warn('[NFe] SEFAZ_TRANSMISSAO_REAL não está ativo — CC-e registrada em modo mock (não transmitida).');
    }

    return this.nfeRepo.criarEvento({
      chaveNFe: params.chaveAcesso,
      tpEvento: '110110',
      nSeqEvento,
      dhEvento: new Date(),
      cStat,
      xMotivo,
      nProt,
      xmlEvento: xmlEventoFinal,
      xmlRetorno,
      empresaId: params.empresaId,
      nfeId: nfe.id,
    });
  }

  /**
   * Inutiliza uma faixa de numeração de NF-e/NFC-e que nunca chegou a ser
   * transmitida (NFeInutilizacao4). Em modo mock (SEFAZ_TRANSMISSAO_REAL
   * desligado), apenas registra a solicitação localmente como PROCESSANDO.
   */
  async inutilizarNumeracao(params: {
    empresaId: string;
    modelo: '55' | '65';
    serie: number;
    numeroInicial: number;
    numeroFinal: number;
    justificativa: string;
  }) {
    const empresa = await this.empresaRepo.findById(params.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;
    const ano = new Date().getFullYear().toString().slice(2, 4);
    // 🔥 Mesma fonte única usada em emitirNfe — nunca o campo espelhado
    // empresa.codigoUF, que pode divergir do endereço após um reparo direto
    // no banco (ver comentário em emitirNfe).
    const cUF = empresa.endereco?.codigoMunicipio?.slice(0, 2) || empresa.codigoUF;

    const xmlInutilizacao = gerarXmlInutilizacaoNFe({
      cUF,
      cnpjAutor: empresa.cnpj,
      ano,
      modelo: params.modelo,
      serie: params.serie,
      numeroInicial: params.numeroInicial,
      numeroFinal: params.numeroFinal,
      justificativa: params.justificativa,
      ambiente,
    });

    const certificado = await this.certificadoService.obterCertificadoDecriptado(params.empresaId);
    if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    const xmlAssinado = assinarXmlEnvelopado(xmlInutilizacao, 'infInut', chaveECertPem);

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let status = 'PROCESSANDO';
    let protocolo: string | undefined;
    let motivoRejeicao: string | undefined;
    let xmlRetorno: string | undefined;
    let dataHoraAutorizacao: Date | undefined;

    if (transmissaoReal) {
      const resultado = await inutilizarNfe({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        xmlInutilizacaoAssinado: xmlAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
        modelo: params.modelo,
      });

      xmlRetorno = resultado.xmlRetorno;
      if (resultado.sucesso) {
        status = 'HOMOLOGADA';
        protocolo = resultado.nProt;
        dataHoraAutorizacao = new Date();
      } else {
        status = 'REJEITADA';
        motivoRejeicao = resultado.xMotivo || 'Rejeitado pela SEFAZ sem motivo informado';
      }
    } else {
      logger.warn('[NFe] SEFAZ_TRANSMISSAO_REAL não está ativo — inutilização registrada em modo mock (não transmitida).');
    }

    const inutilizacaoCriada = await this.nfeRepo.criarInutilizacao({
      empresaId: params.empresaId,
      serie: params.serie,
      numeroInicial: params.numeroInicial,
      numeroFinal: params.numeroFinal,
      ano: Number(`20${ano}`),
      cUF,
      cnpj: empresa.cnpj.replace(/\D/g, ''),
      justificativa: params.justificativa,
      protocolo,
      status,
      xmlEnvio: xmlAssinado,
      xmlRetorno,
      dataHoraAutorizacao,
      motivoRejeicao,
    });

    if (status === 'REJEITADA') {
      throw new Error(`SEFAZ rejeitou a inutilização: ${motivoRejeicao}`);
    }

    return inutilizacaoCriada;
  }

  /**
   * Consulta a situação da NF-e a partir dos dados já persistidos localmente.
   * Ainda não realiza consulta em tempo real ao webservice NfeConsultaProtocolo4
   * da SEFAZ — isso depende da fase de integração real com o ambiente
   * de homologação/produção.
   */
  async consultarSituacao(chave: string, empresaId: string) {
    let nfe = await this.nfeRepo.findByChave(chave);
    if (!nfe) throw new Error('NF-e não encontrada');
    if (nfe.empresaId !== empresaId) throw new Error('Acesso negado');

    // NF-e enviada em lote assíncrono: consulta o recibo na SEFAZ e grava o
    // resultado — sem isso a nota ficava em PROCESSANDO para sempre.
    if (
      nfe.status === 'PROCESSANDO' &&
      nfe.reciboLote &&
      process.env.SEFAZ_TRANSMISSAO_REAL === 'true'
    ) {
      await this.processarRecibo(nfe.id, nfe.reciboLote, empresaId);
      nfe = (await this.nfeRepo.findByChave(chave))!;
    }

    return {
      chaveAcesso: nfe.chaveAcesso,
      status: nfe.status,
      protocoloAutorizacao: nfe.protocoloAutorizacao,
      dataHoraAutorizacao: nfe.dataHoraAutorizacao,
      motivoRejeicao: nfe.motivoRejeicao,
    };
  }

  private async processarRecibo(nfeId: string, nRec: string, empresaId: string): Promise<void> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
    if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

    const resultado = await consultarRecibo({
      uf: empresa.uf,
      ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 'producao' : 'homologacao',
      nRec,
      mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
    });

    // cStat 105 = lote ainda em processamento: mantém PROCESSANDO para a próxima consulta.
    if (!resultado.autorizado && resultado.cStat === '105') {
      await this.nfeRepo.registrarResultadoProcessamento(nfeId, {
        status: 'PROCESSANDO',
        xmlRetorno: resultado.xmlRetorno,
      });
      return;
    }

    if (resultado.autorizado && resultado.nProt) {
      await this.nfeRepo.registrarResultadoProcessamento(nfeId, {
        status: 'AUTORIZADA',
        protocoloAutorizacao: resultado.nProt,
        xmlRetorno: resultado.xmlRetorno,
      });
      return;
    }

    await this.nfeRepo.registrarResultadoProcessamento(nfeId, {
      status: 'REJEITADA',
      motivoRejeicao: `${resultado.xMotivo || 'Rejeitada pela SEFAZ sem motivo informado'} (cStat ${resultado.cStat || '?'})`,
      xmlRetorno: resultado.xmlRetorno,
    });
  }
}
