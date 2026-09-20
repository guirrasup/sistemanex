// src/types/fiscal.d.ts
export type TCodUfIBGE = 
  | '11' | '12' | '13' | '14' | '15' | '16' | '17'
  | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29'
  | '31' | '32' | '33' | '35'
  | '41' | '42' | '43'
  | '50' | '51' | '52' | '53';

export type TCodMunIBGE = string; // 7 dígitos

export type TChNFe = string; // 44 dígitos

export type TProt = string; // 15 ou 17 dígitos

export type TRec = string; // 15 dígitos

export type TStat = string; // 3 dígitos

export type TCnpj = string; // 14 dígitos

export type TCnpjVar = string; // 3-14 dígitos

export type TCnpjOpc = string; // '' ou 14 dígitos

export type TCpf = string; // 11 dígitos

export type TCpfVar = string; // 3-11 dígitos

export type TDec_0302 = string; // Regex: 0|0\.[0-9]{2}|[1-9]{1}[0-9]{0,2}(\.[0-9]{2})?

export type TDec_0302Opc = string; // Regex: 0\.[0-9]{1}[1-9]{1}|0\.[1-9]{1}[0-9]{1}|[1-9]{1}[0-9]{0,2}(\.[0-9]{2})?

export type TDec_0302_04 = string; // Regex: 0|0\.[0-9]{2,4}|[1-9]{1}[0-9]{0,2}(\.[0-9]{2,4})?

export type TDec_0803 = string; // Regex: 0|0\.[0-9]{3}|[1-9]{1}[0-9]{0,7}(\.[0-9]{3})?

export type TDec_0804 = string; // Regex: 0|0\.[0-9]{4}|[1-9]{1}[0-9]{0,7}(\.[0-9]{4})?

export type TDec_1104v = string; // Regex: 0|0\.[0-9]{1,4}|[1-9]{1}[0-9]{0,10}|[1-9]{1}[0-9]{0,10}(\.[0-9]{1,4})?

export type TDec_1204 = string; // Regex: 0|0\.[0-9]{1,4}|[1-9]{1}[0-9]{0,11}|[1-9]{1}[0-9]{0,11}(\.[0-9]{1,4})?

export type TDec_1302 = string; // Regex: 0|0\.[0-9]{2}|[1-9]{1}[0-9]{0,12}(\.[0-9]{2})?

export type TDec_1110 = string; // Regex: 0|0\.[0-9]{1,10}|[1-9]{1}[0-9]{0,10}|[1-9]{1}[0-9]{0,10}(\.[0-9]{1,10})?

export type TIeDest = string; // "ISENTO" ou [0-9]{0,14}

export type TIeST = string; // [0-9]{2,14}

export type TIe = string; // [0-9]{2,14} ou "ISENTO"

export type TMod = '55' | '65' | '57' | '01-AVULSA';

export type TNF = number; // 1-999999999

export type TSerie = number; // 0 ou 1-999

export type Tpais = string; // Código de 3 ou 4 dígitos

export type TUf = 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MG' | 'MS' | 'MT' | 'PA' | 'PB' | 'PE' | 'PI' | 'PR' | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO' | 'EX';

export type TUfEmi = Exclude<TUf, 'EX'>;

export type TAmb = 1 | 2;

export type TpAutor = 1 | 2 | 3 | 5 | 6 | 9;

export type TString = string; // Regex: [!-ÿ]{1}[ -ÿ]{0,}[!-ÿ]{1}|[!-ÿ]{1}

export type TData = string; // YYYY-MM-DD

export type TTime = string; // HH:MM:SS

export type TDateTimeUTC = string; // YYYY-MM-DDThh:mm:ss±hh:mm

export type TJust = string; // 15-255 caracteres

export type TMotivo = string; // 1-255 caracteres

export type TVerAplic = string; // 1-20 caracteres

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
  
  codigoMunicipio: TCodMunIBGE;
  nomeMunicipio: string;
  
  uf: TUf;
  
  cep: string;
  
  codigoPais?: Tpais;
  nomePais?: string;
  
  telefone?: string;
  email?: string;
}

export interface EmitenteFiscal {
  cnpj: TCnpj;
  
  cpf?: TCpf;
  
  inscricaoMunicipal: string;
  
  inscricaoEstadual?: TIe;
  
  razaoSocial: string;
  nomeFantasia?: string;
  
  regimeTributario: RegimeTributario;
  regimeEspecial?: RegimeEspecialTributacao;
  optanteSimplesNacional: boolean;
  optanteMEI: boolean;
  
  endereco: EnderecoFiscal;
  cnae?: string;
  
  aliquotaSimplesNacional?: TDec_0302;
}

export interface TomadorFiscal {
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  
  documento: TCnpj | TCpf;
  
  nif?: string;
  inscricaoMunicipal?: string;
  
  inscricaoEstadual?: TIeDest;
  
  inscricaoEstadualST?: TIeST;
  
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  
  endereco: EnderecoFiscal;
  email?: string;
  telefone?: string;
  
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
  
  cstIBSCBS: string;
  codigoClassificacaoTrib: string; // 3 dígitos
  codigoCreditoPresumido?: string;
  
  aliquotaIBSUF: TDec_0302_04;
  valorIBSUF: TDec_1104v;
  
  aliquotaIBSMun: TDec_0302_04;
  valorIBSMun: TDec_1104v;
  
  aliquotaCBS: TDec_0302_04;
  valorCBS: TDec_1104v;
  
  percentualDiferimentoUF?: TDec_0302_04;
  percentualDiferimentoMun?: TDec_0302_04;
  percentualDiferimentoCBS?: TDec_0302_04;
  
  pagamentoVinculado?: {
    numeroPagamento: number;
    idTransacao: string;
    tipoMeioPagamento: FormaPagamento;
    
    cnpjRecebedor: TCnpj;
    
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
  
  valorServico: TDec_1104v;
  
  descontoIncondicionado?: TDec_1104v;
  
  descontoCondicionado?: TDec_1104v;
  
  deducoesMateriais?: TDec_1104v;
  
  tributacaoISSQN: TributacaoISSQN;
  
  aliquotaISS: TDec_0302_04;
  
  valorISS: TDec_1104v;
  
  tipoRetencaoISS: TipoRetencaoISS;
  
  valorISSRetido: TDec_1104v;
  
  baseCalculoISS: TDec_1104v;
  
  cstPisCofins?: string;
  
  aliquotaPIS?: TDec_0302_04;
  
  valorPIS?: TDec_1104v;
  
  retidoPIS?: boolean;
  
  aliquotaCOFINS?: TDec_0302_04;
  
  valorCOFINS?: TDec_1104v;
  
  retidoCOFINS?: boolean;
  
  aliquotaIRRF?: TDec_0302_04;
  
  valorIRRF?: TDec_1104v;
  
  aliquotaCSLL?: TDec_0302_04;
  
  valorCSLL?: TDec_1104v;
  
  aliquotaINSS?: TDec_0302_04;
  
  valorINSS?: TDec_1104v;
  
  ibscbs?: InformacoesIBSCBS;
  
  valorTributosFederais: TDec_1104v;
  
  valorTributosEstaduais: TDec_1104v;
  
  valorTributosMunicipais: TDec_1104v;
  
  percentualTotalTributos: TDec_0302_04;
}

export interface NFSeDocumento {
  id: string;
  
  chaveAcesso: string;
  
  numeroNfse: TNF;
  serieDPS: TSerie;
  numeroDPS: TNF;
  
  dataCompetencia: TData;
  
  dataHoraEmissao: TDateTimeUTC;
  
  dataHoraProcessamento: TDateTimeUTC;
  
  codigoVerificacao: string; // 9 caracteres
  
  ambiente: TAmb;
  
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
  numeroPedido?: string;
  
  motivoCancelamento?: TJust;
  
  dataHoraCancelamento?: TDateTimeUTC;
  
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
  
  ncm: string;
  
  cest?: string;
  
  cfop: string;
  
  unidadeMedida: string; // UN, KG, CX, PCT
  
  quantidade: TDec_1104v;
  
  valorUnitario: TDec_1104v;
  
  valorTotalBruto: TDec_1104v;
  
  descontoItem?: TDec_1104v;
  
  freteItem?: TDec_1104v;
  
  seguroItem?: TDec_1104v;
  
  outrasDespesasItem?: TDec_1104v;
  
  origemMercadoria: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  
  cstICMS: CSTICMS | CSOSN;
  
  aliquotaICMS: TDec_0302_04;
  
  baseCalculoICMS: TDec_1104v;
  
  valorICMS: TDec_1104v;
  
  aliquotaICMSST?: TDec_0302_04;
  
  valorICMSST?: TDec_1104v;
  
  cstIPI?: string;
  
  aliquotaIPI?: TDec_0302_04;
  
  valorIPI?: TDec_1104v;
  
  cstPIS: string;
  
  aliquotaPIS: TDec_0302_04;
  
  valorPIS: TDec_1104v;
  
  cstCOFINS: string;
  
  aliquotaCOFINS: TDec_0302_04;
  
  valorCOFINS: TDec_1104v;
  
  cstIBSCBS?: string;
  
  aliquotaIBSUF?: TDec_0302_04;
  
  valorIBSUF?: TDec_1104v;
  
  aliquotaIBSMun?: TDec_0302_04;
  
  valorIBSMun?: TDec_1104v;
  
  aliquotaCBS?: TDec_0302_04;
  
  valorCBS?: TDec_1104v;
  
  valorTributosAproximados: TDec_1104v;
  
  codigoEAN?: string;
  codigoEANTrib?: string;
}

export interface FaturaDuplicata {
  numero: string;
  
  dataVencimento: TData;
  
  valor: TDec_1104v;
  
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}

export interface TransporteNfe {
  modalidadeFrete: ModalidadeFrete;
  
  transportadora?: {
    cnpjCpf: TCnpjOpc;
    razaoSocial: string;
    
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
    quantidade: TDec_1104v;
    especie: string;
    marca?: string;
    numero?: string;
    
    pesoLiquidoKg: TDec_1104v;
    
    pesoBrutoKg: TDec_1104v;
  };
}

export interface NFeDocumento {
  id: string;
  
  modelo: TMod;
  
  serie: TSerie;
  
  numero: TNF;
  
  chaveAcesso: TChNFe;
  
  dataHoraEmissao: TDateTimeUTC;
  
  dataHoraSaida?: TDateTimeUTC;
  
  naturezaOperacao: TString;
  
  ambiente: TAmb;
  
  tipoEmissao: TipoEmissao;
  
  tipoDocumento: TpNF;
  
  finalidade: FinalidadeNFe;
  
  consumidorFinal: boolean;
  
  presencaComprador: IndPresenca;
  
  status: StatusDocumentoFiscal;
  
  idDest?: IdDest;
  
  tpImp?: TpImp;
  
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
  
  duplicatas: FaturaDuplicata[];
  transporte: TransporteNfe;
  
  informacoesAdicionais?: TString;
  
  protocoloAutorizacao: TProt;
  
  dataHoraAutorizacao: TDateTimeUTC;
  
  motivoCancelamento?: TJust;
  
  dataHoraCancelamento?: TDateTimeUTC;
  
  xmlAssinado: string;
}

// ============================================================
// NFC-e CONSUMIDOR (Modelo 65)
// ============================================================

export interface NFCeDocumento {
  id: string;
  modelo: '65';
  
  serie: TSerie;
  
  numero: TNF;
  
  chaveAcesso: TChNFe;
  
  dataHoraEmissao: TDateTimeUTC;
  
  naturezaOperacao: string;
  
  ambiente: TAmb;
  
  tipoEmissao: TipoEmissao;
  
  status: StatusDocumentoFiscal;
  
  emitente: EmitenteFiscal;
  consumidorIdentificado: boolean;
  
  destinatario?: {
    cpfCnpj?: TCnpjOpc | TCpf;
    nomeRazaoSocial?: string;
    email?: string;
    endereco?: EnderecoFiscal;
  };
  
  itens: ItemNfe[];
  
  valorTotalProdutos: TDec_1104v;
  
  valorTotalDesconto: TDec_1104v;
  
  valorTotalAcrescimo?: TDec_1104v;
  
  valorTotalTributosAproximados: TDec_1104v;
  
  valorTotalNota: TDec_1104v;
  
  formaPagamento: FormaPagamento;
  
  valorPago: TDec_1104v;
  
  valorTroco: TDec_1104v;
  
  urlQrCode: string;
  tokenCscId: string;
  
  protocoloAutorizacao: TProt;
  
  dataHoraAutorizacao: TDateTimeUTC;
  
  motivoCancelamento?: TJust;
  
  dataHoraCancelamento?: TDateTimeUTC;
  
  xmlAssinado: string;
}

// ============================================================
// CT-e TRANSPORTE (Modelo 57)
// ============================================================

export interface CTeDocumento {
  id: string;
  modelo: '57';
  
  serie: TSerie;
  
  numero: TNF;
  
  chaveAcesso: TChNFe;
  
  dataHoraEmissao: TDateTimeUTC;
  
  naturezaOperacao: string;
  
  cfop: string;
  
  ambiente: TAmb;
  
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
  
  valorCargaAverbada: TDec_1104v;
  
  pesoBrutoKg: TDec_1104v;
  
  pesoLiquidoKg: TDec_1104v;
  
  quantidadeVolumes: number;
  especieVolumes: string;
  
  cubagemM3?: TDec_1104v;
  
  chavesNFeTransportadas: TChNFe[];
  
  rntrc: string;
  
  veiculo: {
    placa: string; // 7 caracteres
    uf: TUf;
    rntrcProprietario?: string;
  };
  
  motorista: {
    nome: string;
    
    cpf: TCpf;
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
  
  cstICMS: CSTICMS;
  
  baseCalculoICMS: TDec_1104v;
  
  aliquotaICMS: TDec_0302_04;
  
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
  
  ncm: string;
  
  unidade: string;
  
  quantidade: TDec_1104v;
  
  valorUnitario: TDec_1104v;
  
  valorTotal: TDec_1104v;
  
  aliquotaICMS: TDec_0302_04;
  
  valorICMS: TDec_1104v;
}

export interface NFAeDocumento {
  id: string;
  modelo: '01-AVULSA';
  
  serie: TSerie;
  
  numero: TNF;
  
  chaveAcesso: string;
  
  dataHoraEmissao: TDateTimeUTC;
  
  naturezaOperacao: string;
  motivoEmissao: MotivoEmissaoNFAe;
  descricaoMotivo: string;
  
  ambiente: TAmb;
  
  status: StatusDocumentoFiscal;
  
  requerente: {
    tipoPessoa: 'PF' | 'PJ';
    
    cpfCnpj: TCpf | TCnpj;
    
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
  
  aliquotaICMSMediana: TDec_0302_04;
  
  valorTotalICMS: TDec_1104v;
  
  valorTotalNota: TDec_1104v;
  
  guiaDAE: {
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

// ============================================================
// EVENTOS FISCAIS
// ============================================================

export type TipoEventoFiscal = 'CANCELAMENTO' | 'CCE' | 'SUBSTITUICAO' | 'CREDITO_PRESUMIDO';

export interface EventoFiscal {
  id: string;
  tipoEvento: TipoEventoFiscal;
  
  codigoEvento: string;
  
  descricaoEvento: string;
  
  chaveDocumento: TChNFe;
  
  numeroSequencial: number;
  
  dataHoraEvento: TDateTimeUTC;
  
  justificativaOuTexto: TJust;
  
  protocoloEvento?: TRec;
  
  xmlEvento: string;
  status: 'HOMOLOGADO' | 'REJEITADO';
  
  tpAutor?: TpAutor;
  
  verAplic?: TVerAplic;
  
  cOrgaoAutor?: TCodUfIBGE;
  
  cStat?: TStat;
  
  xMotivo?: TMotivo;
}

// ============================================================
// EVENTO DE CRÉDITO PRESUMIDO (detEvento - PL_006h)
// ============================================================

export interface EventoCreditoPresumidoItem {
  nItem: TnItem;
  
  vBCCredPres: TDec_1302;
  
  cCredPres: string;
  
  pCredPresIBS?: TDec_0302_04;
  
  vCredPresIBS?: TDec_1302;
  
  pCredPresCBS?: TDec_0302_04;
  
  vCredPresCBS?: TDec_1302;
}

export interface EventoCreditoPresumido {
  id: string;
  
  chaveNFe: TChNFe;
  
  tpAutor: TpAutor;
  
  verAplic: TVerAplic;
  
  cOrgaoAutor: TCodUfIBGE;
  
  dhEvento: TDateTimeUTC;
  
  nRec?: TRec;
  
  nProt?: TProt;
  
  itens: EventoCreditoPresumidoItem[];
  
  xmlEvento: string;
  xmlRetorno?: string;
}