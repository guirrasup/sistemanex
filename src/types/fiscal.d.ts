/**
 * Tipos e Interfaces para Documentos Fiscais Brasileiros
 * SUP TECNOLOGIA - Emissor Fiscal & Gestão ERP
 * 
 * ✅ EM CONFORMIDADE COM:
 * - PL_006h - Tipos Básicos NF-e (NT 2011/004)
 * - NFS-e Padrão Nacional v1.01 (com IBS/CBS 2026)
 * - NF-e v4.00, NFC-e v4.00
 * - Schema Prisma
 */

// ============================================================
// TIPOS BÁSICOS DO PL_006h
// ============================================================

/**
 * TCodUfIBGE: Código da UF da tabela do IBGE (2 dígitos)
 * Valores: 11,12,13,14,15,16,17,21,22,23,24,25,26,27,28,29,31,32,33,35,41,42,43,50,51,52,53
 */
export type TCodUfIBGE = 
  | '11' | '12' | '13' | '14' | '15' | '16' | '17'
  | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29'
  | '31' | '32' | '33' | '35'
  | '41' | '42' | '43'
  | '50' | '51' | '52' | '53';

/**
 * TCodMunIBGE: Código do Município da tabela do IBGE (7 dígitos)
 * Ex: "3550308" (São Paulo)
 */
export type TCodMunIBGE = string; // 7 dígitos

/**
 * TChNFe: Chave da Nota Fiscal Eletrônica (44 dígitos)
 * Ex: "35260818236447000190550010000010411123456784"
 */
export type TChNFe = string; // 44 dígitos

/**
 * TProt: Número do Protocolo de Status (15 ou 17 dígitos)
 * Ex: "13526001234567890" ou "135260012345678"
 */
export type TProt = string; // 15 ou 17 dígitos

/**
 * TRec: Número do Recibo do envio de lote de NF-e (15 dígitos)
 */
export type TRec = string; // 15 dígitos

/**
 * TStat: Código da Mensagem enviada (3 dígitos)
 * Ex: "100", "200", "301"
 */
export type TStat = string; // 3 dígitos

/**
 * TCnpj: Número do CNPJ (14 dígitos)
 * Ex: "18236447000190"
 */
export type TCnpj = string; // 14 dígitos

/**
 * TCnpjVar: Número do CNPJ tamanho variável (3-14 dígitos)
 */
export type TCnpjVar = string; // 3-14 dígitos

/**
 * TCnpjOpc: Número do CNPJ Opcional (vazio ou 14 dígitos)
 */
export type TCnpjOpc = string; // '' ou 14 dígitos

/**
 * TCpf: Número do CPF (11 dígitos)
 * Ex: "12345678900"
 */
export type TCpf = string; // 11 dígitos

/**
 * TCpfVar: Número do CPF de tamanho variável (3-11 dígitos)
 */
export type TCpfVar = string; // 3-11 dígitos

/**
 * TDec_0302: Decimal com 5 dígitos, sendo 3 de corpo e 2 decimais
 * Ex: 0, 0.00, 1.00, 999.99
 */
export type TDec_0302 = string; // Regex: 0|0\.[0-9]{2}|[1-9]{1}[0-9]{0,2}(\.[0-9]{2})?

/**
 * TDec_0302Opc: Decimal opcional com 3/2 (não pode ser 0.00)
 */
export type TDec_0302Opc = string; // Regex: 0\.[0-9]{1}[1-9]{1}|0\.[1-9]{1}[0-9]{1}|[1-9]{1}[0-9]{0,2}(\.[0-9]{2})?

/**
 * TDec_0302_04: Decimal com até 3 dígitos inteiros, 2-4 decimais
 * Ex: 0, 0.00, 0.0000, 999.9999
 * ⭐ USADO EM ALÍQUOTAS (ISS, PIS, COFINS, IBS, CBS)
 */
export type TDec_0302_04 = string; // Regex: 0|0\.[0-9]{2,4}|[1-9]{1}[0-9]{0,2}(\.[0-9]{2,4})?

/**
 * TDec_0803: Decimal com 11 dígitos, sendo 8 de corpo e 3 decimais
 * Ex: 0, 0.000, 1.000, 99999999.999
 * ⭐ USADO EM QUANTIDADES DE ESTOQUE
 */
export type TDec_0803 = string; // Regex: 0|0\.[0-9]{3}|[1-9]{1}[0-9]{0,7}(\.[0-9]{3})?

/**
 * TDec_0804: Decimal com 12 dígitos, sendo 8 de corpo e 4 decimais
 */
export type TDec_0804 = string; // Regex: 0|0\.[0-9]{4}|[1-9]{1}[0-9]{0,7}(\.[0-9]{4})?

/**
 * TDec_1104v: Decimal com até 15 dígitos, sendo 11 de corpo e até 4 decimais
 * Ex: 0, 0.00, 99999999999.9999
 * ⭐ MAIS USADO EM VALORES FINANCEIROS (NF-e, NFS-e, CT-e, etc.)
 */
export type TDec_1104v = string; // Regex: 0|0\.[0-9]{1,4}|[1-9]{1}[0-9]{0,10}|[1-9]{1}[0-9]{0,10}(\.[0-9]{1,4})?

/**
 * TDec_1204: Decimal com 16 dígitos, sendo 12 de corpo e 4 decimais
 */
export type TDec_1204 = string; // Regex: 0|0\.[0-9]{1,4}|[1-9]{1}[0-9]{0,11}|[1-9]{1}[0-9]{0,11}(\.[0-9]{1,4})?

/**
 * TDec_1302: Decimal com 15 dígitos, sendo 13 de corpo e 2 decimais
 * Ex: 9999999999999.99
 * ⭐ USADO EM CRÉDITO PRESUMIDO
 */
export type TDec_1302 = string; // Regex: 0|0\.[0-9]{2}|[1-9]{1}[0-9]{0,12}(\.[0-9]{2})?

/**
 * TDec_1110: Decimal com até 21 dígitos, sendo 11 de corpo e até 10 decimais
 */
export type TDec_1110 = string; // Regex: 0|0\.[0-9]{1,10}|[1-9]{1}[0-9]{0,10}|[1-9]{1}[0-9]{0,10}(\.[0-9]{1,10})?

/**
 * TIeDest: Inscrição Estadual do Destinatário (ISENTO ou 0-14 dígitos)
 */
export type TIeDest = string; // "ISENTO" ou [0-9]{0,14}

/**
 * TIeST: Inscrição Estadual do ST (2-14 dígitos)
 */
export type TIeST = string; // [0-9]{2,14}

/**
 * TIe: Inscrição Estadual do Emitente (2-14 dígitos ou ISENTO)
 */
export type TIe = string; // [0-9]{2,14} ou "ISENTO"

/**
 * TMod: Tipo Modelo Documento Fiscal
 * 55 = NF-e, 65 = NFC-e, 57 = CT-e, 01-AVULSA = NFA-e
 */
export type TMod = '55' | '65' | '57' | '01-AVULSA';

/**
 * TNF: Número do Documento Fiscal (1-999999999)
 */
export type TNF = number; // 1-999999999

/**
 * TSerie: Série do Documento Fiscal (0 ou 1-999)
 */
export type TSerie = number; // 0 ou 1-999

/**
 * Tpais: Código do País (tabela BACEN)
 * 1058 = BRASIL
 */
export type Tpais = string; // Código de 3 ou 4 dígitos

/**
 * TUf: Sigla da UF (inclui EX para exterior)
 */
export type TUf = 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MG' | 'MS' | 'MT' | 'PA' | 'PB' | 'PE' | 'PI' | 'PR' | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO' | 'EX';

/**
 * TUfEmi: Sigla da UF de emissor (NÃO inclui EX)
 */
export type TUfEmi = Exclude<TUf, 'EX'>;

/**
 * TAmb: Tipo Ambiente (1=Produção, 2=Homologação)
 */
export type TAmb = 1 | 2;

/**
 * TpAutor: Tipo Autor do Evento
 * 1=Empresa Emitente, 2=Empresa destinatária, 3=Empresa, 5=Fisco, 6=RFB, 9=Outros Órgãos
 */
export type TpAutor = 1 | 2 | 3 | 5 | 6 | 9;

/**
 * TString: Tipo string genérico com caracteres permitidos [!-ÿ]
 */
export type TString = string; // Regex: [!-ÿ]{1}[ -ÿ]{0,}[!-ÿ]{1}|[!-ÿ]{1}

/**
 * TData: Tipo data AAAA-MM-DD
 */
export type TData = string; // YYYY-MM-DD

/**
 * TTime: Tipo hora HH:MM:SS
 */
export type TTime = string; // HH:MM:SS

/**
 * TDateTimeUTC: Data e Hora formato UTC (AAAA-MM-DDThh:mm:ssTZD)
 * Ex: "2026-08-29T14:30:00-03:00"
 */
export type TDateTimeUTC = string; // YYYY-MM-DDThh:mm:ss±hh:mm

/**
 * TJust: Justificativa (15-255 caracteres)
 */
export type TJust = string; // 15-255 caracteres

/**
 * TMotivo: Motivo (1-255 caracteres)
 */
export type TMotivo = string; // 1-255 caracteres

/**
 * TVerAplic: Versão do Aplicativo (1-20 caracteres)
 */
export type TVerAplic = string; // 1-20 caracteres

/**
 * TnItem: Número do Item (1-999 com regras específicas)
 * Regra: 1-99 ou 100-899 ou 900-989 ou 990
 */
export type TnItem = string; // [1-9]{1}[0-9]{0,1}|[1-8]{1}[0-9]{2}|[9]{1}[0-8]{1}[0-9]{1}|[9]{1}[9]{1}[0]{1}

// ============================================================
// ENUMS FISCAIS
// ============================================================

export type TipoDocumentoFiscal = 'NFSE' | 'NFE' | 'NFCE' | 'CTE' | 'NFAE';

export type StatusDocumentoFiscal = 
  | 'AUTORIZADA' 
  | 'CANCELADA' 
  | 'SUBSTITUIDA' 
  | 'PROCESSANDO' 
  | 'REJEITADA'
  | 'RASCUNHO';

export type TipoEmissao = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9; 
// 1=Normal, 2=Contingência, 3=Regime Especial, 4=SCAN, 5=SVC, 6=SVC_RS, 7=SVC_PR, 9=Off-line

export type RegimeTributario = 1 | 2 | 3; 
// 1=Simples Nacional, 2=Simples Nacional (excesso), 3=Regime Normal

export type RegimeEspecialTributacao = 0 | 1 | 2 | 3 | 4 | 5 | 6; 
// 0=Nenhum, 1=Cooperativa, 2=Estimativa, 3=ME Municipal, 4=Notário, 5=Autônomo, 6=Sociedade Profissionais

export type TributacaoISSQN = 1 | 2 | 3 | 4; 
// 1=Operação Tributável, 2=Imunidade, 3=Exportação, 4=Não Incidência

export type TipoRetencaoISS = 1 | 2 | 3; 
// 1=Não Retido, 2=Retido Tomador, 3=Retido Intermediário

export type TipoRetencaoPisCofins = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TpNF = 0 | 1; // 0=Entrada, 1=Saída

export type FinalidadeNFe = 1 | 2 | 3 | 4; 
// 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução

export type IndPresenca = 0 | 1 | 2 | 3 | 4 | 5 | 9; 
// 0=Não se aplica, 1=Presencial, 2=Não presencial, 3=Internet, 4=Teleatendimento, 5=NFC-e entrega, 9=Presencial fora

export type IdDest = 1 | 2 | 3; 
// 1=Operação interna, 2=Interestadual, 3=Exterior

export type TpImp = 1 | 2 | 3; 
// 1=Sem DANFE, 2=DANFE Normal, 3=DANFE Simplificado

export type ModalidadeFrete = 0 | 1 | 2 | 3 | 4 | 9; 
// 0=Emitente (CIF), 1=Destinatário (FOB), 2=Terceiros, 3=Sem Frete, 4=Próprio, 9=Sem Frete

export type CSTICMS = '00' | '10' | '20' | '30' | '40' | '41' | '50' | '51' | '60' | '70' | '90';
export type CSOSN = '101' | '102' | '103' | '201' | '202' | '203' | '300' | '400' | '500' | '900';

export type FormaPagamento = 
  | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10'
  | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20'
  | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30'
  | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40'
  | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49' | '50'
  | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59' | '60'
  | '61' | '62' | '63' | '64' | '65' | '66' | '67' | '68' | '69' | '70'
  | '71' | '72' | '73' | '74' | '75' | '76' | '77' | '78' | '79' | '80'
  | '81' | '82' | '83' | '84' | '85' | '86' | '87' | '88' | '89' | '90'
  | '91' | '92' | '93' | '94' | '95' | '96' | '97' | '98' | '99';
// Principais: 01=Dinheiro, 02=Cheque, 03=Cartão Crédito, 04=Cartão Débito, 15=Boleto, 17=PIX, 90=Sem Pagamento, 99=Outros

// ============================================================
// INTERFACES PRINCIPAIS
// ============================================================

export interface EnderecoFiscal {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  
  /** TCodMunIBGE: 7 dígitos */
  codigoMunicipio: TCodMunIBGE;
  nomeMunicipio: string;
  
  /** TUf: Sigla da UF */
  uf: TUf;
  
  /** CEP: 8 dígitos formatado com hífen */
  cep: string;
  
  /** Tpais: Código do país (tabela BACEN) */
  codigoPais?: Tpais;
  nomePais?: string;
  
  telefone?: string;
  email?: string;
}

export interface EmitenteFiscal {
  /** TCnpj: 14 dígitos */
  cnpj: TCnpj;
  
  cpf?: TCpf;
  
  /** Inscrição Municipal */
  inscricaoMunicipal: string;
  
  /** TIe: 2-14 dígitos ou ISENTO */
  inscricaoEstadual?: TIe;
  
  razaoSocial: string;
  nomeFantasia?: string;
  
  regimeTributario: RegimeTributario;
  regimeEspecial?: RegimeEspecialTributacao;
  optanteSimplesNacional: boolean;
  optanteMEI: boolean;
  
  endereco: EnderecoFiscal;
  cnae?: string;
  
  /** TDec_0302: 3 inteiros, 2 decimais */
  aliquotaSimplesNacional?: TDec_0302;
}

export interface TomadorFiscal {
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  
  /** TCnpj (14) ou TCpf (11) */
  documento: TCnpj | TCpf;
  
  nif?: string;
  inscricaoMunicipal?: string;
  
  /** TIeDest: ISENTO ou 0-14 dígitos */
  inscricaoEstadual?: TIeDest;
  
  /** TIeST: 2-14 dígitos - NOVO! */
  inscricaoEstadualST?: TIeST;
  
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  
  endereco: EnderecoFiscal;
  email?: string;
  telefone?: string;
  
  /** Indicador IE: 1=Contribuinte, 2=Isento, 9=Não Contribuinte */
  indicadorIEDestinatario?: '1' | '2' | '9';
}

// ============================================================
// NFS-e PADRÃO NACIONAL (v1.01 - IBS/CBS 2026)
// ============================================================

export interface InformacoesIBSCBS {
  finalidade: number; // 0 = NFS-e regular
  indicadorUsoConsumoPessoal: 0 | 1;
  codigoIndicadorOperacao: string; // Tabela IndOp
  tipoOperacaoGoverno?: 1 | 2 | 3 | 4 | 5;
  tipoEnteGovernamental?: 1 | 2 | 3 | 4 | 9;
  indicadorDestinatario: 0 | 1;
  
  /** CST IBS/CBS: 2 dígitos */
  cstIBSCBS: string;
  codigoClassificacaoTrib: string; // 3 dígitos
  codigoCreditoPresumido?: string;
  
  /** TDec_0302_04: 3 inteiros, 2-4 decimais */
  aliquotaIBSUF: TDec_0302_04;
  valorIBSUF: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaIBSMun: TDec_0302_04;
  valorIBSMun: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaCBS: TDec_0302_04;
  valorCBS: TDec_1104v;
  
  /** TDec_0302_04 */
  percentualDiferimentoUF?: TDec_0302_04;
  percentualDiferimentoMun?: TDec_0302_04;
  percentualDiferimentoCBS?: TDec_0302_04;
  
  pagamentoVinculado?: {
    numeroPagamento: number;
    idTransacao: string;
    tipoMeioPagamento: FormaPagamento;
    
    /** TCnpj: 14 dígitos */
    cnpjRecebedor: TCnpj;
    
    /** 8 primeiros dígitos do CNPJ */
    cnpjBasePSP: string;
  };
}

export interface ServicoItemNfse {
  codigoTributacaoNacional: string; // 6 dígitos
  codigoTributacaoMunicipal: string; // Código municipal
  descricao: string;
  codigoNBS?: string; // 9 dígitos
  codigoInterno?: string;
  
  localPrestacao: {
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    uf: TUf;
  };
  
  /** TDec_1104v */
  valorServico: TDec_1104v;
  
  /** TDec_1104v */
  descontoIncondicionado?: TDec_1104v;
  
  /** TDec_1104v */
  descontoCondicionado?: TDec_1104v;
  
  /** TDec_1104v */
  deducoesMateriais?: TDec_1104v;
  
  tributacaoISSQN: TributacaoISSQN;
  
  /** TDec_0302_04 */
  aliquotaISS: TDec_0302_04;
  
  /** TDec_1104v */
  valorISS: TDec_1104v;
  
  tipoRetencaoISS: TipoRetencaoISS;
  
  /** TDec_1104v */
  valorISSRetido: TDec_1104v;
  
  /** TDec_1104v */
  baseCalculoISS: TDec_1104v;
  
  cstPisCofins?: string;
  
  /** TDec_0302_04 */
  aliquotaPIS?: TDec_0302_04;
  
  /** TDec_1104v */
  valorPIS?: TDec_1104v;
  
  retidoPIS?: boolean;
  
  /** TDec_0302_04 */
  aliquotaCOFINS?: TDec_0302_04;
  
  /** TDec_1104v */
  valorCOFINS?: TDec_1104v;
  
  retidoCOFINS?: boolean;
  
  /** TDec_0302_04 */
  aliquotaIRRF?: TDec_0302_04;
  
  /** TDec_1104v */
  valorIRRF?: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaCSLL?: TDec_0302_04;
  
  /** TDec_1104v */
  valorCSLL?: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaINSS?: TDec_0302_04;
  
  /** TDec_1104v */
  valorINSS?: TDec_1104v;
  
  ibscbs?: InformacoesIBSCBS;
  
  /** TDec_1104v */
  valorTributosFederais: TDec_1104v;
  
  /** TDec_1104v */
  valorTributosEstaduais: TDec_1104v;
  
  /** TDec_1104v */
  valorTributosMunicipais: TDec_1104v;
  
  /** TDec_0302_04 */
  percentualTotalTributos: TDec_0302_04;
}

export interface NFSeDocumento {
  id: string;
  
  /** TChNFSe: 53 dígitos */
  chaveAcesso: string;
  
  numeroNfse: TNF;
  serieDPS: TSerie;
  numeroDPS: TNF;
  
  /** TData */
  dataCompetencia: TData;
  
  /** TDateTimeUTC */
  dataHoraEmissao: TDateTimeUTC;
  
  /** TDateTimeUTC */
  dataHoraProcessamento: TDateTimeUTC;
  
  codigoVerificacao: string; // 9 caracteres
  
  /** TAmb */
  ambiente: TAmb;
  
  /** TipoEmissao */
  tipoEmissao: TipoEmissao;
  
  status: StatusDocumentoFiscal;
  
  emitente: EmitenteFiscal;
  tomador: TomadorFiscal;
  servico: ServicoItemNfse;
  
  /** TDec_1104v */
  valorTotalServicos: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalDescontos: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalDeducoes: TDec_1104v;
  
  /** TDec_1104v */
  baseCalculoISS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalISS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalISSRetido: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalRetencoesFederais: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalIBS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalCBS: TDec_1104v;
  
  /** TDec_1104v */
  valorLiquidoNfse: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalNotaFinal: TDec_1104v;
  
  /** TString */
  informacoesComplementares?: TString;
  numeroPedido?: string;
  
  /** TJust: 15-255 caracteres */
  motivoCancelamento?: TJust;
  
  /** TDateTimeUTC */
  dataHoraCancelamento?: TDateTimeUTC;
  
  /** TChNFSe: 53 dígitos */
  chaveNfseSubstituta?: string;
  
  xmlAssinado: string;
  urlConsultaPrefeitura?: string;
  urlVisualizacaoNacional?: string;
}

// ============================================================
// NF-e PRODUTO (Modelo 55) & NFC-e (Modelo 65)
// ============================================================

export interface ItemNfe {
  id: string;
  codigoProduto: string;
  descricao: string;
  
  /** NCM: 8 dígitos */
  ncm: string;
  
  /** CEST: 7 dígitos */
  cest?: string;
  
  /** CFOP: 4 dígitos */
  cfop: string;
  
  unidadeMedida: string; // UN, KG, CX, PCT
  
  /** TDec_1104v */
  quantidade: TDec_1104v;
  
  /** TDec_1104v */
  valorUnitario: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalBruto: TDec_1104v;
  
  /** TDec_1104v */
  descontoItem?: TDec_1104v;
  
  /** TDec_1104v */
  freteItem?: TDec_1104v;
  
  /** TDec_1104v */
  seguroItem?: TDec_1104v;
  
  /** TDec_1104v */
  outrasDespesasItem?: TDec_1104v;
  
  origemMercadoria: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  
  /** CST ICMS: 2 dígitos (00,10,20,30,40,41,50,51,60,70,90) */
  cstICMS: CSTICMS | CSOSN;
  
  /** TDec_0302_04 */
  aliquotaICMS: TDec_0302_04;
  
  /** TDec_1104v */
  baseCalculoICMS: TDec_1104v;
  
  /** TDec_1104v */
  valorICMS: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaICMSST?: TDec_0302_04;
  
  /** TDec_1104v */
  valorICMSST?: TDec_1104v;
  
  /** CST IPI: 2 dígitos */
  cstIPI?: string;
  
  /** TDec_0302_04 */
  aliquotaIPI?: TDec_0302_04;
  
  /** TDec_1104v */
  valorIPI?: TDec_1104v;
  
  /** CST PIS: 2 dígitos */
  cstPIS: string;
  
  /** TDec_0302_04 */
  aliquotaPIS: TDec_0302_04;
  
  /** TDec_1104v */
  valorPIS: TDec_1104v;
  
  /** CST COFINS: 2 dígitos */
  cstCOFINS: string;
  
  /** TDec_0302_04 */
  aliquotaCOFINS: TDec_0302_04;
  
  /** TDec_1104v */
  valorCOFINS: TDec_1104v;
  
  /** CST IBS/CBS: 2 dígitos */
  cstIBSCBS?: string;
  
  /** TDec_0302_04 */
  aliquotaIBSUF?: TDec_0302_04;
  
  /** TDec_1104v */
  valorIBSUF?: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaIBSMun?: TDec_0302_04;
  
  /** TDec_1104v */
  valorIBSMun?: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaCBS?: TDec_0302_04;
  
  /** TDec_1104v */
  valorCBS?: TDec_1104v;
  
  /** TDec_1104v */
  valorTributosAproximados: TDec_1104v;
  
  /** GTIN: 8, 12, 13 ou 14 dígitos */
  codigoEAN?: string;
  codigoEANTrib?: string;
}

export interface FaturaDuplicata {
  numero: string;
  
  /** TData */
  dataVencimento: TData;
  
  /** TDec_1104v */
  valor: TDec_1104v;
  
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}

export interface TransporteNfe {
  /** Modalidade Frete: 0-4, 9 */
  modalidadeFrete: ModalidadeFrete;
  
  transportadora?: {
    /** TCnpjOpc: vazio ou 14 dígitos */
    cnpjCpf: TCnpjOpc;
    razaoSocial: string;
    
    /** TIeST: 2-14 dígitos */
    inscricaoEstadual?: TIeST;
    
    enderecoCompleto?: string;
    municipio?: string;
    uf?: TUf;
  };
  
  veiculo?: {
    placa: string; // 7 caracteres
    uf: TUf;
    rntc?: string;
  };
  
  volumes?: {
    /** TDec_1104v */
    quantidade: TDec_1104v;
    especie: string;
    marca?: string;
    numero?: string;
    
    /** TDec_1104v */
    pesoLiquidoKg: TDec_1104v;
    
    /** TDec_1104v */
    pesoBrutoKg: TDec_1104v;
  };
}

export interface NFeDocumento {
  id: string;
  
  /** TMod: 55 ou 65 */
  modelo: TMod;
  
  /** TSerie */
  serie: TSerie;
  
  /** TNF */
  numero: TNF;
  
  /** TChNFe: 44 dígitos */
  chaveAcesso: TChNFe;
  
  /** TDateTimeUTC */
  dataHoraEmissao: TDateTimeUTC;
  
  /** TDateTimeUTC */
  dataHoraSaida?: TDateTimeUTC;
  
  /** TString */
  naturezaOperacao: TString;
  
  /** TAmb */
  ambiente: TAmb;
  
  /** TipoEmissao */
  tipoEmissao: TipoEmissao;
  
  /** TpNF: 0=Entrada, 1=Saída */
  tipoDocumento: TpNF;
  
  /** Finalidade: 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução */
  finalidade: FinalidadeNFe;
  
  consumidorFinal: boolean;
  
  /** IndPresenca: 0-5, 9 */
  presencaComprador: IndPresenca;
  
  status: StatusDocumentoFiscal;
  
  /** IdDest: 1=Interna, 2=Interestadual, 3=Exterior */
  idDest?: IdDest;
  
  /** TpImp: 1=Sem DANFE, 2=DANFE Normal, 3=DANFE Simplificado */
  tpImp?: TpImp;
  
  emitente: EmitenteFiscal;
  destinatario: TomadorFiscal;
  itens: ItemNfe[];
  
  /** TDec_1104v */
  valorTotalProdutos: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalFrete: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalSeguro: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalDesconto: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalOutrasDespesas: TDec_1104v;
  
  /** TDec_1104v */
  baseCalculoICMS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalICMS: TDec_1104v;
  
  /** TDec_1104v */
  baseCalculoICMSST: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalICMSST: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalIPI: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalPIS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalCOFINS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalIBS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalCBS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalTributosAproximados: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalNota: TDec_1104v;
  
  /** FormaPagamento: 2 dígitos */
  formaPagamento: FormaPagamento;
  
  duplicatas: FaturaDuplicata[];
  transporte: TransporteNfe;
  
  /** TString */
  informacoesAdicionais?: TString;
  
  /** TProt: 15 ou 17 dígitos */
  protocoloAutorizacao: TProt;
  
  /** TDateTimeUTC */
  dataHoraAutorizacao: TDateTimeUTC;
  
  /** TJust: 15-255 caracteres */
  motivoCancelamento?: TJust;
  
  /** TDateTimeUTC */
  dataHoraCancelamento?: TDateTimeUTC;
  
  xmlAssinado: string;
}

// ============================================================
// NFC-e CONSUMIDOR (Modelo 65)
// ============================================================

export interface NFCeDocumento {
  id: string;
  modelo: '65';
  
  /** TSerie */
  serie: TSerie;
  
  /** TNF */
  numero: TNF;
  
  /** TChNFe: 44 dígitos */
  chaveAcesso: TChNFe;
  
  /** TDateTimeUTC */
  dataHoraEmissao: TDateTimeUTC;
  
  naturezaOperacao: string;
  
  /** TAmb */
  ambiente: TAmb;
  
  /** TipoEmissao */
  tipoEmissao: TipoEmissao;
  
  status: StatusDocumentoFiscal;
  
  emitente: EmitenteFiscal;
  consumidorIdentificado: boolean;
  
  destinatario?: {
    /** TCnpjOpc ou TCpf */
    cpfCnpj?: TCnpjOpc | TCpf;
    nomeRazaoSocial?: string;
    email?: string;
    endereco?: EnderecoFiscal;
  };
  
  itens: ItemNfe[];
  
  /** TDec_1104v */
  valorTotalProdutos: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalDesconto: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalAcrescimo?: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalTributosAproximados: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalNota: TDec_1104v;
  
  /** FormaPagamento: 2 dígitos */
  formaPagamento: FormaPagamento;
  
  /** TDec_1104v */
  valorPago: TDec_1104v;
  
  /** TDec_1104v */
  valorTroco: TDec_1104v;
  
  urlQrCode: string;
  tokenCscId: string;
  
  /** TProt: 15 ou 17 dígitos */
  protocoloAutorizacao: TProt;
  
  /** TDateTimeUTC */
  dataHoraAutorizacao: TDateTimeUTC;
  
  /** TJust: 15-255 caracteres */
  motivoCancelamento?: TJust;
  
  /** TDateTimeUTC */
  dataHoraCancelamento?: TDateTimeUTC;
  
  xmlAssinado: string;
}

// ============================================================
// CT-e TRANSPORTE (Modelo 57)
// ============================================================

export interface CTeDocumento {
  id: string;
  modelo: '57';
  
  /** TSerie */
  serie: TSerie;
  
  /** TNF */
  numero: TNF;
  
  /** TChNFe: 44 dígitos */
  chaveAcesso: TChNFe;
  
  /** TDateTimeUTC */
  dataHoraEmissao: TDateTimeUTC;
  
  naturezaOperacao: string;
  
  /** CFOP: 4 dígitos */
  cfop: string;
  
  /** TAmb */
  ambiente: TAmb;
  
  /** TipoEmissao */
  tipoEmissao: TipoEmissao;
  
  status: StatusDocumentoFiscal;
  
  emitente: EmitenteFiscal;
  remetente: TomadorFiscal;
  destinatario: TomadorFiscal;
  expedidor?: TomadorFiscal;
  recebedor?: TomadorFiscal;
  tomadorServico: 0 | 1 | 2 | 3 | 4;
  
  municipioInicio: {
    codigoIbge: TCodMunIBGE;
    nome: string;
    uf: TUf;
  };
  
  municipioFim: {
    codigoIbge: TCodMunIBGE;
    nome: string;
    uf: TUf;
  };
  
  produtoPredominante: string;
  
  /** TDec_1104v */
  valorCargaAverbada: TDec_1104v;
  
  /** TDec_1104v */
  pesoBrutoKg: TDec_1104v;
  
  /** TDec_1104v */
  pesoLiquidoKg: TDec_1104v;
  
  quantidadeVolumes: number;
  especieVolumes: string;
  
  /** TDec_1104v */
  cubagemM3?: TDec_1104v;
  
  chavesNFeTransportadas: TChNFe[];
  
  /** RNTRC: Registro Nacional de Transportadores */
  rntrc: string;
  
  veiculo: {
    placa: string; // 7 caracteres
    uf: TUf;
    rntrcProprietario?: string;
  };
  
  motorista: {
    nome: string;
    
    /** TCpf: 11 dígitos */
    cpf: TCpf;
  };
  
  /** TDec_1104v */
  valorTotalFrete: TDec_1104v;
  
  componentesValor: {
    /** TDec_1104v */
    fretePeso: TDec_1104v;
    
    /** TDec_1104v */
    freteValor: TDec_1104v;
    
    /** TDec_1104v */
    pedagio: TDec_1104v;
    
    /** TDec_1104v */
    taxaGris: TDec_1104v;
    
    /** TDec_1104v */
    outrasTaxas: TDec_1104v;
  };
  
  /** TDec_1104v */
  valorReceber: TDec_1104v;
  
  /** CST ICMS: 00,20,40,60,90 */
  cstICMS: CSTICMS;
  
  /** TDec_1104v */
  baseCalculoICMS: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaICMS: TDec_0302_04;
  
  /** TDec_1104v */
  valorICMS: TDec_1104v;
  
  /** TDec_1104v */
  valorPIS: TDec_1104v;
  
  /** TDec_1104v */
  valorCOFINS: TDec_1104v;
  
  /** TDec_1104v */
  valorTributosAproximados: TDec_1104v;
  
  /** TProt: 15 ou 17 dígitos */
  protocoloAutorizacao: TProt;
  
  /** TDateTimeUTC */
  dataHoraAutorizacao: TDateTimeUTC;
  
  /** TJust: 15-255 caracteres */
  motivoCancelamento?: TJust;
  
  /** TDateTimeUTC */
  dataHoraCancelamento?: TDateTimeUTC;
  
  xmlAssinado: string;
}

// ============================================================
// NFA-e NOTA FISCAL AVULSA (Modelo 01-AVULSA)
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
  
  /** NCM: 8 dígitos */
  ncm: string;
  
  unidade: string;
  
  /** TDec_1104v */
  quantidade: TDec_1104v;
  
  /** TDec_1104v */
  valorUnitario: TDec_1104v;
  
  /** TDec_1104v */
  valorTotal: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaICMS: TDec_0302_04;
  
  /** TDec_1104v */
  valorICMS: TDec_1104v;
}

export interface NFAeDocumento {
  id: string;
  modelo: '01-AVULSA';
  
  /** TSerie: 900 por padrão */
  serie: TSerie;
  
  /** TNF */
  numero: TNF;
  
  chaveAcesso: string;
  
  /** TDateTimeUTC */
  dataHoraEmissao: TDateTimeUTC;
  
  naturezaOperacao: string;
  motivoEmissao: MotivoEmissaoNFAe;
  descricaoMotivo: string;
  
  /** TAmb */
  ambiente: TAmb;
  
  status: StatusDocumentoFiscal;
  
  requerente: {
    tipoPessoa: 'PF' | 'PJ';
    
    /** TCpf ou TCnpj */
    cpfCnpj: TCpf | TCnpj;
    
    nomeRazaoSocial: string;
    inscricaoProdutorRural?: string;
    endereco: EnderecoFiscal;
    telefone?: string;
    email?: string;
  };
  
  destinatario: TomadorFiscal;
  itens: ItemNfae[];
  
  /** TDec_1104v */
  valorTotalProdutos: TDec_1104v;
  
  /** TDec_1104v */
  baseCalculoICMS: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaICMSMediana: TDec_0302_04;
  
  /** TDec_1104v */
  valorTotalICMS: TDec_1104v;
  
  /** TDec_1104v */
  valorTotalNota: TDec_1104v;
  
  guiaDAE: {
    numeroDAE: string;
    codigoBarras: string;
    chavePixSefaz: string;
    
    /** TData */
    dataVencimento: TData;
    
    /** TDec_1104v */
    valorDAE: TDec_1104v;
    
    statusPagamento: 'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'ISENTO';
  };
  
  orgaoEmissorSefaz: string;
  
  /** TProt: 15 ou 17 dígitos */
  protocoloAutorizacao: TProt;
  
  /** TDateTimeUTC */
  dataHoraAutorizacao: TDateTimeUTC;
  
  /** TJust: 15-255 caracteres */
  motivoCancelamento?: TJust;
  
  /** TDateTimeUTC */
  dataHoraCancelamento?: TDateTimeUTC;
  
  xmlAssinado: string;
}

// ============================================================
// EVENTOS FISCAIS
// ============================================================

export type TipoEventoFiscal = 'CANCELAMENTO' | 'CCE' | 'SUBSTITUICAO' | 'CREDITO_PRESUMIDO';

export interface EventoFiscal {
  id: string;
  tipoEvento: TipoEventoFiscal;
  
  /** Código do evento: 110111 (Cancelamento NFe), 110110 (CC-e), 101101 (Cancelamento NFSe) */
  codigoEvento: string;
  
  descricaoEvento: string;
  
  /** TChNFe: 44 dígitos */
  chaveDocumento: TChNFe;
  
  /** nSeqEvento: 1-2 */
  numeroSequencial: number;
  
  /** TDateTimeUTC */
  dataHoraEvento: TDateTimeUTC;
  
  /** TJust: 15-255 caracteres */
  justificativaOuTexto: TJust;
  
  /** TRec: 15 dígitos */
  protocoloEvento?: TRec;
  
  xmlEvento: string;
  status: 'HOMOLOGADO' | 'REJEITADO';
  
  /** TpAutor: 1,2,3,5,6,9 */
  tpAutor?: TpAutor;
  
  /** TVerAplic: 1-20 caracteres */
  verAplic?: TVerAplic;
  
  /** TCodUfIBGE: 2 dígitos */
  cOrgaoAutor?: TCodUfIBGE;
  
  /** TStat: 3 dígitos */
  cStat?: TStat;
  
  /** TMotivo: 1-255 caracteres */
  xMotivo?: TMotivo;
}

// ============================================================
// EVENTO DE CRÉDITO PRESUMIDO (detEvento - PL_006h)
// ============================================================

export interface EventoCreditoPresumidoItem {
  /** TnItem: 1-999 */
  nItem: TnItem;
  
  /** TDec_1302: 15 dígitos, 2 decimais */
  vBCCredPres: TDec_1302;
  
  /** Código Crédito Presumido: 2 dígitos */
  cCredPres: string;
  
  /** TDec_0302_04 */
  pCredPresIBS?: TDec_0302_04;
  
  /** TDec_1302 */
  vCredPresIBS?: TDec_1302;
  
  /** TDec_0302_04 */
  pCredPresCBS?: TDec_0302_04;
  
  /** TDec_1302 */
  vCredPresCBS?: TDec_1302;
}

export interface EventoCreditoPresumido {
  id: string;
  
  /** TChNFe: 44 dígitos */
  chaveNFe: TChNFe;
  
  /** TpAutor: 1 ou 2 */
  tpAutor: TpAutor;
  
  /** TVerAplic: 1-20 caracteres */
  verAplic: TVerAplic;
  
  /** TCodUfIBGE: 2 dígitos */
  cOrgaoAutor: TCodUfIBGE;
  
  /** TDateTimeUTC */
  dhEvento: TDateTimeUTC;
  
  /** TRec: 15 dígitos */
  nRec?: TRec;
  
  /** TProt: 15 ou 17 dígitos */
  nProt?: TProt;
  
  itens: EventoCreditoPresumidoItem[];
  
  xmlEvento: string;
  xmlRetorno?: string;
}