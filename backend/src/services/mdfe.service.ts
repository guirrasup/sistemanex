// backend/src/services/mdfe.service.ts
import { Prisma, StatusMDFe, ModalMDFe, TipoEmitenteMDFe, TipoTransportadorMDFe, TipoCargaMDFe } from '@prisma/client';
import { MdfeRepository } from '../repositories/mdfe.repository.js';
import { MdfeComponentRepository } from '../repositories/mdfe.component.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { gerarChaveAcessoMDFe } from '../utils/chaveAcessoMDFe.js';
import { limparDocumento } from '../utils/cpfCnpjValidator.js';
import { gerarXmlMDFe, gerarXmlCancelamentoMdfe, gerarXmlEncerramentoMdfe } from '../utils/xmlMdfeGenerator.js';
import { CertificadoService } from './certificado.service.js';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../utils/xmlSigner.js';
import { autorizarMdfe, enviarEventoMdfe } from './mdfeSefazClient.js';

interface PerigosoInput {
  numeroONU?: string;
  nomeApropriado?: string;
  classeRisco?: string;
  grupoEmbalagem?: string;
  quantidadeTotal?: number;
  quantidadeVolumes?: number;
}

interface UnidadeCargaInput {
  tipo?: string;
  identificacao?: string;
  quantidadeRateada?: number;
  lacres?: string[];
}

interface UnidadeTransporteInput {
  tipo?: string;
  identificacao?: string;
  quantidadeRateada?: number;
  lacres?: string[];
  unidadesCarga?: UnidadeCargaInput[];
}

interface CteNoMdfeInput {
  chave?: string;
  segundoCodigoBarras?: string;
  indReentrega?: boolean;
  entregaParcial?: { quantidadeTotal?: number; quantidadeParcial?: number };
  prestacaoParcial?: { indicador?: boolean; nfes?: string[] };
  unidadesTransporte?: UnidadeTransporteInput[];
  perigosos?: PerigosoInput[];
}

interface NfeNoMdfeInput {
  chave?: string;
  segundoCodigoBarras?: string;
  indReentrega?: boolean;
  unidadesTransporte?: UnidadeTransporteInput[];
  perigosos?: PerigosoInput[];
}

interface MdfeTranspNoMdfeInput {
  chave?: string;
  indReentrega?: boolean;
  unidadesTransporte?: UnidadeTransporteInput[];
  perigosos?: PerigosoInput[];
}

interface SeguroInput {
  responsavel?: string;
  responsavelCNPJ?: string;
  responsavelCPF?: string;
  seguradoraNome?: string;
  seguradoraCNPJ?: string;
  apolice?: string;
  averbacoes?: unknown;
}

interface AutorizadoDownloadInput {
  cnpj?: string;
  cpf?: string;
}

interface MunicipioCarregaInput {
  codigo?: string;
  nome?: string;
}

interface PercursoInput {
  uf?: string;
}

interface VeiculoTracaoInput {
  placa: string;
  renavam?: string;
  tara: number | string;
  tpRod: string;
  tpCar: string;
  uf?: string;
}

interface CondutorInput {
  nome: string;
  cpf: string;
}

interface EmitirMdfeInput {
  empresaId: string;
  emitenteId: string;
  municipiosCarrega: MunicipioCarregaInput[];
  municipiosDescarga: Array<{
    codigo?: string;
    nome?: string;
    ctes?: CteNoMdfeInput[];
    nfes?: NfeNoMdfeInput[];
    mdfesTransp?: MdfeTranspNoMdfeInput[];
  }>;
  modal: ModalMDFe;
  tpEmit: TipoEmitenteMDFe;
  tpTransp?: TipoTransportadorMDFe;
  verProc?: string;
  dhIniViagem?: string | number | Date;
  UFIni: string;
  UFFim: string;
  indCanalVerde?: boolean;
  indCarregaPosterior?: boolean;
  vCarga?: number;
  cUnid?: string;
  qCarga?: number;
  tpCarga: TipoCargaMDFe;
  xProd: string;
  cEAN?: string;
  NCM?: string;
  infAdFisco?: string;
  infCpl?: string;
  percursos?: PercursoInput[];
  seguros?: SeguroInput[];
  lacres?: string[];
  autorizadosDownload?: AutorizadoDownloadInput[];
  rntrc?: string;
  veiculo?: VeiculoTracaoInput;
  condutores?: CondutorInput[];
  usuario?: string;
  [key: string]: unknown;
}

const MAX_DOCUMENTOS_POR_MDFE = 20000;

// O gerador de XML espera as chaves do layout SEFAZ (chCTe/chNFe/chMDFe,
// tpUnidTransp/idUnidTransp, nONU/xNomeAE/etc.), não as do payload da API
// (chave, tipo/identificacao, numeroONU/nomeApropriado/etc.) — confirmado via
// rejeição real ("Informações dos tomadores é obrigatória", causada pela chave
// do documento nunca chegando ao XML por causa do nome de campo errado).
function mapearUnidadeCarga(uc: UnidadeCargaInput) {
  return { tpUnidCarga: uc.tipo, idUnidCarga: uc.identificacao, lacres: uc.lacres, qtdRat: uc.quantidadeRateada };
}
function mapearUnidadeTransporte(ut: UnidadeTransporteInput) {
  return {
    tpUnidTransp: ut.tipo,
    idUnidTransp: ut.identificacao,
    lacres: ut.lacres,
    qtdRat: ut.quantidadeRateada,
    unidadesCarga: (ut.unidadesCarga || []).map(mapearUnidadeCarga),
  };
}
function mapearPerigoso(p: PerigosoInput) {
  return {
    nONU: p.numeroONU,
    xNomeAE: p.nomeApropriado,
    xClaRisco: p.classeRisco,
    grEmb: p.grupoEmbalagem,
    qTotProd: p.quantidadeTotal,
    qVolTipo: p.quantidadeVolumes,
  };
}
function mapearCte(cte: CteNoMdfeInput) {
  return {
    chCTe: cte.chave,
    SegCodBarra: cte.segundoCodigoBarras,
    indReentrega: cte.indReentrega,
    unidadesTransporte: (cte.unidadesTransporte || []).map(mapearUnidadeTransporte),
    perigosos: (cte.perigosos || []).map(mapearPerigoso),
    qtdTotal: cte.entregaParcial?.quantidadeTotal,
    qtdParcial: cte.entregaParcial?.quantidadeParcial,
    indPrestacaoParcial: cte.prestacaoParcial?.indicador,
    nfesParciais: (cte.prestacaoParcial?.nfes || []).map((chNFe) => ({ chNFe })),
  };
}
function mapearNfe(nfe: NfeNoMdfeInput) {
  return {
    chNFe: nfe.chave,
    SegCodBarra: nfe.segundoCodigoBarras,
    indReentrega: nfe.indReentrega,
    unidadesTransporte: (nfe.unidadesTransporte || []).map(mapearUnidadeTransporte),
    perigosos: (nfe.perigosos || []).map(mapearPerigoso),
  };
}
function mapearMdfeTransp(m: MdfeTranspNoMdfeInput) {
  return {
    chMDFe: m.chave,
    indReentrega: m.indReentrega,
    unidadesTransporte: (m.unidadesTransporte || []).map(mapearUnidadeTransporte),
    perigosos: (m.perigosos || []).map(mapearPerigoso),
  };
}

function obrigatorio<T>(valor: T | undefined | null, campo: string): T {
  if (valor === undefined || valor === null || valor === '') {
    throw new Error(`Campo obrigatório ausente: ${campo}`);
  }
  return valor;
}

export class MdfeService {
  private mdfeRepo: MdfeRepository;
  private componentRepo: MdfeComponentRepository;
  private clienteRepo: ClienteRepository;
  private empresaRepo: EmpresaRepository;
  private certificadoService: CertificadoService;

  constructor() {
    this.mdfeRepo = new MdfeRepository();
    this.componentRepo = new MdfeComponentRepository();
    this.clienteRepo = new ClienteRepository();
    this.empresaRepo = new EmpresaRepository();
    this.certificadoService = new CertificadoService();
  }

  async listarMdfes(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: {
      status?: StatusMDFe | StatusMDFe[];
      dataInicio?: Date;
      dataFim?: Date;
      modal?: string;
      numero?: number;
      serie?: number;
      chave?: string;
    }
  ) {
    return this.mdfeRepo.findAll({
      empresaId,
      status: filtros?.status,
      dataInicio: filtros?.dataInicio,
      dataFim: filtros?.dataFim,
      modal: filtros?.modal,
      numero: filtros?.numero,
      serie: filtros?.serie,
      chaveAcesso: filtros?.chave,
      page,
      limit
    });
  }

  async buscarPorId(id: string, empresaId?: string) {
    const mdfe = await this.mdfeRepo.findById(id);
    if (empresaId && mdfe && mdfe.empresaId !== empresaId) return null;
    return mdfe;
  }

  async buscarPorChave(chave: string, empresaId?: string) {
    const mdfe = await this.mdfeRepo.findByChave(chave);
    if (empresaId && mdfe && mdfe.empresaId !== empresaId) return null;
    return mdfe;
  }

  async emitirMdfe(data: EmitirMdfeInput) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    // Valida certificado
    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // Valida emitente
    const emitente = await this.clienteRepo.findById(data.emitenteId);
    if (!emitente) throw new Error('Emitente não encontrado');
    if (emitente.empresaId !== data.empresaId) {
      throw new Error('Emitente não pertence à empresa');
    }

    // Valida municípios de carregamento
    if (!data.municipiosCarrega || data.municipiosCarrega.length === 0) {
      throw new Error('Pelo menos um município de carregamento é obrigatório');
    }
    if (data.municipiosCarrega.length > 50) {
      throw new Error('Máximo de 50 municípios de carregamento');
    }

    // Valida municípios de descarga
    if (!data.municipiosDescarga || data.municipiosDescarga.length === 0) {
      throw new Error('Pelo menos um município de descarga é obrigatório');
    }
    if (data.municipiosDescarga.length > 1000) {
      throw new Error('Máximo de 1000 municípios de descarga');
    }

    // Valida documentos
    const totalCTe = data.municipiosDescarga.reduce(
      (acc, m) => acc + (m.ctes?.length || 0), 0
    );
    const totalNFe = data.municipiosDescarga.reduce(
      (acc, m) => acc + (m.nfes?.length || 0), 0
    );
    const totalMDFe = data.municipiosDescarga.reduce(
      (acc, m) => acc + (m.mdfesTransp?.length || 0), 0
    );

    if (totalCTe > MAX_DOCUMENTOS_POR_MDFE) throw new Error(`Máximo de ${MAX_DOCUMENTOS_POR_MDFE} CT-e por MDF-e`);
    if (totalNFe > MAX_DOCUMENTOS_POR_MDFE) throw new Error(`Máximo de ${MAX_DOCUMENTOS_POR_MDFE} NF-e por MDF-e`);
    if (totalMDFe > MAX_DOCUMENTOS_POR_MDFE) throw new Error(`Máximo de ${MAX_DOCUMENTOS_POR_MDFE} MDF-e por MDF-e (Aquaviário)`);

    // Gera número e série
    const numero = await this.getProximoNumero(data.empresaId);
    const serie = empresa.serieMdfe || 1;

    // Gera chave de acesso
    const aamm = new Date().toISOString().slice(2, 4) +
      (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta, cMDF, cDV } = gerarChaveAcessoMDFe({
      cUF: empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35',
      aamm,
      cnpj: empresa.cnpj,
      modelo: '58',
      serie,
      numero,
      tpEmis: 1
    });

    // Prepara dados do MDF-e
    const mdfeData: Prisma.MDFeUncheckedCreateInput = {
      chaveAcesso: chaveCompleta,
      modelo: '58',
      serie,
      numero,
      cUF: empresa.codigoUF,
      cMDF,
      cDV: cDV.toString(),
      modal: data.modal,
      tpAmb: empresa.ambienteEmissao === 'PRODUCAO' ? '1' : '2',
      tpEmit: data.tpEmit,
      tpTransp: data.tpTransp,
      tpEmis: '1',
      procEmi: '0',
      verProc: data.verProc || 'SUP-TECNOLOGIA-3.00',
      dhEmi: new Date(),
      dhIniViagem: data.dhIniViagem ? new Date(data.dhIniViagem) : undefined,
      UFIni: data.UFIni,
      UFFim: data.UFFim,
      indCanalVerde: data.indCanalVerde || false,
      indCarregaPosterior: data.indCarregaPosterior || false,
      status: 'RASCUNHO',
      versaoMDFe: '3.00',

      // Totalizadores
      qCTe: totalCTe || undefined,
      qNFe: totalNFe || undefined,
      qMDFe: totalMDFe || undefined,
      vCarga: data.vCarga || 0,
      cUnid: data.cUnid || '01',
      qCarga: data.qCarga || 0,

      // Produto predominante
      tpCarga: data.tpCarga,
      xProd: data.xProd,
      cEAN: data.cEAN,
      NCM: data.NCM,

      // Informações adicionais
      infAdFisco: data.infAdFisco,
      infCpl: data.infCpl,

      // Modal rodoviário (rodo/infANTT/veicTracao)
      rntrc: data.rntrc,
      veicTracaoPlaca: data.veiculo?.placa,
      veicTracaoRenavam: data.veiculo?.renavam,
      veicTracaoTara: data.veiculo?.tara !== undefined ? String(data.veiculo.tara) : undefined,
      veicTracaoTpRod: data.veiculo?.tpRod,
      veicTracaoTpCar: data.veiculo?.tpCar,
      veicTracaoUF: data.veiculo?.uf,
      condutores: data.condutores?.length
        ? { create: data.condutores.map((c) => ({ xNome: c.nome, CPF: limparDocumento(c.cpf) })) }
        : undefined,

      // Relacionamentos
      empresaId: data.empresaId,
      emitenteId: data.emitenteId,

      // Preenchido após a geração do XML, logo abaixo
      xmlAssinado: '',
    };

    // Cria MDF-e
    const mdfe = await this.mdfeRepo.create(mdfeData);

    // Cria componentes em transação
    await this.criarComponentesMDFe(mdfe.id, data);

    // Atualiza número
    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroMdfe: numero + 1
    });

    // Gera XML
    // O emit do MDF-e precisa ser a própria empresa (o CNPJ deve bater com o do
    // certificado digital usado para assinar/transmitir) — não o Cliente de
    // "emitenteId" (usado só para validação acima) — confirmado via rejeição
    // real da SEFAZ ("CNPJ-Base do Emitente difere do CNPJ-Base do Certificado").
    const emitenteXml = {
      documento: empresa.cnpj,
      inscricaoEstadual: empresa.inscricaoEstadual,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      endereco: empresa.endereco,
    };
    const xmlSemAssinatura = gerarXmlMDFe({
      mdfe,
      emitente: emitenteXml,
      // O gerador de XML espera as chaves do layout SEFAZ (cMunCarrega/xMunCarrega,
      // cMunDescarga/xMunDescarga), não as chaves do payload da API (codigo/nome) —
      // confirmado via rejeição real (cMunCarrega chegava "undefined" no XML).
      municipiosCarrega: data.municipiosCarrega.map((m) => ({ cMunCarrega: m.codigo, xMunCarrega: m.nome })),
      percursos: (data.percursos || []).map((p) => ({ UFPer: p.uf })),
      municipiosDescarga: data.municipiosDescarga.map((m) => ({
        cMunDescarga: m.codigo,
        xMunDescarga: m.nome,
        ctes: (m.ctes || []).map(mapearCte),
        nfes: (m.nfes || []).map(mapearNfe),
        mdfesTransp: (m.mdfesTransp || []).map(mapearMdfeTransp),
      })),
      // O gerador espera as chaves do layout SEFAZ (respSeg/respCNPJ/respCPF/xSeg/
      // CNPJSeg/nApol/nAver), não as do SeguroInput da API — confirmado via
      // rejeição real ("Seguro da carga é obrigatório") após o mapeamento faltar.
      seguros: (data.seguros || []).map((s) => ({
        respSeg: s.responsavel === '2' ? '2' : '1',
        respCNPJ: s.responsavelCNPJ,
        respCPF: s.responsavelCPF,
        xSeg: s.seguradoraNome,
        CNPJSeg: s.seguradoraCNPJ,
        nApol: s.apolice,
        nAver: s.averbacoes,
      })),
      lacres: data.lacres || [],
      autorizadosDownload: data.autorizadosDownload || [],
      produtoPredominante: {
        tpCarga: data.tpCarga,
        xProd: data.xProd,
        cEAN: data.cEAN,
        NCM: data.NCM
      },
      totalizadores: {
        qCTe: totalCTe,
        qNFe: totalNFe,
        qMDFe: totalMDFe,
        vCarga: data.vCarga || 0,
        cUnid: data.cUnid || '01',
        qCarga: data.qCarga || 0
      }
    });

    const certificado = await this.certificadoService.obterCertificadoDecriptado(data.empresaId);
    if (!certificado) {
      throw new Error('Certificado digital não configurado para esta empresa');
    }
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    // <infMDFeSupl> (QR Code) precisa vir ANTES de <Signature> na ordem do
    // documento, mas o elemento assinado continua sendo <infMDFe> — mesmo padrão
    // usado no QR Code da NFC-e (infNFeSupl).
    const xml = assinarXmlEnvelopado(xmlSemAssinatura, 'infMDFe', chaveECertPem, 'infMDFeSupl');

    // Transmissão real à SEFAZ (autorizador único nacional: SVRS/RS), controlada
    // por SEFAZ_TRANSMISSAO_REAL (ver nfe.service.ts). Sem ela, o MDF-e fica
    // assinado mas não autorizado — mesmo comportamento de antes desta mudança.
    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let statusFinal: 'ASSINADA' | 'AUTORIZADA' | 'REJEITADA' = 'ASSINADA';
    let protocoloFinal: string | undefined;
    let motivoRejeicaoFinal: string | undefined;

    if (transmissaoReal) {
      const resultado = await autorizarMdfe({
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
      console.warn('[MDFe] SEFAZ_TRANSMISSAO_REAL não está ativo — emissão em modo mock (assinado, mas não transmitido).');
    }

    // Atualiza com XML e o resultado real (ou mock) da transmissão
    const mdfeAtualizado = await this.mdfeRepo.updateStatus(mdfe.id, statusFinal, protocoloFinal, xml, motivoRejeicaoFinal);

    // Registra histórico
    await this.componentRepo.createHistoricoStatus({
      mdfeId: mdfe.id,
      statusAnterior: 'RASCUNHO',
      statusNovo: statusFinal,
      usuario: data.usuario || 'SISTEMA',
      motivo: statusFinal === 'REJEITADA' ? motivoRejeicaoFinal || 'Rejeitado pela SEFAZ' : 'Emissão realizada'
    });

    if (statusFinal === 'REJEITADA') {
      throw new Error(`SEFAZ rejeitou o MDF-e: ${motivoRejeicaoFinal}`);
    }

    return { ...mdfeAtualizado, xml };
  }

  private async criarComponentesMDFe(mdfeId: string, data: EmitirMdfeInput) {
    // 1. Municípios de Carregamento
    if (data.municipiosCarrega?.length > 0) {
      await this.componentRepo.createManyMunCarrega(
        data.municipiosCarrega.map((m) => ({
          mdfeId,
          cMunCarrega: obrigatorio(m.codigo, 'código do município de carregamento'),
          xMunCarrega: obrigatorio(m.nome, 'nome do município de carregamento')
        }))
      );
    }

    // 2. Percursos
    if (data.percursos && data.percursos.length > 0) {
      await this.componentRepo.createManyPercurso(
        data.percursos.map((p, index: number) => ({
          mdfeId,
          UFPer: obrigatorio(p.uf, 'UF do percurso'),
          ordem: index + 1
        }))
      );
    }

    // 3. Municípios de Descarga e documentos
    for (const munDescarga of data.municipiosDescarga) {
      const munDescargaCriado = await this.componentRepo.createMunDescarga({
        mdfeId,
        cMunDescarga: obrigatorio(munDescarga.codigo, 'código do município de descarga'),
        xMunDescarga: obrigatorio(munDescarga.nome, 'nome do município de descarga')
      });

      // 3.1 CT-e
      if (munDescarga.ctes && munDescarga.ctes.length > 0) {
        for (const cte of munDescarga.ctes) {
          const cteCriado = await this.componentRepo.createCTe({
            munDescargaId: munDescargaCriado.id,
            chCTe: obrigatorio(cte.chave, 'chave do CT-e'),
            SegCodBarra: cte.segundoCodigoBarras,
            indReentrega: cte.indReentrega || false,
            qtdTotal: cte.entregaParcial?.quantidadeTotal,
            qtdParcial: cte.entregaParcial?.quantidadeParcial,
            indPrestacaoParcial: cte.prestacaoParcial?.indicador || false
          });

          // Unidades de Transporte do CT-e
          if (cte.unidadesTransporte && cte.unidadesTransporte.length > 0) {
            await this.criarUnidadesTransporte(cteCriado.id, cte.unidadesTransporte, 'cte');
          }

          // Produtos Perigosos do CT-e
          if (cte.perigosos && cte.perigosos.length > 0) {
            await this.componentRepo.createManyPerigoso(
              cte.perigosos.map((p) => ({
                cteId: cteCriado.id,
                nONU: obrigatorio(p.numeroONU, 'número ONU do produto perigoso'),
                xNomeAE: p.nomeApropriado,
                xClaRisco: p.classeRisco,
                grEmb: p.grupoEmbalagem,
                qTotProd: obrigatorio(p.quantidadeTotal, 'quantidade total do produto perigoso').toString(),
                qVolTipo: p.quantidadeVolumes?.toString()
              }))
            );
          }

          // NF-e Prestação Parcial
          if (cte.prestacaoParcial?.nfes && cte.prestacaoParcial.nfes.length > 0) {
            await this.componentRepo.createManyNFePrestParcial(
              cte.prestacaoParcial.nfes.map((chNFe: string) => ({
                cteId: cteCriado.id,
                chNFe
              }))
            );
          }
        }
      }

      // 3.2 NF-e
      if (munDescarga.nfes && munDescarga.nfes.length > 0) {
        for (const nfe of munDescarga.nfes) {
          const nfeCriado = await this.componentRepo.createNFe({
            munDescargaId: munDescargaCriado.id,
            chNFe: obrigatorio(nfe.chave, 'chave da NF-e'),
            SegCodBarra: nfe.segundoCodigoBarras,
            indReentrega: nfe.indReentrega || false
          });

          // Unidades de Transporte da NF-e
          if (nfe.unidadesTransporte && nfe.unidadesTransporte.length > 0) {
            await this.criarUnidadesTransporte(nfeCriado.id, nfe.unidadesTransporte, 'nfe');
          }

          // Produtos Perigosos da NF-e
          if (nfe.perigosos && nfe.perigosos.length > 0) {
            await this.componentRepo.createManyPerigoso(
              nfe.perigosos.map((p) => ({
                nfeId: nfeCriado.id,
                nONU: obrigatorio(p.numeroONU, 'número ONU do produto perigoso'),
                xNomeAE: p.nomeApropriado,
                xClaRisco: p.classeRisco,
                grEmb: p.grupoEmbalagem,
                qTotProd: obrigatorio(p.quantidadeTotal, 'quantidade total do produto perigoso').toString(),
                qVolTipo: p.quantidadeVolumes?.toString()
              }))
            );
          }
        }
      }

      // 3.3 MDF-e Transportado (Aquaviário)
      if (munDescarga.mdfesTransp && munDescarga.mdfesTransp.length > 0) {
        for (const mdfeTransp of munDescarga.mdfesTransp) {
          const mdfeTranspCriado = await this.componentRepo.createMDFeTransp({
            munDescargaId: munDescargaCriado.id,
            chMDFe: obrigatorio(mdfeTransp.chave, 'chave do MDF-e transportado'),
            indReentrega: mdfeTransp.indReentrega || false
          });

          // Unidades de Transporte do MDF-e
          if (mdfeTransp.unidadesTransporte && mdfeTransp.unidadesTransporte.length > 0) {
            await this.criarUnidadesTransporte(mdfeTranspCriado.id, mdfeTransp.unidadesTransporte, 'mdfeTransp');
          }

          // Produtos Perigosos do MDF-e
          if (mdfeTransp.perigosos && mdfeTransp.perigosos.length > 0) {
            await this.componentRepo.createManyPerigoso(
              mdfeTransp.perigosos.map((p) => ({
                mdfeTranspId: mdfeTranspCriado.id,
                nONU: obrigatorio(p.numeroONU, 'número ONU do produto perigoso'),
                xNomeAE: p.nomeApropriado,
                xClaRisco: p.classeRisco,
                grEmb: p.grupoEmbalagem,
                qTotProd: obrigatorio(p.quantidadeTotal, 'quantidade total do produto perigoso').toString(),
                qVolTipo: p.quantidadeVolumes?.toString()
              }))
            );
          }
        }
      }
    }

    // 4. Seguros
    if (data.seguros && data.seguros.length > 0) {
      await this.componentRepo.createManySeguro(
        data.seguros.map((s) => ({
          mdfeId,
          respSeg: obrigatorio(s.responsavel, 'responsável pelo seguro (respSeg)'),
          respCNPJ: s.responsavelCNPJ,
          respCPF: s.responsavelCPF,
          xSeg: s.seguradoraNome,
          CNPJSeg: s.seguradoraCNPJ,
          nApol: s.apolice,
          nAver: Array.isArray(s.averbacoes)
            ? s.averbacoes.map(String)
            : (s.averbacoes !== undefined ? [String(s.averbacoes)] : [])
        }))
      );
    }

    // 5. Lacres do MDF-e
    if (data.lacres && data.lacres.length > 0) {
      await this.componentRepo.createManyLacre(
        data.lacres.map((l: string) => ({
          mdfeId,
          nLacre: l
        }))
      );
    }

    // 6. Autorizados para Download
    if (data.autorizadosDownload && data.autorizadosDownload.length > 0) {
      await this.componentRepo.createManyAutXML(
        data.autorizadosDownload.map((a) => ({
          mdfeId,
          CNPJ: a.cnpj,
          CPF: a.cpf
        }))
      );
    }
  }

  private async criarUnidadesTransporte(
    parentId: string,
    unidades: UnidadeTransporteInput[],
    parentType: 'cte' | 'nfe' | 'mdfeTransp'
  ) {
    for (const unidade of unidades) {
      const vinculo =
        parentType === 'cte' ? { cteId: parentId } :
        parentType === 'nfe' ? { nfeId: parentId } :
        { mdfeTranspId: parentId };

      const unidadeCriada = await this.componentRepo.createUnidadeTransp({
        tpUnidTransp: obrigatorio(unidade.tipo, 'tipo da unidade de transporte'),
        idUnidTransp: obrigatorio(unidade.identificacao, 'identificação da unidade de transporte'),
        ...vinculo,
        qtdRat: unidade.quantidadeRateada
      });

      // Lacres da unidade de transporte
      if (unidade.lacres && unidade.lacres.length > 0) {
        await this.componentRepo.createManyLacreUnidade(
          unidade.lacres.map((l: string) => ({
            unidadeTranspId: unidadeCriada.id,
            nLacre: l
          }))
        );
      }

      // Unidades de carga
      if (unidade.unidadesCarga && unidade.unidadesCarga.length > 0) {
        for (const uc of unidade.unidadesCarga) {
          const ucCriada = await this.componentRepo.createUnidadeCarga({
            unidadeTranspId: unidadeCriada.id,
            tpUnidCarga: obrigatorio(uc.tipo, 'tipo da unidade de carga'),
            idUnidCarga: obrigatorio(uc.identificacao, 'identificação da unidade de carga'),
            qtdRat: uc.quantidadeRateada
          });

          // Lacres da unidade de carga
          if (uc.lacres && uc.lacres.length > 0) {
            await this.componentRepo.createManyLacreUnidadeCarga(
              uc.lacres.map((l: string) => ({
                unidadeCargaId: ucCriada.id,
                nLacre: l
              }))
            );
          }
        }
      }
    }
  }

  async encerrarMdfe(
    id: string,
    protocolo: string,
    municipioEncerramento: string,
    empresaId: string,
    codigoMunicipioEncerramento?: string
  ) {
    const mdfe = await this.mdfeRepo.findById(id);
    if (!mdfe) throw new Error('MDF-e não encontrado');
    if (mdfe.empresaId !== empresaId) throw new Error('Acesso negado');

    if (mdfe.status === 'ENCERRADA') {
      throw new Error('MDF-e já está encerrado');
    }

    if (mdfe.status !== 'AUTORIZADA') {
      throw new Error('MDF-e deve estar autorizado para ser encerrado');
    }

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let protocoloFinal = protocolo;

    if (transmissaoReal) {
      if (!mdfe.protocoloAutorizacao) {
        throw new Error('MDF-e autorizado sem protocolo de autorização registrado');
      }
      if (!codigoMunicipioEncerramento) {
        throw new Error('Código IBGE do município de encerramento é obrigatório para transmissão real');
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) throw new Error('Empresa não encontrada');

      const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

      const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;
      const xmlEvento = gerarXmlEncerramentoMdfe({
        chaveAcessoMdfe: mdfe.chaveAcesso,
        cnpjAutor: empresa.cnpj,
        sequencialEvento: 1,
        protocoloAutorizacao: mdfe.protocoloAutorizacao,
        codigoUFEncerramento: codigoMunicipioEncerramento.slice(0, 2),
        codigoMunicipioEncerramento,
        ambiente,
      });
      const xmlEventoAssinado = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEventoMdfe({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        xmlEventoAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou o encerramento: ${resultado.xMotivo || 'motivo não informado'} (cStat ${resultado.cStat})`);
      }

      protocoloFinal = resultado.nProt || protocolo;
    } else {
      console.warn('[MDFe] SEFAZ_TRANSMISSAO_REAL não está ativo — encerramento em modo mock (não transmitido).');
    }

    const result = await this.mdfeRepo.encerrar(id, protocoloFinal, municipioEncerramento);

    await this.componentRepo.createHistoricoStatus({
      mdfeId: id,
      statusAnterior: mdfe.status,
      statusNovo: 'ENCERRADA',
      usuario: 'SISTEMA',
      motivo: 'Encerramento da viagem'
    });

    return result;
  }

  async cancelarMdfe(id: string, motivo: string, empresaId: string) {
    const mdfe = await this.mdfeRepo.findById(id);
    if (!mdfe) throw new Error('MDF-e não encontrado');
    if (mdfe.empresaId !== empresaId) throw new Error('Acesso negado');

    if (mdfe.status === 'CANCELADA') {
      throw new Error('MDF-e já está cancelado');
    }

    if (mdfe.status === 'ENCERRADA') {
      throw new Error('MDF-e encerrado não pode ser cancelado');
    }

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';

    if (transmissaoReal) {
      if (!mdfe.protocoloAutorizacao) {
        throw new Error('MDF-e sem protocolo de autorização registrado');
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) throw new Error('Empresa não encontrada');

      const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

      const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;
      const xmlEvento = gerarXmlCancelamentoMdfe({
        chaveAcessoMdfe: mdfe.chaveAcesso,
        cnpjAutor: empresa.cnpj,
        sequencialEvento: 1,
        justificativa: motivo,
        protocoloAutorizacao: mdfe.protocoloAutorizacao,
        ambiente,
      });
      const xmlEventoAssinado = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEventoMdfe({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        xmlEventoAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou o cancelamento: ${resultado.xMotivo || 'motivo não informado'} (cStat ${resultado.cStat})`);
      }
    } else {
      console.warn('[MDFe] SEFAZ_TRANSMISSAO_REAL não está ativo — cancelamento em modo mock (não transmitido).');
    }

    const result = await this.mdfeRepo.cancelar(id, motivo);

    await this.componentRepo.createHistoricoStatus({
      mdfeId: id,
      statusAnterior: mdfe.status,
      statusNovo: 'CANCELADA',
      usuario: 'SISTEMA',
      motivo
    });

    return result;
  }

  async getEstatisticas(empresaId: string) {
    return this.mdfeRepo.getEstatisticas(empresaId);
  }

  async getTotalCarga(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.mdfeRepo.getTotalCarga(empresaId, startDate, endDate);
  }

  private async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroMdfe || 1);
  }
}