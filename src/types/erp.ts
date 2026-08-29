/**
 * Tipos e Interfaces do Sistema de Gestão ERP Integrado
 * SUP TECNOLOGIA
 * 
 * ✅ EM CONFORMIDADE COM:
 * - PL_006h - Tipos Básicos NF-e
 * - Schema Prisma
 * - Tipos Fiscais (fiscal.d.ts)
 */

import { 
  TCnpj, 
  TCpf, 
  TCnpjOpc,
  TCodMunIBGE,
  TUf,
  TIe,
  TIeDest,
  TIeST,
  TDec_1104v,
  TDec_0302,
  TDec_0302_04,
  TDec_0803,
  TAmb,
  TSerie,
  TNF,
  TData,
  TDateTimeUTC,
  TJust,
  TString,
  Tpais,
  RegimeTributario,
  StatusDocumentoFiscal,
  FormaPagamento,
  CSTICMS,
  CSOSN
} from './fiscal';

// ============================================================
// PRODUTO
// ============================================================

export interface Produto {
  id: string;
  codigo: string;
  
  /** GTIN: 8, 12, 13 ou 14 dígitos */
  codigoBarrasEAN?: string;
  
  descricao: string;
  categoria: string;
  
  /** Unidade: UN, KG, CX, LT, M2, PCT */
  unidade: string;
  
  /** NCM: 8 dígitos */
  ncm: string;
  
  /** CEST: 7 dígitos */
  cest?: string;
  
  /** CFOP: 4 dígitos */
  cfopPadrao: string;
  
  /** Origem: 0=Nacional, 1=Estrangeira, 2=Estrangeira adquirida no mercado interno */
  origem: 0 | 1 | 2;
  
  /** TDec_1104v */
  precoCusto: TDec_1104v;
  
  /** TDec_0302 */
  margemLucroPercentual: TDec_0302;
  
  /** TDec_1104v */
  precoVenda: TDec_1104v;
  
  /** TDec_0803 */
  estoqueAtual: TDec_0803;
  
  /** TDec_0803 */
  estoqueMinimo: TDec_0803;
  
  /** TDec_0302_04 */
  aliquotaICMS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaPIS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaCOFINS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaIPI?: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaIBS?: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaCBS?: TDec_0302_04;
  
  ativo: boolean;
  
  /** TData */
  dataCriacao: TData;
}

// ============================================================
// MOVIMENTAÇÃO DE ESTOQUE
// ============================================================

export type TipoMovimentacaoEstoque = 
  | 'ENTRADA_COMPRA' 
  | 'SAIDA_VENDA' 
  | 'SAIDA_NFE' 
  | 'AJUSTE_POSITIVO' 
  | 'AJUSTE_NEGATIVO' 
  | 'INVENTARIO';

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  produtoDescricao: string;
  tipo: TipoMovimentacaoEstoque;
  
  /** TDec_0803 */
  quantidade: TDec_0803;
  
  /** TDec_0803 */
  quantidadeAnterior: TDec_0803;
  
  /** TDec_0803 */
  quantidadePosterior: TDec_0803;
  
  /** TDec_1104v */
  custoUnitario: TDec_1104v;
  
  /** TDec_1104v */
  valorTotal: TDec_1104v;
  
  /** TChNFe: 44 dígitos ou referência do pedido */
  documentoReferencia?: TChNFe | string;
  
  /** TJust: 15-255 caracteres */
  observacao?: TJust;
  
  /** TDateTimeUTC */
  dataHora: TDateTimeUTC;
  
  usuario: string;
}

// ============================================================
// SERVIÇO
// ============================================================

export interface ServicoCatalogo {
  id: string;
  codigoInterno: string;
  descricao: string;
  
  /** Código Tributação Nacional: 6 dígitos */
  codigoTributacaoNacional: string;
  
  /** Código Tributação Municipal: 4 dígitos */
  codigoTributacaoMunicipal: string;
  
  /** NBS: 9 dígitos (ex: 1.1403.21.10) */
  codigoNBS: string;
  
  /** TDec_1104v */
  valorUnitario: TDec_1104v;
  
  /** TDec_0302_04 */
  aliquotaISS: TDec_0302_04;
  
  retencaoISSPadrao: boolean;
  
  /** TDec_0302_04 */
  aliquotaPIS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaCOFINS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaIRRF: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaCSLL: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaINSS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaIBS: TDec_0302_04;
  
  /** TDec_0302_04 */
  aliquotaCBS: TDec_0302_04;
  
  ativo: boolean;
}

// ============================================================
// CLIENTE / FORNECEDOR
// ============================================================

export type TipoCliente = 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';
export type TipoPessoa = 'PJ' | 'PF' | 'EXTERIOR';

export interface ClienteFornecedor {
  id: string;
  tipo: TipoCliente;
  tipoPessoa: TipoPessoa;
  
  /** TCnpj (14) ou TCpf (11) */
  documento: TCnpj | TCpf;
  
  razaoSocial: string;
  nomeFantasia?: string;
  
  /** TIeDest: ISENTO ou 0-14 dígitos */
  inscricaoEstadual?: TIeDest;
  
  /** TIeST: 2-14 dígitos */
  inscricaoEstadualST?: TIeST;
  
  inscricaoMunicipal?: string;
  
  /** Indicador IE: 1=Contribuinte, 2=Isento, 9=Não Contribuinte */
  indicadorIE: '1' | '2' | '9';
  
  email: string;
  telefone: string;
  celularWhatsApp?: string;
  contato?: string;
  
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    
    /** TCodMunIBGE: 7 dígitos */
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    
    /** TUf */
    uf: TUf;
    
    /** CEP: 8 dígitos formatado */
    cep: string;
    
    /** Tpais: Código do país */
    codigoPais?: Tpais;
    nomePais?: string;
  };
  
  /** TJust: 15-255 caracteres */
  observacoes?: TJust;
  
  /** TData */
  dataCadastro: TData;
}

// ============================================================
// TÍTULOS FINANCEIROS
// ============================================================

export type TipoTituloFinanceiro = 'RECEBER' | 'PAGAR';
export type StatusTitulo = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export type CategoriaFinanceira = 
  | 'VENDA_PRODUTOS' 
  | 'PRESTACAO_SERVICOS' 
  | 'COMPRA_MERCADORIAS' 
  | 'FOLHA_PAGAMENTO' 
  | 'IMPOSTOS_TRIBUTOS' 
  | 'ALUGUEL_INFRA' 
  | 'MARKETING_VENDAS' 
  | 'DESPESAS_ADMINISTRATIVAS' 
  | 'OUTRAS_RECEITAS' 
  | 'OUTRAS_DESPESAS';

export interface TituloFinanceiro {
  id: string;
  tipo: TipoTituloFinanceiro;
  numeroDocumento: string;
  descricao: string;
  categoria: CategoriaFinanceira;
  pessoaId?: string;
  pessoaNome: string;
  pessoaDocumento: string;
  
  /** TData */
  dataEmissao: TData;
  
  /** TData */
  dataVencimento: TData;
  
  /** TData */
  dataPagamento?: TData;
  
  /** TDec_1104v */
  valorOriginal: TDec_1104v;
  
  /** TDec_1104v */
  valorJurosMulta?: TDec_1104v;
  
  /** TDec_1104v */
  valorDesconto?: TDec_1104v;
  
  /** TDec_1104v */
  valorPago?: TDec_1104v;
  
  status: StatusTitulo;
  
  /** FormaPagamento: 2 dígitos (01-99) */
  formaPagamento: FormaPagamento;
  
  documentoOrigemTipo?: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE' | 'MANUAL';
  
  /** TChNFe: 44 dígitos */
  documentoOrigemChave?: TChNFe;
  
  /** TJust: 15-255 caracteres */
  observacoes?: TJust;
  
  nossoNumeroBoleto?: string;
  codigoPixCopiaCola?: string;
}

// ============================================================
// CERTIFICADO DIGITAL
// ============================================================

export interface CertificadoDigitalInfo {
  instalado: boolean;
  tipo: 'A1' | 'A3';
  nomeTitular: string;
  
  /** TCnpj ou TCpf */
  cnpjCpf: TCnpj | TCpf;
  
  emissora: string;
  
  /** TData */
  dataValidadeInicio: TData;
  
  /** TData */
  dataValidadeFim: TData;
  
  diasRestantes: number;
  arquivoCarregadoNome?: string;
  status: 'VALIDO' | 'EXPIRADO' | 'NAO_CONFIGURADO';
}

// ============================================================
// USUÁRIO
// ============================================================

export type PerfilUsuario = 'ADMIN' | 'FISCAL' | 'OPERADOR';

export interface UsuarioAuth {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: PerfilUsuario;
  
  /** TCnpj: 14 dígitos */
  empresaCnpj: TCnpj;
  
  /** TDateTimeUTC */
  dataLogin: TDateTimeUTC;
}

// ============================================================
// CONFIGURAÇÃO DA EMPRESA
// ============================================================

export interface ConfiguracaoEmpresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  
  /** TCnpj: 14 dígitos */
  cnpj: TCnpj;
  
  /** TIe: 2-14 dígitos ou ISENTO */
  inscricaoEstadual: TIe;
  
  inscricaoMunicipal: string;
  cnae: string;
  
  /** RegimeTributario: 1,2,3 */
  regimeTributario: RegimeTributario;
  
  /** TDec_0302 */
  aliquotaSimplesNacional: TDec_0302;
  
  /** TAmb: 1=Produção, 2=Homologação */
  ambienteEmissao: TAmb;
  
  /** TSerie */
  serieNfe: TSerie;
  
  /** TNF: próximo número */
  proximoNumeroNfe: TNF;
  
  /** TSerie */
  serieNfse: TSerie;
  
  /** TNF: próximo número */
  proximoNumeroNfse: TNF;
  
  /** TSerie */
  serieNfce: TSerie;
  
  /** TNF: próximo número */
  proximoNumeroNfce: TNF;
  
  /** TSerie - CT-e */
  serieCte: TSerie;
  
  /** TNF - próximo número CT-e */
  proximoNumeroCte: TNF;
  
  /** TSerie - NFA-e (900 por padrão) */
  serieNfae: TSerie;
  
  /** TNF - próximo número NFA-e */
  proximoNumeroNfae: TNF;
  
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    
    /** TCodMunIBGE: 7 dígitos */
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    
    /** TUf */
    uf: TUf;
    
    /** CEP: 8 dígitos formatado */
    cep: string;
    
    telefone: string;
    email: string;
    
    /** Tpais */
    codigoPais?: Tpais;
    nomePais?: string;
  };
  
  certificado: CertificadoDigitalInfo;
  chavePixPadrao?: string;
  bancoPadrao?: string;
  
  optanteSimples: boolean;
  optanteMEI: boolean;
}

// ============================================================
// TRANSPORTADORA (ERP)
// ============================================================

export interface TransportadoraERP {
  id: string;
  tipoPessoa: TipoPessoa;
  
  /** TCnpj: 14 dígitos */
  cnpj: TCnpj;
  
  razaoSocial: string;
  nomeFantasia?: string;
  
  /** TIeDest: ISENTO ou 0-14 dígitos */
  inscricaoEstadual?: TIeDest;
  
  inscricaoMunicipal?: string;
  cnae?: string;
  
  email?: string;
  telefone?: string;
  celularWhatsApp?: string;
  contato?: string;
  site?: string;
  
  /** RNTRC: Registro Nacional de Transportadores */
  rntrc?: string;
  
  /** ANTT: Agência Nacional de Transportes Terrestres */
  antt?: string;
  
  inscricaoSuframa?: string;
  regimeTributario?: RegimeTributario;
  
  /** Tipo: RODOVIARIO, FERROVIARIO, AQUAVIARIO, AEREO, MULTIMODAL */
  tipoTransportador?: string;
  
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    
    /** TCodMunIBGE: 7 dígitos */
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    
    /** TUf */
    uf: TUf;
    
    /** CEP: 8 dígitos formatado */
    cep: string;
  };
  
  /** Dados bancários */
  banco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  chavePix?: string;
  
  ativo: boolean;
  
  /** TJust: 15-255 caracteres */
  observacoes?: TJust;
  
  /** TData */
  dataCadastro: TData;
}

// ============================================================
// DASHBOARD / RESUMOS
// ============================================================

export interface ResumoFinanceiro {
  totalAReceber: TDec_1104v;
  totalAPagar: TDec_1104v;
  saldo: TDec_1104v;
  vencidosReceber: TDec_1104v;
  vencidosPagar: TDec_1104v;
}

export interface ResumoVendas {
  totalNotas: number;
  totalValor: TDec_1104v;
  totalICMS: TDec_1104v;
  totalPIS: TDec_1104v;
  totalCOFINS: TDec_1104v;
  totalIBS: TDec_1104v;
  totalCBS: TDec_1104v;
  periodo: {
    inicio: TData;
    fim: TData;
  };
}

export interface ResumoNFSes {
  totalNotas: number;
  totalServicos: TDec_1104v;
  totalISS: TDec_1104v;
  totalIBS: TDec_1104v;
  totalCBS: TDec_1104v;
  totalRetencoes: TDec_1104v;
  periodo: {
    inicio: TData;
    fim: TData;
  };
}

// ============================================================
// PARÂMETROS DE CONSULTA / FILTROS
// ============================================================

export interface FiltroPeriodo {
  inicio: TData;
  fim: TData;
}

export interface FiltroPaginacao {
  page: number;
  limit: number;
  busca?: string;
}

export interface FiltroDocumentosFiscais extends FiltroPaginacao {
  status?: StatusDocumentoFiscal;
  tipo?: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE';
  clienteId?: string;
  periodo?: FiltroPeriodo;
}

export interface FiltroTitulosFinanceiros extends FiltroPaginacao {
  status?: StatusTitulo;
  tipo?: TipoTituloFinanceiro;
  categoria?: CategoriaFinanceira;
  clienteId?: string;
  periodo?: FiltroPeriodo;
} 