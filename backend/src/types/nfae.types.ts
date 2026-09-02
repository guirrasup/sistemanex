// backend/src/types/nfae.types.ts

export type MotivoEmissaoNFAe = 
  | 'PRODUTOR_RURAL'
  | 'MEI_SEM_IE'
  | 'PF_ATIVO_PESSOAL'
  | 'FEIRAS_EVENTOS'
  | 'DEVOLUCAO_AVULSA'
  | 'OUTROS';

export interface NFAeItem {
  id?: string;
  codigo: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  aliquotaICMS: number;
  valorICMS: number;
  codigoBarrasEAN?: string;
}

export interface NFAeDocumento {
  id: string;
  modelo: '63';
  serie: number;
  numero: number;
  chaveAcesso: string;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  motivoEmissao: MotivoEmissaoNFAe;
  descricaoMotivo: string;
  ambiente: number;
  tipoEmissao: string;
  status: string;
  
  requerente: {
    tipoPessoa: 'PF' | 'PJ';
    documento: string;
    nome: string;
    inscricaoProdutor?: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    municipioIbge?: string;
    uf: string;
    cep: string;
    telefone?: string;
    email?: string;
  };
  
  destinatario: {
    tipoPessoa: 'PF' | 'PJ';
    documento: string;
    nome: string;
    ie?: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    municipioIbge?: string;
    uf: string;
    cep: string;
    telefone?: string;
    email?: string;
  };
  
  itens: NFAeItem[];
  valorTotalProdutos: number;
  baseCalculoICMS: number;
  aliquotaICMSMediana: number;
  valorTotalICMS: number;
  valorTotalNota: number;
  
  guiaDAE?: {
    numero: string;
    codigoBarras: string;
    chavePix: string;
    vencimento: string;
    valor: number;
    status: 'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'ISENTO';
  };
  
  orgaoEmissorSefaz: string;
  protocoloAutorizacao?: string;
  dataHoraAutorizacao?: string;
  motivoCancelamento?: string;
  dataHoraCancelamento?: string;
  xmlAssinado: string;
  informacoesComplementares?: string;
  empresaId: string;
}