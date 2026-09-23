// src/types/erp.ts
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
  TChNFe,
  CSTICMS,
  CSOSN
} from './fiscal';

// ============================================================
// PRODUTO
// ============================================================

export interface Produto {
  id: string;
  codigo: string;
  
  codigoBarrasEAN?: string;
  
  descricao: string;
  categoria: string;
  
  unidade: string;
  
  ncm: string;
  
  cest?: string;
  
  cfopPadrao: string;
  
  origem: 0 | 1 | 2;
  
  precoCusto: TDec_1104v;
  
  margemLucroPercentual: TDec_0302;
  
  precoVenda: TDec_1104v;
  
  estoqueAtual: TDec_0803;
  
  estoqueMinimo: TDec_0803;
  
  aliquotaICMS: TDec_0302_04;

  // CST (regime normal) ou CSOSN (Simples Nacional) — mutuamente exclusivos.
  // Sem csosnICMS, um emitente do Simples Nacional é rejeitado pela SEFAZ
  // ("CSOSN obrigatório para emitente do Simples Nacional, CRT=1").
  cstICMS?: string;
  csosnICMS?: string;

  aliquotaPIS: TDec_0302_04;
  
  aliquotaCOFINS: TDec_0302_04;
  
  aliquotaIPI?: TDec_0302_04;
  
  aliquotaIBS?: TDec_0302_04;
  
  aliquotaCBS?: TDec_0302_04;
  
  ativo: boolean;
  
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
  
  quantidade: TDec_0803;
  
  quantidadeAnterior: TDec_0803;
  
  quantidadePosterior: TDec_0803;
  
  custoUnitario: TDec_1104v;
  
  valorTotal: TDec_1104v;
  
  documentoReferencia?: TChNFe | string;
  
  observacao?: TJust;
  
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
  
  codigoTributacaoNacional: string;
  
  codigoTributacaoMunicipal: string;
  
  codigoNBS: string;
  
  valorUnitario: TDec_1104v;
  
  aliquotaISS: TDec_0302_04;
  
  retencaoISSPadrao: boolean;
  
  aliquotaPIS: TDec_0302_04;
  
  aliquotaCOFINS: TDec_0302_04;
  
  aliquotaIRRF: TDec_0302_04;
  
  aliquotaCSLL: TDec_0302_04;
  
  aliquotaINSS: TDec_0302_04;
  
  aliquotaIBS: TDec_0302_04;
  
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
  
  documento: TCnpj | TCpf;
  
  razaoSocial: string;
  nomeFantasia?: string;
  
  inscricaoEstadual?: TIeDest;
  
  inscricaoEstadualST?: TIeST;
  
  inscricaoMunicipal?: string;
  
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
    
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    
    uf: TUf;
    
    cep: string;
    
    codigoPais?: Tpais;
    nomePais?: string;
  };
  
  observacoes?: TJust;
  
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
  
  dataEmissao: TData;
  
  dataVencimento: TData;
  
  dataPagamento?: TData;
  
  valorOriginal: TDec_1104v;
  
  valorJurosMulta?: TDec_1104v;
  
  valorDesconto?: TDec_1104v;
  
  valorPago?: TDec_1104v;
  
  status: StatusTitulo;
  
  formaPagamento: FormaPagamento;
  
  documentoOrigemTipo?: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE' | 'MANUAL';
  
  documentoOrigemChave?: TChNFe;
  
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
  
  cnpjCpf: TCnpj | TCpf;
  
  emissora: string;
  
  dataValidadeInicio: TData;
  
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
  
  empresaCnpj: TCnpj;
  
  dataLogin: TDateTimeUTC;
}

// ============================================================
// CONFIGURAÇÃO DA EMPRESA
// ============================================================

export interface ConfiguracaoEmpresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  
  cnpj: TCnpj;
  
  inscricaoEstadual: TIe;
  
  inscricaoMunicipal: string;
  cnae: string;
  
  regimeTributario: RegimeTributario;
  
  aliquotaSimplesNacional: number;
  
  ambienteEmissao: TAmb;
  
  serieNfe: TSerie;
  
  proximoNumeroNfe: TNF;
  
  serieNfse: TSerie;
  
  proximoNumeroNfse: TNF;
  
  serieNfce: TSerie;
  
  proximoNumeroNfce: TNF;
  
  serieCte: TSerie;
  
  proximoNumeroCte: TNF;
  
  serieNfae: TSerie;

  proximoNumeroNfae: TNF;

  serieMdfe: TSerie;

  proximoNumeroMdfe: TNF;

  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    
    uf: TUf;
    
    cep: string;
    
    telefone: string;
    email: string;
    
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
  
  cnpj: TCnpj;
  
  razaoSocial: string;
  nomeFantasia?: string;
  
  inscricaoEstadual?: TIeDest;
  
  inscricaoMunicipal?: string;
  cnae?: string;
  
  email?: string;
  telefone?: string;
  celularWhatsApp?: string;
  contato?: string;
  site?: string;
  
  rntrc?: string;
  
  antt?: string;
  
  inscricaoSuframa?: string;
  regimeTributario?: RegimeTributario;
  
  tipoTransportador?: string;
  
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    
    codigoMunicipio: TCodMunIBGE;
    nomeMunicipio: string;
    
    uf: TUf;
    
    cep: string;
  };
  
  banco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  chavePix?: string;
  
  ativo: boolean;
  
  observacoes?: TJust;
  
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