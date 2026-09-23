// backend/src/utils/empresaMappers.ts
// Conversão entre a convenção numérica usada pelo frontend/documentos fiscais
// (RegimeTributario 1|2|3, TipoAmbiente 1|2 — ver src/types/fiscal.d.ts) e os
// enums de string usados pelo schema Prisma (RegimeTributario/TipoAmbiente).
import type { Empresa, Endereco, CertificadoDigital, Prisma } from '@prisma/client';

export const REGIME_TRIBUTARIO_PARA_NUMERO: Record<string, 1 | 2 | 3> = {
  SIMPLES_NACIONAL: 1,
  SIMPLES_EXCESSO: 2,
  NORMAL: 3,
};

const REGIME_TRIBUTARIO_PARA_ENUM: Record<number, 'SIMPLES_NACIONAL' | 'SIMPLES_EXCESSO' | 'NORMAL'> = {
  1: 'SIMPLES_NACIONAL',
  2: 'SIMPLES_EXCESSO',
  3: 'NORMAL',
};

export const AMBIENTE_PARA_NUMERO: Record<string, 1 | 2> = {
  PRODUCAO: 1,
  HOMOLOGACAO: 2,
};

const AMBIENTE_PARA_ENUM: Record<number, 'PRODUCAO' | 'HOMOLOGACAO'> = {
  1: 'PRODUCAO',
  2: 'HOMOLOGACAO',
};

type EmpresaComRelacoes = Empresa & { endereco: Endereco | null; certificado: CertificadoDigital | null };

/**
 * Monta a resposta da API a partir do registro do Prisma, na convenção numérica
 * que o frontend já usa (ConfiguracaoEmpresa) — e nunca inclui os campos
 * criptografados do certificado (arquivoBase64/senha), mesmo que o repositório
 * os tenha carregado.
 */
export function mapEmpresaParaResposta(empresa: EmpresaComRelacoes) {
  return {
    id: empresa.id,
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia || '',
    cnpj: empresa.cnpj,
    inscricaoEstadual: empresa.inscricaoEstadual || '',
    inscricaoMunicipal: empresa.inscricaoMunicipal || '',
    cnae: empresa.cnae || '',
    regimeTributario: REGIME_TRIBUTARIO_PARA_NUMERO[empresa.regimeTributario] ?? 1,
    aliquotaSimplesNacional: empresa.aliquotaSimples ? Number(empresa.aliquotaSimples) : 6,
    ambienteEmissao: AMBIENTE_PARA_NUMERO[empresa.ambienteEmissao] ?? 2,
    serieNfe: empresa.serieNfe,
    proximoNumeroNfe: empresa.proximoNumeroNfe,
    serieNfse: empresa.serieNfse,
    proximoNumeroNfse: empresa.proximoNumeroNfse,
    serieNfce: empresa.serieNfce,
    proximoNumeroNfce: empresa.proximoNumeroNfce,
    serieCte: empresa.serieCte,
    proximoNumeroCte: empresa.proximoNumeroCte,
    serieNfae: empresa.serieNfae,
    proximoNumeroNfae: empresa.proximoNumeroNfae,
    chavePixPadrao: empresa.chavePixPadrao || '',
    bancoPadrao: empresa.bancoPadrao || '',
    endereco: empresa.endereco
      ? {
          logradouro: empresa.endereco.logradouro,
          numero: empresa.endereco.numero,
          complemento: empresa.endereco.complemento || '',
          bairro: empresa.endereco.bairro,
          codigoMunicipio: empresa.endereco.codigoMunicipio,
          nomeMunicipio: empresa.endereco.nomeMunicipio,
          uf: empresa.endereco.uf,
          cep: empresa.endereco.cep,
          telefone: empresa.endereco.telefone || '',
          email: empresa.endereco.email || '',
        }
      : undefined,
    certificado: empresa.certificado
      ? {
          instalado: true,
          tipo: empresa.certificado.tipo,
          nomeTitular: empresa.certificado.nomeTitular,
          cnpjCpf: empresa.certificado.cnpjCpf,
          emissora: empresa.certificado.emissora,
          dataValidadeInicio: empresa.certificado.dataValidadeInicio,
          dataValidadeFim: empresa.certificado.dataValidadeFim,
          diasRestantes: empresa.certificado.diasRestantes,
          arquivoCarregadoNome: empresa.certificado.arquivoCarregadoNome || '',
          status: empresa.certificado.status,
        }
      : {
          instalado: false,
          tipo: 'A1',
          nomeTitular: '',
          cnpjCpf: '',
          emissora: '',
          dataValidadeInicio: '',
          dataValidadeFim: '',
          diasRestantes: 0,
          arquivoCarregadoNome: '',
          status: 'NAO_CONFIGURADO',
        },
  };
}

export interface AtualizarEmpresaInput {
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnae?: string;
  regimeTributario?: 1 | 2 | 3;
  aliquotaSimplesNacional?: number;
  ambienteEmissao?: 1 | 2;
  serieNfe?: number;
  proximoNumeroNfe?: number;
  serieNfse?: number;
  proximoNumeroNfse?: number;
  serieNfce?: number;
  proximoNumeroNfce?: number;
  serieCte?: number;
  proximoNumeroCte?: number;
  serieNfae?: number;
  proximoNumeroNfae?: number;
  chavePixPadrao?: string;
  bancoPadrao?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    codigoMunicipio?: string;
    nomeMunicipio?: string;
    uf?: string;
    cep?: string;
    telefone?: string;
    email?: string;
  };
}

/**
 * Lista explícita (whitelist) dos campos que o cliente pode atualizar via
 * PUT /api/empresa/me — nunca um spread bruto do req.body, para não permitir
 * mass assignment de campos sensíveis (cnpj, certificadoId, numeração de outra
 * empresa, etc.).
 */
export function mapAtualizacaoParaEmpresa(input: AtualizarEmpresaInput): Prisma.EmpresaUpdateInput {
  const data: Prisma.EmpresaUpdateInput = {};

  if (input.razaoSocial !== undefined) data.razaoSocial = input.razaoSocial;
  if (input.nomeFantasia !== undefined) data.nomeFantasia = input.nomeFantasia;
  if (input.inscricaoEstadual !== undefined) data.inscricaoEstadual = input.inscricaoEstadual;
  if (input.inscricaoMunicipal !== undefined) data.inscricaoMunicipal = input.inscricaoMunicipal;
  if (input.cnae !== undefined) data.cnae = input.cnae;
  if (input.regimeTributario !== undefined) data.regimeTributario = REGIME_TRIBUTARIO_PARA_ENUM[input.regimeTributario] ?? 'SIMPLES_NACIONAL';
  if (input.aliquotaSimplesNacional !== undefined) data.aliquotaSimples = input.aliquotaSimplesNacional;
  if (input.ambienteEmissao !== undefined) data.ambienteEmissao = AMBIENTE_PARA_ENUM[input.ambienteEmissao] ?? 'HOMOLOGACAO';
  if (input.serieNfe !== undefined) data.serieNfe = input.serieNfe;
  if (input.proximoNumeroNfe !== undefined) data.proximoNumeroNfe = input.proximoNumeroNfe;
  if (input.serieNfse !== undefined) data.serieNfse = input.serieNfse;
  if (input.proximoNumeroNfse !== undefined) data.proximoNumeroNfse = input.proximoNumeroNfse;
  if (input.serieNfce !== undefined) data.serieNfce = input.serieNfce;
  if (input.proximoNumeroNfce !== undefined) data.proximoNumeroNfce = input.proximoNumeroNfce;
  if (input.serieCte !== undefined) data.serieCte = input.serieCte;
  if (input.proximoNumeroCte !== undefined) data.proximoNumeroCte = input.proximoNumeroCte;
  if (input.serieNfae !== undefined) data.serieNfae = input.serieNfae;
  if (input.proximoNumeroNfae !== undefined) data.proximoNumeroNfae = input.proximoNumeroNfae;
  if (input.chavePixPadrao !== undefined) data.chavePixPadrao = input.chavePixPadrao;
  if (input.bancoPadrao !== undefined) data.bancoPadrao = input.bancoPadrao;

  if (input.endereco) {
    const enderecoUpdate: Prisma.EnderecoUpdateWithoutEmpresaInput = {};
    const e = input.endereco;
    if (e.logradouro !== undefined) enderecoUpdate.logradouro = e.logradouro;
    if (e.numero !== undefined) enderecoUpdate.numero = e.numero;
    if (e.complemento !== undefined) enderecoUpdate.complemento = e.complemento;
    if (e.bairro !== undefined) enderecoUpdate.bairro = e.bairro;
    if (e.codigoMunicipio !== undefined) enderecoUpdate.codigoMunicipio = e.codigoMunicipio;
    if (e.nomeMunicipio !== undefined) enderecoUpdate.nomeMunicipio = e.nomeMunicipio;
    if (e.uf !== undefined) enderecoUpdate.uf = e.uf;
    if (e.cep !== undefined) enderecoUpdate.cep = e.cep;
    if (e.telefone !== undefined) enderecoUpdate.telefone = e.telefone;
    if (e.email !== undefined) enderecoUpdate.email = e.email;

    if (Object.keys(enderecoUpdate).length > 0) {
      data.endereco = { update: enderecoUpdate };
    }

    // O schema também guarda uf/codigoUF/codigoMunicipio/nomeMunicipio direto em
    // Empresa (campos "operacionais", usados por nfe/nfce/cte/mdfe.service.ts para
    // roteamento SEFAZ e geração da chave de acesso — ver empresa.codigoUF/empresa.uf
    // em nfeSefazClient.ts), separados do relacionamento Endereco (usado só para o
    // bloco de endereço do XML). Espelhamos aqui para não deixá-los divergir: um
    // endereço salvo só no Endereco mas não no Empresa faria a nota ser roteada para
    // a UF errada na SEFAZ.
    if (e.uf !== undefined) data.uf = e.uf;
    if (e.codigoMunicipio !== undefined) {
      data.codigoMunicipio = e.codigoMunicipio;
      data.codigoUF = e.codigoMunicipio.slice(0, 2);
    }
    if (e.nomeMunicipio !== undefined) data.nomeMunicipio = e.nomeMunicipio;
  }

  return data;
}
