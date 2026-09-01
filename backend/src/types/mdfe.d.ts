// src/types/mdfe.d.ts

/**
 * Tipos e Interfaces para MDF-e (Manifesto de Documentos Fiscais Eletrônicos)
 * Versão 3.00 - Conforme Schema XSD da SEFAZ
 * SUP TECNOLOGIA - BACKEND
 */

export type ModalMDFe = 'RODOVIARIO' | 'AEREO' | 'AQUAVIARIO' | 'FERROVIARIO';
export type TipoEmitenteMDFe = 'PRESTADOR_SERVICO' | 'TRANSPORTADOR_CARGA_PROPRIA' | 'CTE_GLOBALIZADO';
export type TipoTransportadorMDFe = 'ETC' | 'TAC' | 'CTC';
export type TipoCargaMDFe = 
  | 'GRANEL_SOLIDO' | 'GRANEL_LIQUIDO' | 'FRIGORIFICADA' 
  | 'CONTEINERIZADA' | 'CARGA_GERAL' | 'NEOGRANEL'
  | 'PERIGOSA_GRANEL_SOLIDO' | 'PERIGOSA_GRANEL_LIQUIDO' 
  | 'PERIGOSA_FRIGORIFICADA' | 'PERIGOSA_CONTEINERIZADA' 
  | 'PERIGOSA_CARGA_GERAL' | 'GRANEL_PRESSURIZADA';
export type StatusMDFe = 'RASCUNHO' | 'VALIDADA' | 'ASSINADA' | 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA' | 'CANCELADA' | 'DENEGADA' | 'ENCERRADA';

export interface EnderecoMDFe {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
}

export interface EmitenteMDFe {
  cnpj?: string;
  cpf?: string;
  inscricaoEstadual?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: EnderecoMDFe;
}

export interface MunicipioCarregaMDFe {
  codigo: string;
  nome: string;
}

export interface PercursoMDFe {
  uf: string;
  ordem: number;
}

export interface UnidadeTransporteMDFe {
  tipo: '1' | '2' | '3' | '4' | '5' | '6' | '7'; // 1=Tração, 2=Reboque, 3=Navio, 4=Balsa, 5=Aeronave, 6=Vagão, 7=Outros
  identificacao: string;
  lacres?: string[];
  unidadesCarga?: UnidadeCargaMDFe[];
  quantidadeRateada?: number;
}

export interface UnidadeCargaMDFe {
  tipo: '1' | '2' | '3' | '4'; // 1=Container, 2=ULD, 3=Pallet, 4=Outros
  identificacao: string;
  lacres?: string[];
  quantidadeRateada?: number;
}

export interface ProdutoPerigosoMDFe {
  numeroONU: string;
  nomeApropriado?: string;
  classeRisco?: string;
  grupoEmbalagem?: string;
  quantidadeTotal: string;
  quantidadeVolumes?: string;
}

export interface EntregaParcialMDFe {
  quantidadeTotal: number;
  quantidadeParcial: number;
}

export interface SeguroMDFe {
  responsavel: '1' | '2'; // 1=Emitente, 2=Contratante
  responsavelCNPJ?: string;
  responsavelCPF?: string;
  seguradoraNome?: string;
  seguradoraCNPJ?: string;
  apolice?: string;
  averbacoes?: string[];
}

export interface DocumentoCTeMDFe {
  chave: string;
  segundoCodigoBarras?: string;
  indReentrega?: boolean;
  unidadesTransporte?: UnidadeTransporteMDFe[];
  perigosos?: ProdutoPerigosoMDFe[];
  entregaParcial?: EntregaParcialMDFe;
  prestacaoParcial?: {
    indicador: boolean;
    nfes: string[]; // Chaves das NF-e
  };
}

export interface DocumentoNFeMDFe {
  chave: string;
  segundoCodigoBarras?: string;
  indReentrega?: boolean;
  unidadesTransporte?: UnidadeTransporteMDFe[];
  perigosos?: ProdutoPerigosoMDFe[];
}

export interface MDFeDocumento {
  id: string;
  chaveAcesso: string;
  modelo: '58';
  serie: number;
  numero: number;
  cUF: string;
  cMDF: string;
  cDV: string;
  modal: ModalMDFe;
  tpAmb: '1' | '2';
  tpEmit: TipoEmitenteMDFe;
  tpTransp?: TipoTransportadorMDFe;
  tpEmis: '1' | '2' | '3';
  procEmi: '0' | '4';
  verProc: string;
  dhEmi: string;
  dhIniViagem?: string;
  UFIni: string;
  UFFim: string;
  indCanalVerde?: boolean;
  indCarregaPosterior?: boolean;
  status: StatusMDFe;
  emitente: EmitenteMDFe;
  municipiosCarrega: MunicipioCarregaMDFe[];
  percursos: PercursoMDFe[];
  municipiosDescarga: MunicipioDescargaMDFe[];
  seguros?: SeguroMDFe[];
  lacres?: string[];
  autorizadosDownload?: { cnpj?: string; cpf?: string }[];
  informacoesAdicionais?: {
    fisco?: string;
    complementares?: string;
  };
  produtoPredominante: {
    tipoCarga: TipoCargaMDFe;
    descricao: string;
    ean?: string;
    ncm?: string;
    localCarrega?: { cep?: string; latitude?: number; longitude?: number };
    localDescarrega?: { cep?: string; latitude?: number; longitude?: number };
  };
  totalizadores: {
    qCTe?: number;
    qNFe?: number;
    qMDFe?: number;
    valorCarga: number;
    unidadePeso: '01' | '02';
    pesoCarga: number;
  };
  protocoloAutorizacao?: string;
  dataHoraAutorizacao?: string;
  motivoRejeicao?: string;
  dataHoraRejeicao?: string;
  xmlAssinado: string;
  xmlModal?: string;
}

export interface MunicipioDescargaMDFe {
  codigo: string;
  nome: string;
  documentos: {
    ctes?: DocumentoCTeMDFe[];
    nfes?: DocumentoNFeMDFe[];
    mdfesTransp?: DocumentoMDFeTranspMDFe[];
  };
}

export interface DocumentoMDFeTranspMDFe {
  chave: string;
  indReentrega?: boolean;
  unidadesTransporte?: UnidadeTransporteMDFe[];
  perigosos?: ProdutoPerigosoMDFe[];
}