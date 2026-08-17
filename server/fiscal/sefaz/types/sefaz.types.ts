export type AmbienteSefaz = 1 | 2; // 1 = Produção, 2 = Homologação
export type TipoDocumentoFiscal = "55" | "65" | "nf_e" | "nfc_e" | "nfs_e"; // 55 = NF-e, 65 = NFC-e

export interface CertificateInfo {
  cnpj: string;
  commonName: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isValid: boolean;
  serialNumber?: string;
}

export interface SefazConfig {
  uf: string;
  ambiente: AmbienteSefaz;
  versaoDF?: string;
  pfxBuffer?: Buffer;
  pfxPath?: string;
  password?: string;
  cscToken?: string;
  cscId?: string;
}

export interface EmitenteConfig {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual: string;
  inscricaoMunicipal?: string;
  regimeTributario: "1" | "2" | "3"; // 1 = Simples Nacional, 2 = Simples Exec. Rec., 3 = Reg. Normal
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
  };
}

export interface DestinatarioData {
  cpfCnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string;
  email?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
  };
}

export interface ItemNFe {
  itemNumero: number;
  codigo: string;
  gtin?: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  icmsRate?: number;
  icmsAmount?: number;
  pisRate?: number;
  pisAmount?: number;
  cofinsRate?: number;
  cofinsAmount?: number;
  ipiRate?: number;
  ipiAmount?: number;
}

export interface NFePayload {
  serie: number;
  numeroNota: number;
  naturezaOperacao: string;
  dataEmissao?: string;
  tipoDocumento: TipoDocumentoFiscal;
  emitente: EmitenteConfig;
  destinatario: DestinatarioData;
  itens: ItemNFe[];
  formaPagamento?: string;
  valorTotalNota: number;
  informacoesAdicionais?: string;
}

export interface NFeEmissaoResult {
  id: string;
  chaveNFe: string;
  numeroNota: number;
  serie: number;
  status: "authorized" | "rejected" | "processing" | "cancelled";
  motivo: string;
  codigoSefaz: string;
  protocoloAutorizacao?: string;
  dataAutorizacao?: string;
  xmlAssinado?: string;
  qrCodeUrl?: string;
}

export interface EventoCancelamentoPayload {
  chaveNFe: string;
  protocoloAutorizacao: string;
  justificativa: string;
  cnpjEmitente: string;
}

export interface EventoCCePayload {
  chaveNFe: string;
  correcao: string;
  sequencialEvento?: number;
  cnpjEmitente: string;
}

export interface ManifestacaoPayload {
  chaveNFe: string;
  tipoManifestacao: "210200" | "210210" | "210220" | "210240";
  justificativa?: string;
  cnpjDestinatario: string;
}

export interface InutilizacaoPayload {
  uf: string;
  ano: number;
  cnpj: string;
  serie: number;
  numeroInicial: number;
  numeroFinal: number;
  justificativa: string;
}

export interface EventoResult {
  chaveNFe: string;
  tipoEvento: string;
  codigoSefaz: string;
  motivo: string;
  protocolo?: string;
  dataEvento: string;
  status: "success" | "rejected";
}

export interface StatusServicoResult {
  uf: string;
  ambiente: AmbienteSefaz;
  codigoSefaz: string;
  motivo: string;
  tempoMedioRespostaSegundos: number;
  disponivel: boolean;
  dataConsulta: string;
}
