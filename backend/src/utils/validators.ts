// C:\emissornfe\backend\src\utils\validators.ts

/**
 * Validações de negócio para o sistema
 * SUP TECNOLOGIA - BACKEND
 */

import { limparDocumento } from './cpfCnpjValidator.js';

/**
 * Valida se um campo é obrigatório
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Valida se um valor é um número positivo
 */
export function isPositiveNumber(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Valida se um valor é um número inteiro positivo
 */
export function isPositiveInteger(value: any): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Valida se um valor está dentro de um intervalo
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida se uma string tem tamanho mínimo
 */
export function hasMinLength(value: string, min: number): boolean {
  return value && value.trim().length >= min;
}

/**
 * Valida se uma string tem tamanho máximo
 */
export function hasMaxLength(value: string, max: number): boolean {
  return !value || value.trim().length <= max;
}

/**
 * Valida se uma string tem tamanho exato
 */
export function hasExactLength(value: string, length: number): boolean {
  return value && value.trim().length === length;
}

/**
 * Valida se o valor é um email válido
 */
export function isEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * Valida se o valor é um telefone válido
 */
export function isPhone(phone: string): boolean {
  const limpo = limparDocumento(phone);
  return limpo.length >= 10 && limpo.length <= 11;
}

/**
 * Valida se o valor é um CPF ou CNPJ válido
 */
export function isValidDocument(document: string): boolean {
  const limpo = limparDocumento(document);
  if (limpo.length === 11) {
    return isValidCPF(limpo);
  }
  if (limpo.length === 14) {
    return isValidCNPJ(limpo);
  }
  return false;
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const limpo = limparDocumento(cpf);
  if (limpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = (resto === 10 || resto === 11) ? 0 : resto;
  if (dv1 !== parseInt(limpo.charAt(9), 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = (resto === 10 || resto === 11) ? 0 : resto;
  return dv2 === parseInt(limpo.charAt(10), 10);
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const limpo = limparDocumento(cnpj);
  if (limpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(limpo)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(limpo.charAt(i), 10) * pesos1[i];
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  if (dv1 !== parseInt(limpo.charAt(12), 10)) return false;

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(limpo.charAt(i), 10) * pesos2[i];
  }
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  return dv2 === parseInt(limpo.charAt(13), 10);
}

/**
 * Valida CEP
 */
export function isValidCEP(cep: string): boolean {
  const limpo = limparDocumento(cep);
  return limpo.length === 8;
}

/**
 * Valida se é uma data válida
 */
export function isValidDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Valida se a data não é futura
 */
export function isNotFutureDate(date: string): boolean {
  const d = new Date(date);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d <= hoje;
}

/**
 * Valida se a data é maior que outra data
 */
export function isDateAfter(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1 > d2;
}

/**
 * Valida se o valor é maior que zero
 */
export function isGreaterThanZero(value: number): boolean {
  return value > 0;
}

/**
 * Valida se o valor está entre 0 e 100 (percentual)
 */
export function isValidPercent(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * Valida se o valor é um código de barras válido
 */
export function isValidBarcode(barcode: string): boolean {
  const limpo = limparDocumento(barcode);
  return limpo.length === 44 || limpo.length === 47 || limpo.length === 48;
}

/**
 * Valida se a chave de acesso da NF-e é válida (44 dígitos)
 */
export function isValidNFeKey(chave: string): boolean {
  const limpo = limparDocumento(chave);
  return limpo.length === 44;
}

/**
 * Valida se a chave de acesso da NFS-e é válida (53 dígitos)
 */
export function isValidNFSeKey(chave: string): boolean {
  const limpo = limparDocumento(chave);
  return limpo.length === 53;
}

/**
 * Valida se o valor é um booleano ou string boolean
 */
export function isValidBoolean(value: any): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
  }
  return false;
}

/**
 * Valida se é uma URL válida
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida se o valor é um UUID
 */
export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/**
 * Valida se o valor está em um array de valores permitidos
 */
export function isInEnum(value: any, allowedValues: any[]): boolean {
  return allowedValues.includes(value);
}

/**
 * Valida se o valor é uma string não vazia
 */
export function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida se o objeto tem todas as propriedades obrigatórias
 */
export function hasRequiredFields(obj: any, requiredFields: string[]): boolean {
  for (const field of requiredFields) {
    if (!obj.hasOwnProperty(field) || obj[field] === undefined || obj[field] === null) {
      return false;
    }
  }
  return true;
}

/**
 * Valida se os campos de um objeto não estão vazios
 */
export function hasNonEmptyFields(obj: any, fields: string[]): boolean {
  for (const field of fields) {
    const value = obj[field];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  }
  return true;
}

/**
 * Valida se um valor é um número inteiro
 */
export function isInteger(value: any): boolean {
  return Number.isInteger(value);
}

/**
 * Valida se um valor é um número
 */
export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Valida se um valor é uma string
 */
export function isString(value: any): boolean {
  return typeof value === 'string';
}

/**
 * Valida se um valor é um array
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * Valida se um valor é um objeto
 */
export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valida se um valor é um número de processo SEI válido
 */
export function isValidSEI(sei: string): boolean {
  const limpo = limparDocumento(sei);
  return limpo.length >= 10 && limpo.length <= 20;
}

/**
 * Valida se um valor é uma chave PIX válida
 */
export function isValidPixKey(key: string): boolean {
  if (!key) return false;
  const limpo = key.trim();
  
  // CPF (11 dígitos)
  if (limparDocumento(limpo).length === 11) return true;
  // CNPJ (14 dígitos)
  if (limparDocumento(limpo).length === 14) return true;
  // Email
  if (isEmail(limpo)) return true;
  // Telefone (com DDD)
  if (isPhone(limpo)) return true;
  // Chave aleatória (UUID)
  if (isValidUUID(limpo)) return true;
  
  return false;
}

/**
 * Valida se um valor é um CNAE válido (7 dígitos)
 */
export function isValidCNAE(cnae: string): boolean {
  const limpo = limparDocumento(cnae);
  return limpo.length === 7;
}

/**
 * Valida se um valor é um NCM válido (8 dígitos)
 */
export function isValidNCM(ncm: string): boolean {
  const limpo = limparDocumento(ncm);
  return limpo.length === 8;
}

/**
 * Valida se um valor é um CFOP válido (4 dígitos)
 */
export function isValidCFOP(cfop: string): boolean {
  const limpo = limparDocumento(cfop);
  return limpo.length === 4;
}

/**
 * Valida se um valor é um CST ICMS válido
 */
export function isValidCSTICMS(cst: string): boolean {
  const validos = ['00', '10', '20', '30', '40', '41', '50', '51', '60', '70', '90'];
  return validos.includes(cst);
}

/**
 * Valida se um valor é um CSOSN válido
 */
export function isValidCSOSN(csosn: string): boolean {
  const validos = ['101', '102', '103', '201', '202', '203', '300', '400', '500', '900'];
  return validos.includes(csosn);
}

/**
 * Valida se um valor é uma alíquota válida (0-100)
 */
export function isValidAliquota(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * Valida se um valor é um regime tributário válido
 */
export function isValidRegimeTributario(value: number): boolean {
  return [1, 2, 3].includes(value);
}

/**
 * Valida se um valor é um ambiente válido (1=Produção, 2=Homologação)
 */
export function isValidAmbiente(value: number): boolean {
  return [1, 2].includes(value);
}

/**
 * Valida se um valor é um tipo de documento fiscal válido
 */
export function isValidTipoDocumento(tipo: string): boolean {
  const validos = ['NFSE', 'NFE', 'NFCE', 'CTE', 'NFAE'];
  return validos.includes(tipo);
}

/**
 * Valida se um valor é um status de documento válido
 */
export function isValidStatusDocumento(status: string): boolean {
  const validos = ['AUTORIZADA', 'CANCELADA', 'SUBSTITUIDA', 'PROCESSANDO', 'REJEITADA'];
  return validos.includes(status);
}

/**
 * Valida se um valor é um status de título válido
 */
export function isValidStatusTitulo(status: string): boolean {
  const validos = ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'];
  return validos.includes(status);
}

/**
 * Valida se um valor é um tipo de título válido
 */
export function isValidTipoTitulo(tipo: string): boolean {
  const validos = ['RECEBER', 'PAGAR'];
  return validos.includes(tipo);
}