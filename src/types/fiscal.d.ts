/**
 * Tipos e Interfaces para Documentos Fiscais Brasileiros
 * SUP TECNOLOGIA - Emissor Fiscal & Gestão ERP
 * Padrões: NFS-e Padrão Nacional v1.01 (com IBS/CBS 2026), NF-e v4.00, NFC-e v4.00
 */
export type TipoDocumentoFiscal = 'NFSE' | 'NFE' | 'NFCE' | 'CTE' | 'NFAE';
export type StatusDocumentoFiscal = 'AUTORIZADA' | 'CANCELADA' | 'SUBSTITUIDA' | 'PROCESSANDO' | 'REJEITADA';
export type TipoAmbiente = 1 | 2;
export type TipoEmissao = 1 | 2;
export type RegimeTributario = 1 | 2 | 3;
export type RegimeEspecialTributacao = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TributacaoISSQN = 1 | 2 | 3 | 4;
export type TipoRetencaoISS = 1 | 2 | 3;
export type TipoRetencaoPisCofins = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
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
    documento: string;
    nif?: string;
    inscricaoMunicipal?: string;
    inscricaoEstadual?: string;
    nomeRazaoSocial: string;
    nomeFantasia?: string;
    endereco: EnderecoFiscal;
    email?: string;
    telefone?: string;
    indicadorIEDestinatario?: '1' | '2' | '9';
}
export interface InformacoesIBSCBS {
    finalidade: number;
    indicadorUsoConsumoPessoal: 0 | 1;
    codigoIndicadorOperacao: string;
    tipoOperacaoGoverno?: 1 | 2 | 3 | 4 | 5;
    tipoEnteGovernamental?: 1 | 2 | 3 | 4 | 9;
    indicadorDestinatario: 0 | 1;
    cstIBSCBS: string;
    codigoClassificacaoTrib: string;
    codigoCreditoPresumido?: string;
    aliquotaIBSUF: number;
    valorIBSUF: number;
    aliquotaIBSMun: number;
    valorIBSMun: number;
    aliquotaCBS: number;
    valorCBS: number;
    percentualDiferimentoUF?: number;
    percentualDiferimentoMun?: number;
    percentualDiferimentoCBS?: number;
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
    numeroPedido?: string;
    motivoCancelamento?: string;
    dataHoraCancelamento?: string;
    chaveNfseSubstituta?: string;
    xmlAssinado: string;
    urlConsultaPrefeitura?: string;
    urlVisualizacaoNacional?: string;
}
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
    freteItem?: number;
    seguroItem?: number;
    outrasDespesasItem?: number;
    origemMercadoria: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    cstICMS: string;
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
}
export interface FaturaDuplicata {
    numero: string;
    dataVencimento: string;
    valor: number;
    status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}
export interface TransporteNfe {
    modalidadeFrete: 0 | 1 | 2 | 3 | 4 | 9;
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
    modelo: '55' | '65';
    serie: number;
    numero: number;
    chaveAcesso: string;
    dataHoraEmissao: string;
    dataHoraSaida?: string;
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
    formaPagamento: '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99';
    duplicatas: FaturaDuplicata[];
    transporte: TransporteNfe;
    informacoesAdicionais?: string;
    protocoloAutorizacao: string;
    dataHoraAutorizacao: string;
    motivoCancelamento?: string;
    dataHoraCancelamento?: string;
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
    formaPagamento: '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99';
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
    valorCargaAverbada: number;
    pesoBrutoKg: number;
    pesoLiquidoKg: number;
    quantidadeVolumes: number;
    especieVolumes: string;
    cubagemM3?: number;
    chavesNFeTransportadas: string[];
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
    valorTotalFrete: number;
    componentesValor: {
        fretePeso: number;
        freteValor: number;
        pedagio: number;
        taxaGris: number;
        outrasTaxas: number;
    };
    valorReceber: number;
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
export type MotivoEmissaoNFAe = 'PRODUTOR_RURAL' | 'MEI_SEM_IE' | 'PF_ATIVO_PESSOAL' | 'FEIRAS_EVENTOS' | 'DEVOLUCAO_AVULSA' | 'OUTROS';
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
    valorTotalProdutos: number;
    baseCalculoICMS: number;
    aliquotaICMSMediana: number;
    valorTotalICMS: number;
    valorTotalNota: number;
    guiaDAE: {
        numeroDAE: string;
        codigoBarras: string;
        chavePixSefaz: string;
        dataVencimento: string;
        valorDAE: number;
        statusPagamento: 'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'ISENTO';
    };
    orgaoEmissorSefaz: string;
    protocoloAutorizacao: string;
    dataHoraAutorizacao: string;
    motivoCancelamento?: string;
    dataHoraCancelamento?: string;
    xmlAssinado: string;
}
export interface EventoFiscal {
    id: string;
    tipoEvento: 'CANCELAMENTO' | 'CCE' | 'SUBSTITUICAO';
    codigoEvento: string;
    descricaoEvento: string;
    chaveDocumento: string;
    numeroSequencial: number;
    dataHoraEvento: string;
    justificativaOuTexto: string;
    protocoloEvento: string;
    xmlEvento: string;
    status: 'HOMOLOGADO' | 'REJEITADO';
}
//# sourceMappingURL=fiscal.d.ts.map