// backend/src/services/cte.service.ts
import { CteRepository, FiltroCte } from '../repositories/cte.repository.js';
import { StatusCTe } from '@prisma/client';
import { gerarChaveAcessoNFe, calcularDVMod11NFe } from '../utils/chaveAcesso.js';
import { gerarXmlCte400, gerarXmlCancelamentoCte } from '../utils/xmlCteGenerator.js';
import { CertificadoService } from './certificado.service.js';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../utils/xmlSigner.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { autorizarCte, enviarEventoCte } from './cteSefazClient.js';

interface EmitirCteInput {
  cUF?: string;
  cMunIni?: string;
  emitenteCNPJ?: string;
  serie?: number;
  nCT?: number;
  tpEmis?: number;
  vTPrest?: number;
  vRec?: number;
  aliquotaICMS?: number;
  empresaId: string;
  xmlAssinado?: string;
  componentesValor?: {
    fretePeso?: number;
    freteValor?: number;
    pedagio?: number;
    taxaGris?: number;
    outrasTaxas?: number;
  };
  [key: string]: unknown;
}

const PROTOCOLO_MOCK_SUFIXO_BASE = 1000000;
const PROTOCOLO_MOCK_SUFIXO_RANGE = 9000000;

// Mapeia os códigos numéricos do layout SEFAZ (aceitos na API) para os nomes
// dos enums do Prisma, que é o que o repositório/gerador de XML esperam.
const TIPO_SERVICO_POR_CODIGO: Record<number, string> = {
  0: 'NORMAL', 1: 'SUBCONTRATACAO', 2: 'REDESPACHO', 3: 'REDESPACHO_INTERMEDIARIO', 4: 'VINCULADO_MULTIMODAL',
};
const TOMADOR_POR_CODIGO: Record<number, string> = {
  0: 'REMETENTE', 1: 'EXPEDIDOR', 2: 'RECEBEDOR', 3: 'DESTINATARIO', 4: 'OUTROS',
};
const IND_IE_TOMA_POR_CODIGO: Record<number, string> = {
  1: 'CONTRIBUINTE', 2: 'ISENTO', 9: 'NAO_CONTRIBUINTE',
};

function paraEnumOuCodigo<T extends string>(
  valor: unknown,
  mapa: Record<number, T>,
  padrao: T
): T {
  if (typeof valor === 'string' && Object.values(mapa).includes(valor as T)) return valor as T;
  if (typeof valor === 'number' && mapa[valor] !== undefined) return mapa[valor];
  return padrao;
}

export class CteService {
  private cteRepo: CteRepository;
  private empresaRepo: EmpresaRepository;
  private certificadoService: CertificadoService;

  constructor() {
    this.cteRepo = new CteRepository();
    this.empresaRepo = new EmpresaRepository();
    this.certificadoService = new CertificadoService();
  }

  async listarCtes(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: FiltroCte
  ) {
    return this.cteRepo.findAll(empresaId, page, limit, filtros);
  }

  async buscarPorId(id: string, empresaId: string) {
    return this.cteRepo.findById(id, empresaId);
  }

  async buscarPorChave(chave: string, empresaId: string) {
    return this.cteRepo.findByChave(chave, empresaId);
  }

  async buscarPorProtocolo(protocolo: string, empresaId: string) {
    return this.cteRepo.findByProtocolo(protocolo, empresaId);
  }

  async emitirCte(data: EmitirCteInput) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // 1. Gerar chave de acesso
    const cUF = data.cUF || data.cMunIni?.slice(0, 2) || '35';
    const aamm = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
    const cnpjEmitente = data.emitenteCNPJ || '00000000000000';
    const serie = data.serie || 1;
    const numero = data.nCT || (await this.cteRepo.getProximoNumero(data.empresaId, serie));
    const tipoEmissao = data.tpEmis || 1;

    const { chaveCompleta, codigoNumerico, dv } = gerarChaveAcessoNFe({
      codigoUf: cUF,
      anoMes: aamm,
      cnpjEmitente,
      modelo: '57',
      serie,
      numero,
      tipoEmissao,
    });

    // 2. Calcular valores
    const vTPrest = data.vTPrest || this.calcularTotalFrete(data);
    const vRec = data.vRec || vTPrest;

    // 3. Calcular ICMS
    const aliquotaICMS = data.aliquotaICMS || 12;
    const vBC = vTPrest;
    const vICMS = (vBC * aliquotaICMS) / 100;
    const vPIS = (vTPrest * 0.65) / 100;
    const vCOFINS = (vTPrest * 3.0) / 100;

    // 4. Criar CT-e
    const cte = await this.cteRepo.create({
      // IDENTIFICAÇÃO
      versao: '4.00',
      cUF,
      cCT: codigoNumerico,
      CFOP: data.CFOP || '6353',
      natOp: data.natOp || 'Prestação de Serviço de Transporte de Cargas',
      mod: '57',
      serie,
      nCT: numero,
      dhEmi: new Date(),
      tpImp: data.tpImp || '1',
      tpEmis: tipoEmissao,
      cDV: dv,
      // Não hardcodar 1 (produção): sem isso, todo CT-e afirmaria ser de
      // produção mesmo com a empresa configurada para homologação.
      tpAmb: data.tpAmb || (empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2),
      tpCTe: data.tpCTe || 'NORMAL',
      procEmi: data.procEmi || '0',
      verProc: data.verProc || 'SUP-TECNOLOGIA-1.0',
      indGlobalizado: data.indGlobalizado || false,
      cMunEnv: data.cMunEnv || data.cMunIni,
      xMunEnv: data.xMunEnv || data.xMunIni,
      UFEnv: data.UFEnv || data.UFIni,
      modal: data.modal || 'RODOVIARIO',
      tpServ: paraEnumOuCodigo(data.tpServ, TIPO_SERVICO_POR_CODIGO, 'NORMAL'),
      cMunIni: data.cMunIni,
      xMunIni: data.xMunIni,
      UFIni: data.UFIni,
      cMunFim: data.cMunFim,
      xMunFim: data.xMunFim,
      UFFim: data.UFFim,
      retira: data.retira || '1',
      xDetRetira: data.xDetRetira,
      indIEToma: paraEnumOuCodigo(data.indIEToma, IND_IE_TOMA_POR_CODIGO, 'NAO_CONTRIBUINTE'),

      // TOMADOR
      toma: paraEnumOuCodigo(data.tomadorServico, TOMADOR_POR_CODIGO, 'REMETENTE'),
      tomadorCNPJ: data.tomadorCNPJ,
      tomadorCPF: data.tomadorCPF,
      tomadorIE: data.tomadorIE,
      tomadorxNome: data.tomadorxNome,
      tomadorxFant: data.tomadorxFant,
      tomadorFone: data.tomadorFone,
      tomadorEmail: data.tomadorEmail,
      tomadorxLgr: data.tomadorxLgr,
      tomadorNro: data.tomadorNro,
      tomadorxCpl: data.tomadorxCpl,
      tomadorxBairro: data.tomadorxBairro,
      tomadorcMun: data.tomadorcMun,
      tomadorxMun: data.tomadorxMun,
      tomadorCEP: data.tomadorCEP,
      tomadorUF: data.tomadorUF,
      tomadorcPais: data.tomadorcPais,
      tomadorxPais: data.tomadorxPais,

      // DADOS COMPLEMENTARES
      xCaracAd: data.xCaracAd,
      xCaracSer: data.xCaracSer,
      xEmi: data.xEmi,
      xOrig: data.xOrig,
      xDest: data.xDest,
      xRota: data.xRota,

      // PREVISÃO DE ENTREGA
      tpPer: data.tpPer,
      dProg: data.dProg,
      dIni: data.dIni,
      dFim: data.dFim,
      tpHor: data.tpHor,
      hProg: data.hProg,
      hIni: data.hIni,
      hFim: data.hFim,

      // VALORES DA PRESTAÇÃO
      vTPrest,
      vRec,

      // IMPOSTOS - ICMS00
      CST00: '00',
      vBC00: vBC,
      pICMS00: aliquotaICMS,
      vICMS00: vICMS,

      // INFORMAÇÕES DA CARGA
      vCarga: data.valorCargaAverbada,
      proPred: data.produtoPredominante,
      xOutCat: data.xOutCat,
      vCargaAverb: data.valorCargaAverbada,

      // COBRANÇA
      nFat: data.nFat || String(numero),
      vOrig: vTPrest,
      vLiq: vTPrest,

      // CT-e DE SUBSTITUIÇÃO
      chCteSub: data.chCteSub,
      indAlteraToma: data.indAlteraToma,

      // CT-e GLOBALIZADO
      xObsGlobalizado: data.xObsGlobalizado,

      // STATUS (preenchido de verdade após a transmissão à SEFAZ, logo abaixo)
      status: 'PROCESSANDO',
      chaveAcesso: chaveCompleta,
      xmlAssinado: '', // preenchido após a criação, quando os relacionamentos já estão disponíveis

      // RELACIONAMENTOS
      empresaId: data.empresaId,
      // O CT-e é sempre emitido pela própria empresa dona do registro — sem
      // esse padrão, a criação falhava com "Argument emitente is missing"
      // sempre que o chamador não informasse emitenteId explicitamente.
      emitenteId: data.emitenteId || data.empresaId,
      remetenteId: data.remetenteId,
      destinatarioId: data.destinatarioId,
      expedidorId: data.expedidorId,
      recebedorId: data.recebedorId,
      transportadoraId: data.transportadoraId,

      // SUB-ESTRUTURAS
      componentes: data.componentes,
      quantidades: data.quantidades,
      duplicatas: data.duplicatas,
      observacoes: data.observacoes,
      observacoesFisco: data.observacoesFisco,
      autorizadosDownload: data.autorizadosDownload,
      complementos: data.complementos,
      substitutos: data.substitutos,
      globalizados: data.globalizados,
      servicosVinculados: data.servicosVinculados,
      documentos: data.documentos,
      ordensColeta: data.ordensColeta,
      lacresRodo: data.lacresRodo,
    });

    // Gera o XML a partir do registro já persistido (com emitente/remetente/destinatario/
    // componentes/quantidades/documentos/duplicatas carregados) e assina digitalmente.
    const xmlSemAssinatura = gerarXmlCte400(cte);
    const certificado = await this.certificadoService.obterCertificadoDecriptado(data.empresaId);
    if (!certificado) {
      throw new Error('Certificado digital não configurado para esta empresa');
    }
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    const xml = assinarXmlEnvelopado(xmlSemAssinatura, 'infCte', chaveECertPem);

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let statusFinal: 'AUTORIZADA' | 'REJEITADA' | 'PROCESSANDO' = 'AUTORIZADA';
    let protocoloFinal = `1352600${Math.floor(PROTOCOLO_MOCK_SUFIXO_BASE + Math.random() * PROTOCOLO_MOCK_SUFIXO_RANGE)}`;
    let motivoRejeicaoFinal: string | undefined;

    if (transmissaoReal) {
      const resultado = await autorizarCte({
        uf: empresa.uf,
        ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 'producao' : 'homologacao',
        xmlAssinado: xml,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      if (resultado.autorizado && resultado.nProt) {
        statusFinal = 'AUTORIZADA';
        protocoloFinal = resultado.nProt;
      } else {
        statusFinal = 'REJEITADA';
        motivoRejeicaoFinal = resultado.xMotivo || 'Rejeitado pela SEFAZ sem motivo informado';
      }
    } else {
      console.warn('[CTe] SEFAZ_TRANSMISSAO_REAL não está ativo — emissão em modo mock (XML assinado, mas não transmitido).');
    }

    const cteAtualizado = await this.cteRepo.update(cte.id, data.empresaId, {
      xmlAssinado: xml,
      status: statusFinal,
      protocoloAutorizacao: statusFinal === 'AUTORIZADA' ? protocoloFinal : undefined,
      dataHoraAutorizacao: statusFinal === 'AUTORIZADA' ? new Date() : undefined,
      motivoRejeicao: motivoRejeicaoFinal,
    });

    if (statusFinal === 'REJEITADA') {
      throw new Error(`SEFAZ rejeitou o CT-e: ${motivoRejeicaoFinal}`);
    }

    return cteAtualizado;
  }

  async cancelarCte(id: string, motivo: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id, empresaId);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.status === 'CANCELADA') {
      throw new Error('CT-e já está cancelado');
    }

    if (cte.status !== 'AUTORIZADA') {
      throw new Error('Apenas CT-e autorizados podem ser cancelados');
    }

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';

    if (transmissaoReal) {
      if (!cte.protocoloAutorizacao) {
        throw new Error('CT-e autorizado sem protocolo de autorização registrado');
      }
      if (!cte.chaveAcesso) {
        throw new Error('CT-e sem chave de acesso registrada');
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) throw new Error('Empresa não encontrada');

      const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

      const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;
      const xmlEvento = gerarXmlCancelamentoCte({
        chaveAcessoCte: cte.chaveAcesso,
        cnpjAutor: empresa.cnpj,
        sequencialEvento: 1,
        justificativa: motivo,
        protocoloAutorizacao: cte.protocoloAutorizacao,
        ambiente,
      });
      const xmlEventoAssinado = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEventoCte({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        xmlEventoAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou o cancelamento: ${resultado.xMotivo || 'motivo não informado'} (cStat ${resultado.cStat})`);
      }
    } else {
      console.warn('[CTe] SEFAZ_TRANSMISSAO_REAL não está ativo — cancelamento em modo mock (não transmitido).');
    }

    return this.cteRepo.updateStatus(id, empresaId, 'CANCELADA', motivo);
  }

  async baixarXml(id: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id, empresaId);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    return cte.xmlAssinado;
  }

  async gerarDacte(id: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id, empresaId);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    // Retorna os dados para o frontend renderizar o DACTE
    return {
      id: cte.id,
      numero: cte.nCT,
      serie: cte.serie,
      chaveAcesso: cte.chaveAcesso,
      dataHoraEmissao: cte.dhEmi,
      naturezaOperacao: cte.natOp,
      cfop: cte.CFOP,
      modal: cte.modal,
      emitente: {
        razaoSocial: cte.emitente?.razaoSocial || 'Emitente não encontrado',
        cnpj: cte.emitente?.cnpj || '',
        inscricaoEstadual: cte.emitente?.inscricaoEstadual || '',
        endereco: cte.emitente?.endereco || {},
      },
      remetente: {
        nomeRazaoSocial: cte.remetente?.razaoSocial || '',
        documento: cte.remetente?.documento || '',
        inscricaoEstadual: cte.remetente?.inscricaoEstadual || '',
        endereco: cte.remetente?.endereco || {},
      },
      destinatario: {
        nomeRazaoSocial: cte.destinatario?.razaoSocial || '',
        documento: cte.destinatario?.documento || '',
        inscricaoEstadual: cte.destinatario?.inscricaoEstadual || '',
        endereco: cte.destinatario?.endereco || {},
      },
      municipioInicio: { nome: cte.xMunIni, uf: cte.UFIni },
      municipioFim: { nome: cte.xMunFim, uf: cte.UFFim },
      produtoPredominante: cte.proPred,
      valorCargaAverbada: cte.vCargaAverb,
      pesoBrutoKg: 0,
      pesoLiquidoKg: 0,
      quantidadeVolumes: 0,
      especieVolumes: '',
      rntrc: '',
      veiculo: { placa: '', uf: '' },
      motorista: { nome: '', cpf: '' },
      valorTotalFrete: cte.vTPrest,
      componentesValor: {
        fretePeso: 0,
        freteValor: 0,
        pedagio: 0,
        taxaGris: 0,
        outrasTaxas: 0,
      },
      valorReceber: cte.vRec,
      cstICMS: cte.CST00 || '00',
      baseCalculoICMS: cte.vBC00 || 0,
      aliquotaICMS: cte.pICMS00 || 0,
      valorICMS: cte.vICMS00 || 0,
      protocoloAutorizacao: cte.protocoloAutorizacao,
      dataHoraAutorizacao: cte.dataHoraAutorizacao,
    };
  }

  async getEstatisticas(empresaId: string) {
    return this.cteRepo.getEstatisticas(empresaId);
  }

  async getTotalFrete(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.getTotalFrete(empresaId, dataInicio, dataFim);
  }

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.cteRepo.getResumoMensal(empresaId, ano, mes);
  }

  async findByCliente(empresaId: string, clienteId: string, tipo: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByCliente(empresaId, clienteId, tipo, dataInicio, dataFim);
  }

  async findByTransportadora(empresaId: string, transportadoraId: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByTransportadora(empresaId, transportadoraId, dataInicio, dataFim);
  }

  async findByModal(empresaId: string, modal: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByModal(empresaId, modal, dataInicio, dataFim);
  }

  async findByStatus(empresaId: string, status: StatusCTe, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByStatus(empresaId, status, dataInicio, dataFim);
  }

  async buscarCteSubstituido(chave: string, empresaId: string) {
    return this.cteRepo.buscarCteSubstituido(chave, empresaId);
  }

  async buscarCteComplementado(chave: string, empresaId: string) {
    return this.cteRepo.buscarCteComplementado(chave, empresaId);
  }

  private calcularTotalFrete(data: EmitirCteInput): number {
    let total = 0;

    if (data.componentesValor) {
      total += data.componentesValor.fretePeso || 0;
      total += data.componentesValor.freteValor || 0;
      total += data.componentesValor.pedagio || 0;
      total += data.componentesValor.taxaGris || 0;
      total += data.componentesValor.outrasTaxas || 0;
    }

    return total || 0;
  }

}