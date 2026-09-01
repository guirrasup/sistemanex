// C:\emissornfe\backend\src\types\fiscal.d.ts

/**
 * Tipos e Interfaces para Documentos Fiscais Brasileiros
 * SUP TECNOLOGIA - BACKEND
 * Padrões: NFS-e Padrão Nacional v1.01, NF-e v4.00, NFC-e v4.00
 */

export type TipoDocumentoFiscal = 'NFSE' | 'NFE' | 'NFCE' | 'CTE' | 'NFAE';
export type StatusDocumentoFiscal = 'AUTORIZADA' | 'CANCELADA' | 'SUBSTITUIDA' | 'PROCESSANDO' | 'REJEITADA';
export type TipoAmbiente = 1 | 2;
export type TipoEmissao = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9;
export type RegimeTributario = 1 | 2 | 3;
export type TributacaoISSQN = 1 | 2 | 3 | 4;
export type TipoRetencaoISS = 1 | 2 | 3;

// ============================================================
// TIPOS BÁSICOS (PL_006h)
// ============================================================

export type TChNFe = string; // 44 dígitos
export type TProt = string; // 15 ou 17 dígitos
export type TDec_1104v = number; // até 15 dígitos, 4 decimais
export type TData = string; // YYYY-MM-DD
export type TDateTimeUTC = string; // YYYY-MM-DDThh:mm:ss±hh:mm
export type TJust = string; // 15-255 caracteres
export type TVerAplic = string; // 1-20 caracteres
export type TString = string;
export type FormaPagamento = '01' | '02' | '03' | '04' | '05' | '10' | '11' | '12' | '13' | '15' | '17' | '90' | '99';

// ============================================================
// INTERFACES BASE
// ============================================================

export interface EnderecoFiscal {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  codigoPais?: string;
  nomePais?: string;
  telefone?: string;
  email?: string;
}

export interface EmitenteFiscal {
  cnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  regimeTributario: RegimeTributario;
  optanteSimplesNacional: boolean;
  optanteMEI: boolean;
  endereco: EnderecoFiscal;
  aliquotaSimplesNacional?: number;
}

export interface TomadorFiscal {
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  documento: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  inscricaoEstadualST?: string;
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  endereco: EnderecoFiscal;
  email?: string;
  telefone?: string;
  indicadorIEDestinatario?: '1' | '2' | '9';
}

// ============================================================
// NFC-e (MODELO 65) - LEIAUTE 4.00
// ============================================================

export interface PagamentoNFCe {
  indPag?: '0' | '1';
  tPag: FormaPagamento;
  xPag?: string;
  vPag: TDec_1104v;
  dPag?: TData;
  tpIntegra?: '0' | '1';
  CNPJPag?: string;
  UFPag?: string;
  CNPJInstPag?: string;
  tBand?: string;
  cAut?: string;
  CNPJReceb?: string;
  idTermPag?: string;
}

export interface NFCeDocumento {
  id: string;
  modelo: '65';
  serie: number;
  numero: number;
  chaveAcesso: TChNFe;
  dataHoraEmissao: TDateTimeUTC;
  naturezaOperacao: TString;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  
  // Emitente
  emitente: EmitenteFiscal;
  
  // Consumidor
  consumidorIdentificado: boolean;
  consumidorCpf?: string;
  consumidorNome?: string;
  consumidorEmail?: string;
  consumidorTelefone?: string;
  consumidorEndereco?: EnderecoFiscal;
  
  // Itens
  itens: ItemNfe[];
  
  // Valores
  valorTotalProdutos: TDec_1104v;
  valorTotalDesconto: TDec_1104v;
  valorTotalAcrescimo?: TDec_1104v;
  valorTotalTributosAproximados: TDec_1104v;
  valorTotalNota: TDec_1104v;
  
  // Pagamento
  formaPagamento: FormaPagamento;
  valorPago: TDec_1104v;
  valorTroco: TDec_1104v;
  pagamentos?: PagamentoNFCe[];
  
  // QR Code
  urlQrCode: string;
  tokenCscId: string;
  
  // Identificação (leiaute 4.00)
  tpNF?: 0 | 1;
  idDest?: 1 | 2 | 3;
  finNFe?: 1 | 2 | 3 | 4;
  indFinal?: 0 | 1;
  indPres?: 0 | 1 | 2 | 3 | 4 | 5 | 9;
  procEmi?: string;
  verProc?: TVerAplic;
  tpEmis?: TipoEmissao;
  
  // Informações adicionais
  infAdFisco?: TString;
  infCpl?: TString;
  
  // Protocolo
  protocoloAutorizacao: TProt;
  dataHoraAutorizacao: TDateTimeUTC;
  motivoCancelamento?: TJust;
  dataHoraCancelamento?: TDateTimeUTC;
  
  // XML
  xmlAssinado: string;
}

// ============================================================
// NF-e (MODELO 55) - LEIAUTE 4.00
// ============================================================

export interface ItemNfe {
  id: string;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalBruto: number;
  descontoItem?: number;
  origemMercadoria: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  cstICMS: string;
  csosnICMS?: string;
  aliquotaICMS: number;
  baseCalculoICMS: number;
  valorICMS: number;
  aliquotaICMSST?: number;
  valorICMSST?: number;
  cstIPI?: string;
  aliquotaIPI?: number;
  valorIPI?: number;
  cstPIS: string;
  aliquotaPIS: number;
  valorPIS: number;
  cstCOFINS: string;
  aliquotaCOFINS: number;
  valorCOFINS: number;
  cstIBSCBS?: string;
  aliquotaIBSUF?: number;
  valorIBSUF?: number;
  aliquotaIBSMun?: number;
  valorIBSMun?: number;
  aliquotaCBS?: number;
  valorCBS?: number;
  valorTributosAproximados: number;
  codigoEAN?: string;
  codigoEANTrib?: string;
  cBarra?: string;
  cBarraTrib?: string;
  xPed?: string;
  nItemPed?: number;
  nFCI?: string;
  indTot?: '0' | '1';
  infAdProd?: string;
}

export interface NFeDocumento {
  id: string;
  modelo: '55' | '65';
  serie: number;
  numero: number;
  chaveAcesso: TChNFe;
  dataHoraEmissao: TDateTimeUTC;
  dataHoraSaida?: TDateTimeUTC;
  naturezaOperacao: TString;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  tipoDocumento: 0 | 1;
  finalidade: 1 | 2 | 3 | 4;
  consumidorFinal: boolean;
  presencaComprador: 0 | 1 | 2 | 3 | 4 | 9;
  status: StatusDocumentoFiscal;
  idDest?: 1 | 2 | 3;
  tpImp?: 1 | 2 | 3;
  emitente: EmitenteFiscal;
  destinatario: TomadorFiscal;
  itens: ItemNfe[];
  valorTotalProdutos: TDec_1104v;
  valorTotalFrete: TDec_1104v;
  valorTotalSeguro: TDec_1104v;
  valorTotalDesconto: TDec_1104v;
  valorTotalOutrasDespesas: TDec_1104v;
  baseCalculoICMS: TDec_1104v;
  valorTotalICMS: TDec_1104v;
  baseCalculoICMSST: TDec_1104v;
  valorTotalICMSST: TDec_1104v;
  valorTotalIPI: TDec_1104v;
  valorTotalPIS: TDec_1104v;
  valorTotalCOFINS: TDec_1104v;
  valorTotalIBS: TDec_1104v;
  valorTotalCBS: TDec_1104v;
  valorTotalTributosAproximados: TDec_1104v;
  valorTotalNota: TDec_1104v;
  formaPagamento: FormaPagamento;
  protocoloAutorizacao: TProt;
  dataHoraAutorizacao: TDateTimeUTC;
  informacoesAdicionais?: TString;
  motivoCancelamento?: TJust;
  dataHoraCancelamento?: TDateTimeUTC;
  xmlAssinado: string;
}

// ============================================================
// NFS-e (PADRÃO NACIONAL) - v1.01
// ============================================================

export interface InformacoesIBSCBS {
  finalidade: number;
  indicadorUsoConsumoPessoal: 0 | 1;
  codigoIndicadorOperacao: string;
  indicadorDestinatario: 0 | 1;
  cstIBSCBS: string;
  codigoClassificacaoTrib: string;
  aliquotaIBSUF: number;
  valorIBSUF: number;
  aliquotaIBSMun: number;
  valorIBSMun: number;
  aliquotaCBS: number;
  valorCBS: number;
  pagamentoVinculado?: {
    numeroPagamento: number;
    idTransacao: string;
    tipoMeioPagamento: string;
    cnpjRecebedor: string;
    cnpjBasePSP: string;
  };
}

export interface ServicoItemNfse {
  codigoTributacaoNacional: string;
  codigoTributacaoMunicipal: string;
  descricao: string;
  codigoNBS?: string;
  localPrestacao: {
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
  };
  valorServico: number;
  descontoIncondicionado?: number;
  descontoCondicionado?: number;
  deducoesMateriais?: number;
  tributacaoISSQN: TributacaoISSQN;
  aliquotaISS: number;
  valorISS: number;
  tipoRetencaoISS: TipoRetencaoISS;
  valorISSRetido: number;
  baseCalculoISS: number;
  cstPisCofins?: string;
  aliquotaPIS?: number;
  valorPIS?: number;
  retidoPIS?: boolean;
  aliquotaCOFINS?: number;
  valorCOFINS?: number;
  retidoCOFINS?: boolean;
  aliquotaIRRF?: number;
  valorIRRF?: number;
  aliquotaCSLL?: number;
  valorCSLL?: number;
  aliquotaINSS?: number;
  valorINSS?: number;
  ibscbs?: InformacoesIBSCBS;
  valorTributosFederais: number;
  valorTributosEstaduais: number;
  valorTributosMunicipais: number;
  percentualTotalTributos: number;
}

export interface NFSeDocumento {
  id: string;
  chaveAcesso: string;
  numeroNfse: number;
  serieDPS: number;
  numeroDPS: number;
  dataCompetencia: TData;
  dataHoraEmissao: TDateTimeUTC;
  dataHoraProcessamento: TDateTimeUTC;
  codigoVerificacao: string;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  emitente: EmitenteFiscal;
  tomador: TomadorFiscal;
  servico: ServicoItemNfse;
  valorTotalServicos: TDec_1104v;
  valorTotalDescontos: TDec_1104v;
  valorTotalDeducoes: TDec_1104v;
  baseCalculoISS: TDec_1104v;
  valorTotalISS: TDec_1104v;
  valorTotalISSRetido: TDec_1104v;
  valorTotalRetencoesFederais: TDec_1104v;
  valorTotalIBS: TDec_1104v;
  valorTotalCBS: TDec_1104v;
  valorLiquidoNfse: TDec_1104v;
  valorTotalNotaFinal: TDec_1104v;
  informacoesComplementares?: TString;
  motivoCancelamento?: TJust;
  dataHoraCancelamento?: TDateTimeUTC;
  xmlAssinado: string;
}

// ============================================================
// CT-e (MODELO 57)
// ============================================================

export interface CTeDocumento {
  id: string;
  modelo: '57';
  serie: number;
  numero: number;
  chaveAcesso: TChNFe;
  dataHoraEmissao: TDateTimeUTC;
  naturezaOperacao: string;
  cfop: string;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  emitente: EmitenteFiscal;
  remetente: TomadorFiscal;
  destinatario: TomadorFiscal;
  expedidor?: TomadorFiscal;
  recebedor?: TomadorFiscal;
  tomadorServico: 0 | 1 | 2 | 3 | 4;
  municipioInicio: {
    codigoIbge: string;
    nome: string;
    uf: string;
  };
  municipioFim: {
    codigoIbge: string;
    nome: string;
    uf: string;
  };
  produtoPredominante: string;
  valorCargaAverbada: TDec_1104v;
  pesoBrutoKg: TDec_1104v;
  pesoLiquidoKg: TDec_1104v;
  quantidadeVolumes: number;
  especieVolumes: string;
  cubagemM3?: TDec_1104v;
  chavesNFeTransportadas: TChNFe[];
  rntrc: string;
  veiculo: {
    placa: string;
    uf: string;
    rntrcProprietario?: string;
  };
  motorista: {
    nome: string;
    cpf: string;
  };
  valorTotalFrete: TDec_1104v;
  componentesValor: {
    fretePeso: TDec_1104v;
    freteValor: TDec_1104v;
    pedagio: TDec_1104v;
    taxaGris: TDec_1104v;
    outrasTaxas: TDec_1104v;
  };
  valorReceber: TDec_1104v;
  cstICMS: '00' | '20' | '40' | '60' | '90';
  baseCalculoICMS: TDec_1104v;
  aliquotaICMS: number;
  valorICMS: TDec_1104v;
  valorPIS: TDec_1104v;
  valorCOFINS: TDec_1104v;
  valorTributosAproximados: TDec_1104v;
  protocoloAutorizacao: TProt;
  dataHoraAutorizacao: TDateTimeUTC;
  motivoCancelamento?: TJust;
  dataHoraCancelamento?: TDateTimeUTC;
  xmlAssinado: string;
}

// ============================================================
// NFA-e (MODELO 01-AVULSA)
// ============================================================

export type MotivoEmissaoNFAe = 
  | 'PRODUTOR_RURAL'
  | 'MEI_SEM_IE'
  | 'PF_ATIVO_PESSOAL'
  | 'FEIRAS_EVENTOS'
  | 'DEVOLUCAO_AVULSA'
  | 'OUTROS';

export interface ItemNfae {
  id: string;
  codigo: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: TDec_1104v;
  valorUnitario: TDec_1104v;
  valorTotal: TDec_1104v;
  aliquotaICMS: number;
  valorICMS: TDec_1104v;
}

export interface NFAeDocumento {
  id: string;
  modelo: '01-AVULSA';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: TDateTimeUTC;
  naturezaOperacao: string;
  motivoEmissao: MotivoEmissaoNFAe;
  descricaoMotivo: string;
  ambiente: TipoAmbiente;
  status: StatusDocumentoFiscal;
  requerente: {
    tipoPessoa: 'PF' | 'PJ';
    cpfCnpj: string;
    nomeRazaoSocial: string;
    inscricaoProdutorRural?: string;
    endereco: EnderecoFiscal;
    telefone?: string;
    email?: string;
  };
  destinatario: TomadorFiscal;
  itens: ItemNfae[];
  valorTotalProdutos: TDec_1104v;
  baseCalculoICMS: TDec_1104v;
  aliquotaICMSMediana: number;
  valorTotalICMS: TDec_1104v;
  valorTotalNota: TDec_1104v;
  guiaDAE?: {
    numeroDAE: string;
    codigoBarras: string;
    chavePixSefaz: string;
    dataVencimento: TData;
    valorDAE: TDec_1104v;
    statusPagamento: 'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'ISENTO';
  };
  orgaoEmissorSefaz: string;
  protocoloAutorizacao: TProt;
  dataHoraAutorizacao: TDateTimeUTC;
  motivoCancelamento?: TJust;
  dataHoraCancelamento?: TDateTimeUTC;
  xmlAssinado: string;
}