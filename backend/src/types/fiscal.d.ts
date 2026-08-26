// C:\emissornfe\backend\src\types\fiscal.d.ts

/**
 * Tipos e Interfaces para Documentos Fiscais Brasileiros
 * SUP TECNOLOGIA - BACKEND
 * Padrões: NFS-e Padrão Nacional v1.01, NF-e v4.00, NFC-e v4.00
 */

export type TipoDocumentoFiscal = 'NFSE' | 'NFE' | 'NFCE' | 'CTE' | 'NFAE';
export type StatusDocumentoFiscal = 'AUTORIZADA' | 'CANCELADA' | 'SUBSTITUIDA' | 'PROCESSANDO' | 'REJEITADA';
export type TipoAmbiente = 1 | 2;
export type TipoEmissao = 1 | 2;
export type RegimeTributario = 1 | 2 | 3;
export type TributacaoISSQN = 1 | 2 | 3 | 4;
export type TipoRetencaoISS = 1 | 2 | 3;

export interface EnderecoFiscal {
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
}

export interface TomadorFiscal {
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  documento: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  nomeRazaoSocial: string;
  endereco: EnderecoFiscal;
  email?: string;
  telefone?: string;
  indicadorIEDestinatario?: '1' | '2' | '9';
}

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
  dataCompetencia: string;
  dataHoraEmissao: string;
  dataHoraProcessamento: string;
  codigoVerificacao: string;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  emitente: EmitenteFiscal;
  tomador: TomadorFiscal;
  servico: ServicoItemNfse;
  valorTotalServicos: number;
  valorTotalDescontos: number;
  valorTotalDeducoes: number;
  baseCalculoISS: number;
  valorTotalISS: number;
  valorTotalISSRetido: number;
  valorTotalRetencoesFederais: number;
  valorTotalIBS: number;
  valorTotalCBS: number;
  valorLiquidoNfse: number;
  valorTotalNotaFinal: number;
  informacoesComplementares?: string;
  xmlAssinado: string;
}

export interface ItemNfe {
  id: string;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalBruto: number;
  origemMercadoria: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  cstICMS: string;
  aliquotaICMS: number;
  baseCalculoICMS: number;
  valorICMS: number;
  cstPIS: string;
  aliquotaPIS: number;
  valorPIS: number;
  cstCOFINS: string;
  aliquotaCOFINS: number;
  valorCOFINS: number;
  valorTributosAproximados: number;
}

export interface NFeDocumento {
  id: string;
  modelo: '55' | '65';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  tipoDocumento: 0 | 1;
  finalidade: 1 | 2 | 3 | 4;
  consumidorFinal: boolean;
  presencaComprador: 0 | 1 | 2 | 3 | 4 | 9;
  status: StatusDocumentoFiscal;
  emitente: EmitenteFiscal;
  destinatario: TomadorFiscal;
  itens: ItemNfe[];
  valorTotalProdutos: number;
  valorTotalFrete: number;
  valorTotalSeguro: number;
  valorTotalDesconto: number;
  baseCalculoICMS: number;
  valorTotalICMS: number;
  baseCalculoICMSST: number;
  valorTotalICMSST: number;
  valorTotalIPI: number;
  valorTotalPIS: number;
  valorTotalCOFINS: number;
  valorTotalIBS: number;
  valorTotalCBS: number;
  valorTotalTributosAproximados: number;
  valorTotalNota: number;
  formaPagamento: '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99';
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  informacoesAdicionais?: string;
  xmlAssinado: string;
}

export interface NFCeDocumento {
  id: string;
  modelo: '65';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  emitente: EmitenteFiscal;
  consumidorIdentificado: boolean;
  consumidorCpf?: string;
  consumidorNome?: string;
  itens: ItemNfe[];
  valorTotalProdutos: number;
  valorTotalDesconto: number;
  valorTotalTributosAproximados: number;
  valorTotalNota: number;
  formaPagamento: string;
  valorPago: number;
  valorTroco: number;
  urlQrCode: string;
  tokenCscId: string;
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  xmlAssinado: string;
}

export interface CTeDocumento {
  id: string;
  modelo: '57';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  cfop: string;
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  emitente: EmitenteFiscal;
  remetente: TomadorFiscal;
  destinatario: TomadorFiscal;
  produtoPredominante: string;
  valorCargaAverbada: number;
  pesoBrutoKg: number;
  pesoLiquidoKg: number;
  quantidadeVolumes: number;
  especieVolumes: string;
  chavesNFeTransportadas: string[];
  rntrc: string;
  veiculoPlaca: string;
  veiculoUf: string;
  motoristaNome: string;
  motoristaCpf: string;
  valorTotalFrete: number;
  fretePeso: number;
  freteValor: number;
  pedagio: number;
  taxaGris: number;
  outrasTaxas: number;
  valorReceber: number;
  cstICMS: '00' | '20' | '40' | '60' | '90';
  baseCalculoICMS: number;
  aliquotaICMS: number;
  valorICMS: number;
  valorPIS: number;
  valorCOFINS: number;
  valorTributosAproximados: number;
  municipioInicioCodigo: string;
  municipioInicioNome: string;
  municipioInicioUf: string;
  municipioFimCodigo: string;
  municipioFimNome: string;
  municipioFimUf: string;
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  xmlAssinado: string;
}

export interface NFAeDocumento {
  id: string;
  modelo: '01-AVULSA';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  motivoEmissao: 'PRODUTOR_RURAL' | 'MEI_SEM_IE' | 'PF_ATIVO_PESSOAL' | 'FEIRAS_EVENTOS' | 'DEVOLUCAO_AVULSA' | 'OUTROS';
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
  itens: Array<{
    codigo: string;
    descricao: string;
    ncm: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    aliquotaICMS: number;
    valorICMS: number;
  }>;
  valorTotalProdutos: number;
  baseCalculoICMS: number;
  aliquotaICMSMediana: number;
  valorTotalICMS: number;
  valorTotalNota: number;
  orgaoEmissorSefaz: string;
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  xmlAssinado: string;
}