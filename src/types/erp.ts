/**
 * Tipos e Interfaces do Sistema de Gestão ERP Integrado
 * SUP TECNOLOGIA
 */

export interface Produto {
  id: string;
  codigo: string;
  codigoBarrasEAN?: string;
  descricao: string;
  categoria: string;
  unidade: string; // UN, KG, CX, LT, M2, PCT
  ncm: string;
  cest?: string;
  cfopPadrao: string;
  origem: 0 | 1 | 2;
  precoCusto: number;
  margemLucroPercentual: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  aliquotaICMS: number;
  aliquotaPIS: number;
  aliquotaCOFINS: number;
  aliquotaIPI?: number;
  aliquotaIBS?: number;
  aliquotaCBS?: number;
  ativo: boolean;
  dataCriacao: string;
}

export type TipoMovimentacaoEstoque = 'ENTRADA_COMPRA' | 'SAIDA_VENDA' | 'SAIDA_NFE' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'INVENTARIO';

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  produtoDescricao: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadePosterior: number;
  custoUnitario: number;
  valorTotal: number;
  documentoReferencia?: string; // Número NF-e / Pedido
  observacao?: string;
  dataHora: string;
  usuario: string;
}

export interface ServicoCatalogo {
  id: string;
  codigoInterno: string;
  descricao: string;
  codigoTributacaoNacional: string;
  codigoTributacaoMunicipal: string;
  codigoNBS: string;
  valorUnitario: number;
  aliquotaISS: number;
  retencaoISSPadrao: boolean;
  aliquotaPIS: number;
  aliquotaCOFINS: number;
  aliquotaIRRF: number;
  aliquotaCSLL: number;
  aliquotaINSS: number;
  aliquotaIBS: number;
  aliquotaCBS: number;
  ativo: boolean;
}

export interface ClienteFornecedor {
  id: string;
  tipo: 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  documento: string; // CNPJ / CPF
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
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
    codigoMunicipio: string; // IBGE
    nomeMunicipio: string;
    uf: string;
    cep: string;
  };
  observacoes?: string;
  dataCadastro: string;
}

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
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorOriginal: number;
  valorJurosMulta?: number;
  valorDesconto?: number;
  valorPago?: number;
  status: StatusTitulo;
  formaPagamento: string;
  documentoOrigemTipo?: 'NFE' | 'NFSE' | 'NFCE' | 'MANUAL';
  documentoOrigemChave?: string;
  observacoes?: string;
  nossoNumeroBoleto?: string;
  codigoPixCopiaCola?: string;
}

export interface CertificadoDigitalInfo {
  instalado: boolean;
  tipo: 'A1' | 'A3';
  nomeTitular: string;
  cnpjCpf: string;
  emissora: string;
  dataValidadeInicio: string;
  dataValidadeFim: string;
  diasRestantes: number;
  arquivoCarregadoNome?: string;
  status: 'VALIDO' | 'EXPIRADO' | 'NAO_CONFIGURADO';
}

export interface UsuarioAuth {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: 'ADMIN' | 'FISCAL' | 'OPERADOR';
  empresaCnpj: string;
  dataLogin: string;
}

export interface ConfiguracaoEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  cnae: string;
  regimeTributario: 1 | 2 | 3;
  aliquotaSimplesNacional: number;
  ambienteEmissao: 1 | 2; // 1=Produção, 2=Homologação
  serieNfe: number;
  proximoNumeroNfe: number;
  serieNfse: number;
  proximoNumeroNfse: number;
  serieNfce: number;
  proximoNumeroNfce: number;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone: string;
    email: string;
  };
  certificado: CertificadoDigitalInfo;
  chavePixPadrao?: string;
  bancoPadrao?: string;
}
