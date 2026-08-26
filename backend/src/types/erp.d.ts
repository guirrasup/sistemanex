// C:\emissornfe\backend\src\types\erp.d.ts

/**
 * Tipos e Interfaces do Sistema de Gestão ERP
 * SUP TECNOLOGIA - BACKEND
 */

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
  precoCusto: number;
  margemLucroPercentual: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  aliquotaICMS: number;
  aliquotaPIS: number;
  aliquotaCOFINS: number;
  aliquotaIPI?: number;
  ativo: boolean;
  empresaId: string;
  dataCriacao: string;
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
  ativo: boolean;
  empresaId: string;
}

export interface ClienteFornecedor {
  id: string;
  tipo: 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  documento: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  indicadorIE: '1' | '2' | '9';
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
  };
  empresaId: string;
  dataCadastro: string;
}

export interface TituloFinanceiro {
  id: string;
  tipo: 'RECEBER' | 'PAGAR';
  numeroDocumento: string;
  descricao: string;
  categoria: 'VENDA_PRODUTOS' | 'PRESTACAO_SERVICOS' | 'COMPRA_MERCADORIAS' | 'FOLHA_PAGAMENTO' | 'IMPOSTOS_TRIBUTOS' | 'ALUGUEL_INFRA' | 'MARKETING_VENDAS' | 'DESPESAS_ADMINISTRATIVAS' | 'OUTRAS_RECEITAS' | 'OUTRAS_DESPESAS';
  pessoaNome: string;
  pessoaDocumento: string;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorOriginal: number;
  valorJurosMulta?: number;
  valorDesconto?: number;
  valorPago?: number;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
  formaPagamento: string;
  documentoOrigemTipo?: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE' | 'MANUAL';
  documentoOrigemChave?: string;
  empresaId: string;
  clienteId?: string;
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
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  cnae: string;
  regimeTributario: 1 | 2 | 3;
  aliquotaSimplesNacional: number;
  ambienteEmissao: 1 | 2;
  serieNfe: number;
  proximoNumeroNfe: number;
  serieNfse: number;
  proximoNumeroNfse: number;
  serieNfce: number;
  proximoNumeroNfce: number;
  proximoNumeroCte: number;
  proximoNumeroNfae: number;
  optanteSimples: boolean;
  optanteMEI: boolean;
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