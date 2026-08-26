/**
 * Tipos e Interfaces para Documentos Fiscais Brasileiros
 * SUP TECNOLOGIA - Emissor Fiscal & Gestão ERP
 * Padrões: NFS-e Padrão Nacional v1.01 (com IBS/CBS 2026), NF-e v4.00, NFC-e v4.00
 */

export type TipoDocumentoFiscal = 'NFSE' | 'NFE' | 'NFCE' | 'CTE' | 'NFAE';

export type StatusDocumentoFiscal = 'AUTORIZADA' | 'CANCELADA' | 'SUBSTITUIDA' | 'PROCESSANDO' | 'REJEITADA';

export type TipoAmbiente = 1 | 2; // 1 = Produção, 2 = Homologação

export type TipoEmissao = 1 | 2; // 1 = Normal, 2 = Contingência / Transcrição

export type RegimeTributario = 1 | 2 | 3; // 1 = Simples Nacional, 2 = Simples Nacional (excesso), 3 = Regime Normal (Lucro Presumido/Real)

export type RegimeEspecialTributacao = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Nenhum, 1=Cooperativa, 2=Estimativa, 3=ME Municipal, 4=Notário, 5=Autônomo, 6=Sociedade Profissionais

export type TributacaoISSQN = 1 | 2 | 3 | 4; // 1=Operação Tributável, 2=Imunidade, 3=Exportação, 4=Não Incidência

export type TipoRetencaoISS = 1 | 2 | 3; // 1=Não Retido, 2=Retido Tomador, 3=Retido Intermediário

export type TipoRetencaoPisCofins = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EnderecoFiscal {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string; // IBGE 7 dígitos
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
  cpf?: string;
  inscricaoMunicipal: string;
  inscricaoEstadual?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  regimeTributario: RegimeTributario;
  regimeEspecial?: RegimeEspecialTributacao;
  optanteSimplesNacional: boolean;
  optanteMEI: boolean;
  endereco: EnderecoFiscal;
  cnae?: string;
  aliquotaSimplesNacional?: number;
}

export interface TomadorFiscal {
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  documento: string; // CPF ou CNPJ
  nif?: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  endereco: EnderecoFiscal;
  email?: string;
  telefone?: string;
  indicadorIEDestinatario?: '1' | '2' | '9'; // 1=Contribuinte, 2=Isento, 9=Não Contribuinte
}

// -------------------------------------------------------------
// NFS-e PADRÃO NACIONAL (v1.01 - Inclui Reforma Tributária 2026 IBS/CBS)
// -------------------------------------------------------------

export interface InformacoesIBSCBS {
  finalidade: number; // 0 = NFS-e regular
  indicadorUsoConsumoPessoal: 0 | 1; // 0 = Não, 1 = Sim (art. 57)
  codigoIndicadorOperacao: string; // Tabela IndOp (ex: 030101, 100101)
  tipoOperacaoGoverno?: 1 | 2 | 3 | 4 | 5;
  tipoEnteGovernamental?: 1 | 2 | 3 | 4 | 9;
  indicadorDestinatario: 0 | 1; // 0 = Tomador é Destinatário, 1 = Outro
  cstIBSCBS: string; // ex: 01, 02, 50...
  codigoClassificacaoTrib: string; // 3 dígitos
  codigoCreditoPresumido?: string;
  
  // Alíquotas e Valores
  aliquotaIBSUF: number;
  valorIBSUF: number;
  aliquotaIBSMun: number;
  valorIBSMun: number;
  aliquotaCBS: number;
  valorCBS: number;
  
  // Diferimento se houver
  percentualDiferimentoUF?: number;
  percentualDiferimentoMun?: number;
  percentualDiferimentoCBS?: number;
  
  // Informações de Pagamento Vinculado (NT 009)
  pagamentoVinculado?: {
    numeroPagamento: number;
    idTransacao: string;
    tipoMeioPagamento: string; // 01=Dinheiro, 03=Cartão, 17=PIX, 15=Boleto, etc
    cnpjRecebedor: string;
    cnpjBasePSP: string; // 8 primeiros dígitos
  };
}

export interface ServicoItemNfse {
  codigoTributacaoNacional: string; // 6 dígitos (ex: 010701 - Suporte Técnico)
  codigoTributacaoMunicipal: string; // Código municipal do ISS
  descricao: string;
  codigoNBS?: string; // 9 dígitos (ex: 1.1403.21.10)
  codigoInterno?: string;
  localPrestacao: {
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
  };
  valorServico: number;
  descontoIncondicionado?: number;
  descontoCondicionado?: number;
  deducoesMateriais?: number;
  
  // Impostos Municipais (ISSQN)
  tributacaoISSQN: TributacaoISSQN;
  aliquotaISS: number;
  valorISS: number;
  tipoRetencaoISS: TipoRetencaoISS;
  valorISSRetido: number;
  baseCalculoISS: number;
  
  // Retenções Federais (PIS, COFINS, IRRF, CSLL, INSS)
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
  
  // Reforma Tributária 2026 IBS/CBS
  ibscbs?: InformacoesIBSCBS;
  
  // Transparência Fiscal (Lei 12.741/2012 IBPT)
  valorTributosFederais: number;
  valorTributosEstaduais: number;
  valorTributosMunicipais: number;
  percentualTotalTributos: number;
}

export interface NFSeDocumento {
  id: string; // ID único interno
  chaveAcesso: string; // 53 dígitos padrão nacional
  numeroNfse: number;
  serieDPS: number;
  numeroDPS: number;
  dataCompetencia: string; // YYYY-MM-DD
  dataHoraEmissao: string; // ISO UTC
  dataHoraProcessamento: string;
  codigoVerificacao: string; // 9 caracteres (ex: A8B9-99F1)
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  
  // Participantes
  emitente: EmitenteFiscal;
  tomador: TomadorFiscal;
  
  // Serviço
  servico: ServicoItemNfse;
  
  // Totais
  valorTotalServicos: number;
  valorTotalDescontos: number;
  valorTotalDeducoes: number;
  baseCalculoISS: number;
  valorTotalISS: number;
  valorTotalISSRetido: number;
  valorTotalRetencoesFederais: number;
  valorTotalIBS: number; // IBS UF + IBS Mun
  valorTotalCBS: number;
  valorLiquidoNfse: number;
  valorTotalNotaFinal: number; // Considerando tributos por fora da Reforma 2026
  
  // Metadados adicionais
  informacoesComplementares?: string;
  numeroPedido?: string;
  motivoCancelamento?: string;
  dataHoraCancelamento?: string;
  chaveNfseSubstituta?: string;
  xmlAssinado: string;
  urlConsultaPrefeitura?: string;
  urlVisualizacaoNacional?: string;
}

// -------------------------------------------------------------
// NF-e PRODUTO (Modelo 55) & NFC-e (Modelo 65)
// -------------------------------------------------------------

export interface ItemNfe {
  id: string;
  codigoProduto: string;
  descricao: string;
  ncm: string; // 8 dígitos
  cest?: string; // 7 dígitos
  cfop: string; // 4 dígitos (ex: 5102, 6102)
  unidadeMedida: string; // UN, KG, CX, PCT, etc.
  quantidade: number;
  valorUnitario: number;
  valorTotalBruto: number;
  descontoItem?: number;
  freteItem?: number;
  seguroItem?: number;
  outrasDespesasItem?: number;
  
  // Tributação ICMS
  origemMercadoria: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  cstICMS: string; // ex: 00, 10, 20, 60 ou CSOSN: 101, 102, 500, 900
  aliquotaICMS: number;
  baseCalculoICMS: number;
  valorICMS: number;
  aliquotaICMSST?: number;
  valorICMSST?: number;
  
  // IPI
  cstIPI?: string;
  aliquotaIPI?: number;
  valorIPI?: number;
  
  // PIS / COFINS
  cstPIS: string;
  aliquotaPIS: number;
  valorPIS: number;
  
  cstCOFINS: string;
  aliquotaCOFINS: number;
  valorCOFINS: number;
  
  // IBS / CBS 2026 (Reforma Tributária)
  cstIBSCBS?: string;
  aliquotaIBSUF?: number;
  valorIBSUF?: number;
  aliquotaIBSMun?: number;
  valorIBSMun?: number;
  aliquotaCBS?: number;
  valorCBS?: number;
  
  // Lei da Transparência (IBPT)
  valorTributosAproximados: number;
}

export interface FaturaDuplicata {
  numero: string;
  dataVencimento: string;
  valor: number;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}

export interface TransporteNfe {
  modalidadeFrete: 0 | 1 | 2 | 3 | 4 | 9; // 0=Emitente (CIF), 1=Destinatário (FOB), 2=Terceiros, 9=Sem Frete
  transportadora?: {
    cnpjCpf: string;
    razaoSocial: string;
    inscricaoEstadual?: string;
    enderecoCompleto?: string;
    municipio?: string;
    uf?: string;
  };
  veiculo?: {
    placa: string;
    uf: string;
    rntc?: string;
  };
  volumes?: {
    quantidade: number;
    especie: string;
    marca?: string;
    numero?: string;
    pesoLiquidoKg: number;
    pesoBrutoKg: number;
  };
}

export interface NFeDocumento {
  id: string;
  modelo: '55' | '65'; // 55=NF-e, 65=NFC-e
  serie: number;
  numero: number;
  chaveAcesso: string; // 44 dígitos
  dataHoraEmissao: string;
  dataHoraSaida?: string;
  naturezaOperacao: string; // ex: "Venda de Mercadorias para Consumo"
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  tipoDocumento: 0 | 1; // 0=Entrada, 1=Saída
  finalidade: 1 | 2 | 3 | 4; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
  consumidorFinal: boolean;
  presencaComprador: 0 | 1 | 2 | 3 | 4 | 9; // 1=Presencial, 2=Internet, etc.
  status: StatusDocumentoFiscal;
  
  // Partes
  emitente: EmitenteFiscal;
  destinatario: TomadorFiscal;
  
  // Itens
  itens: ItemNfe[];
  
  // Totais ICMS / Produtos
  valorTotalProdutos: number;
  valorTotalFrete: number;
  valorTotalSeguro: number;
  valorTotalDesconto: number;
  valorTotalOutrasDespesas: number;
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
  
  // Cobrança e Pagamento
  formaPagamento: '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'; // Dinheiro, Cheque, Cartão Crédito, Débito, Boleto, PIX, Sem Pagamento, Outros
  duplicatas: FaturaDuplicata[];
  
  // Transporte
  transporte: TransporteNfe;
  
  // Metadados
  informacoesAdicionais?: string;
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  motivoCancelamento?: string;
  dataHoraCancelamento?: string;
  xmlAssinado: string;
}

// -------------------------------------------------------------
// NFC-e CONSUMIDOR (Modelo 65 - Varejo e PDV)
// -------------------------------------------------------------

export interface NFCeDocumento {
  id: string;
  modelo: '65';
  serie: number;
  numero: number;
  chaveAcesso: string; // 44 dígitos
  dataHoraEmissao: string;
  naturezaOperacao: string; // "Venda a Consumidor Final"
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  
  emitente: EmitenteFiscal;
  consumidorIdentificado: boolean;
  destinatario?: {
    cpfCnpj?: string;
    nomeRazaoSocial?: string;
    email?: string;
    endereco?: EnderecoFiscal;
  };
  
  itens: ItemNfe[];
  
  valorTotalProdutos: number;
  valorTotalDesconto: number;
  valorTotalAcrescimo?: number;
  valorTotalTributosAproximados: number;
  valorTotalNota: number;
  
  formaPagamento: '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'; // Dinheiro, Cheque, Cartão Crédito, Débito, Boleto, PIX, Outros
  valorPago: number;
  valorTroco: number;
  
  urlQrCode: string;
  tokenCscId: string;
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  motivoCancelamento?: string;
  dataHoraCancelamento?: string;
  xmlAssinado: string;
}

// -------------------------------------------------------------
// CT-e TRANSPORTE (Modelo 57 - Conhecimento de Transporte)
// -------------------------------------------------------------

export interface CTeDocumento {
  id: string;
  modelo: '57';
  serie: number;
  numero: number;
  chaveAcesso: string; // 44 dígitos
  dataHoraEmissao: string;
  naturezaOperacao: string; // ex: "Prestação de Serviço de Transporte Intermunicipal/Interestadual"
  cfop: string; // ex: 5353, 6353
  ambiente: TipoAmbiente;
  tipoEmissao: TipoEmissao;
  status: StatusDocumentoFiscal;
  
  // Participantes
  emitente: EmitenteFiscal; // Transportadora
  remetente: TomadorFiscal;
  destinatario: TomadorFiscal;
  expedidor?: TomadorFiscal;
  recebedor?: TomadorFiscal;
  tomadorServico: 0 | 1 | 2 | 3 | 4; // 0=Remetente, 1=Expedidor, 2=Recebedor, 3=Destinatário, 4=Outros
  
  // Dados do Transporte e Carga
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
  
  produtoPredominante: string; // ex: "Equipamentos de Informática e Peças"
  valorCargaAverbada: number;
  pesoBrutoKg: number;
  pesoLiquidoKg: number;
  quantidadeVolumes: number;
  especieVolumes: string; // ex: "Caixas", "Paletes", "Fardos"
  cubagemM3?: number;
  chavesNFeTransportadas: string[]; // Chaves de 44 dígitos das notas vinculadas
  
  // Veículo e Motorista
  rntrc: string; // Registro Nacional de Transportadores Rodoviários
  veiculo: {
    placa: string;
    uf: string;
    rntrcProprietario?: string;
  };
  motorista: {
    nome: string;
    cpf: string;
  };
  
  // Valores e Componentes da Prestação
  valorTotalFrete: number;
  componentesValor: {
    fretePeso: number;
    freteValor: number;
    pedagio: number;
    taxaGris: number;
    outrasTaxas: number;
  };
  valorReceber: number;
  
  // Tributos ICMS de Transporte
  cstICMS: '00' | '20' | '40' | '60' | '90';
  baseCalculoICMS: number;
  aliquotaICMS: number;
  valorICMS: number;
  valorPIS: number;
  valorCOFINS: number;
  valorTributosAproximados: number;
  
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  motivoCancelamento?: string;
  dataHoraCancelamento?: string;
  xmlAssinado: string;
}

// -------------------------------------------------------------
// NFA-e NOTA FISCAL AVULSA (Modelo 01/55 Avulsa SEFAZ)
// -------------------------------------------------------------

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
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  aliquotaICMS: number;
  valorICMS: number;
}

export interface NFAeDocumento {
  id: string;
  modelo: '01-AVULSA';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  motivoEmissao: MotivoEmissaoNFAe;
  descricaoMotivo: string;
  ambiente: TipoAmbiente;
  status: StatusDocumentoFiscal;
  
  // Emitente / Requerente Avulso
  requerente: {
    tipoPessoa: 'PF' | 'PJ';
    cpfCnpj: string;
    nomeRazaoSocial: string;
    inscricaoProdutorRural?: string;
    endereco: EnderecoFiscal;
    telefone?: string;
    email?: string;
  };
  
  // Destinatário
  destinatario: TomadorFiscal;
  
  // Itens
  itens: ItemNfae[];
  
  // Totais
  valorTotalProdutos: number;
  baseCalculoICMS: number;
  aliquotaICMSMediana: number;
  valorTotalICMS: number;
  valorTotalNota: number;
  
  // Guia DAE (Documento de Arrecadação Estadual de ICMS)
  guiaDAE: {
    numeroDAE: string;
    codigoBarras: string;
    chavePixSefaz: string;
    dataVencimento: string;
    valorDAE: number;
    statusPagamento: 'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'ISENTO';
  };
  
  orgaoEmissorSefaz: string; // ex: "SEFAZ/SP - Posto Fiscal da Capital"
  protocoloAutorizacao: string;
  dataHoraAutorizacao: string;
  motivoCancelamento?: string;
  dataHoraCancelamento?: string;
  xmlAssinado: string;
}

// -------------------------------------------------------------
// EVENTOS FISCAIS (Cancelamento, Carta de Correção - CC-e)
// -------------------------------------------------------------

export interface EventoFiscal {
  id: string;
  tipoEvento: 'CANCELAMENTO' | 'CCE' | 'SUBSTITUICAO';
  codigoEvento: string; // 110111 (Cancelamento NFe), 110110 (CC-e), 101101 (Cancelamento NFSe)
  descricaoEvento: string;
  chaveDocumento: string;
  numeroSequencial: number;
  dataHoraEvento: string;
  justificativaOuTexto: string;
  protocoloEvento: string;
  xmlEvento: string;
  status: 'HOMOLOGADO' | 'REJEITADO';
}

