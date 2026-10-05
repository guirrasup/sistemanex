// backend/src/utils/fiscalMappers.ts
// Funções compartilhadas para converter registros do Prisma (Empresa/Cliente/Endereco)
// nos DTOs fiscais (EmitenteFiscal/TomadorFiscal/EnderecoFiscal) usados pelos
// geradores de XML (NFe, NFCe, CTe, NFAe).
import type { EmitenteFiscal, EnderecoFiscal, TomadorFiscal } from '../types/fiscal.js';

export const CRT_POR_REGIME: Record<string, 1 | 2 | 3> = {
  SIMPLES_NACIONAL: 1,
  SIMPLES_EXCESSO: 2,
  NORMAL: 3,
};

interface EnderecoRegistro {
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  codigoMunicipio: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  codigoPais?: string | null;
  nomePais?: string | null;
  telefone?: string | null;
  email?: string | null;
}

export function mapEndereco(endereco: EnderecoRegistro): EnderecoFiscal {
  return {
    logradouro: endereco.logradouro,
    numero: endereco.numero,
    complemento: endereco.complemento || undefined,
    bairro: endereco.bairro,
    codigoMunicipio: endereco.codigoMunicipio,
    nomeMunicipio: endereco.nomeMunicipio,
    uf: endereco.uf,
    cep: endereco.cep,
    codigoPais: endereco.codigoPais || undefined,
    nomePais: endereco.nomePais || undefined,
    telefone: endereco.telefone || undefined,
    email: endereco.email || undefined,
  };
}

interface EmpresaRegistro {
  cnpj: string;
  inscricaoMunicipal?: string | null;
  inscricaoEstadual?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  regimeTributario: string;
  optanteSimples: boolean;
  optanteMEI: boolean;
  aliquotaSimples?: unknown;
  endereco: EnderecoRegistro;
}

export function mapEmpresaParaEmitente(empresa: EmpresaRegistro): EmitenteFiscal {
  return {
    cnpj: empresa.cnpj,
    inscricaoMunicipal: empresa.inscricaoMunicipal || '',
    inscricaoEstadual: empresa.inscricaoEstadual || undefined,
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia || undefined,
    regimeTributario: CRT_POR_REGIME[empresa.regimeTributario] ?? 1,
    optanteSimplesNacional: empresa.optanteSimples,
    optanteMEI: empresa.optanteMEI,
    endereco: mapEndereco(empresa.endereco),
    aliquotaSimplesNacional: empresa.aliquotaSimples ? Number(empresa.aliquotaSimples) : undefined,
  };
}

interface ClienteRegistro {
  tipoPessoa: 'PF' | 'PJ' | 'EXTERIOR';
  documento: string;
  inscricaoMunicipal?: string | null;
  inscricaoEstadual?: string | null;
  inscricaoEstadualST?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  endereco: EnderecoRegistro;
  email?: string | null;
  telefone?: string | null;
  indIEDest?: string | null;
}

export function mapClienteParaTomador(cliente: ClienteRegistro): TomadorFiscal {
  return {
    tipoPessoa: cliente.tipoPessoa,
    documento: cliente.documento,
    inscricaoMunicipal: cliente.inscricaoMunicipal || undefined,
    inscricaoEstadual: cliente.inscricaoEstadual || undefined,
    inscricaoEstadualST: cliente.inscricaoEstadualST || undefined,
    nomeRazaoSocial: cliente.razaoSocial,
    nomeFantasia: cliente.nomeFantasia || undefined,
    endereco: mapEndereco(cliente.endereco),
    email: cliente.email || undefined,
    telefone: cliente.telefone || undefined,
    indicadorIEDestinatario: (cliente.indIEDest as '1' | '2' | '9') || '9',
  };
}
