// backend/src/utils/validators.ts
import { limparDocumento, isCnpj, validarCPF, validarCNPJ, validarCpfOuCnpj } from './cpfCnpjValidator.js';
import { isChaveAcesso44, limparChaveAcesso } from './chaveAcesso.js';

export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

export function isPositiveNumber(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

export function isPositiveInteger(value: any): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function hasMinLength(value: string, min: number): boolean {
  return Boolean(value) && value.trim().length >= min;
}

export function hasMaxLength(value: string, max: number): boolean {
  return !value || value.trim().length <= max;
}

export function hasExactLength(value: string, length: number): boolean {
  return Boolean(value) && value.trim().length === length;
}

export function isEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function isPhone(phone: string): boolean {
  const limpo = limparDocumento(phone);
  return limpo.length >= 10 && limpo.length <= 11;
}

// Delegam para cpfCnpjValidator, que aceita o CNPJ alfanumérico.
export function isValidDocument(document: string): boolean {
  return validarCpfOuCnpj(document).valido;
}

export function isValidCPF(cpf: string): boolean {
  return validarCPF(cpf);
}

export function isValidCNPJ(cnpj: string): boolean {
  return validarCNPJ(cnpj);
}

export function isValidCEP(cep: string): boolean {
  const limpo = limparDocumento(cep);
  return limpo.length === 8;
}

export function isValidDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function isNotFutureDate(date: string): boolean {
  const d = new Date(date);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d <= hoje;
}

export function isDateAfter(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1 > d2;
}

export function isGreaterThanZero(value: number): boolean {
  return value > 0;
}

export function isValidPercent(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function isValidBarcode(barcode: string): boolean {
  const limpo = limparDocumento(barcode);
  return limpo.length === 44 || limpo.length === 47 || limpo.length === 48;
}

export function isValidNFeKey(chave: string): boolean {
  return isChaveAcesso44(limparChaveAcesso(chave));
}

export function isValidNFSeKey(chave: string): boolean {
  const limpo = limparDocumento(chave);
  return limpo.length === 53;
}

export function isValidBoolean(value: any): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
  }
  return false;
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export function isInEnum(value: any, allowedValues: any[]): boolean {
  return allowedValues.includes(value);
}

export function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasRequiredFields(obj: any, requiredFields: string[]): boolean {
  for (const field of requiredFields) {
    if (!obj.hasOwnProperty(field) || obj[field] === undefined || obj[field] === null) {
      return false;
    }
  }
  return true;
}

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

export function isInteger(value: any): boolean {
  return Number.isInteger(value);
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function isString(value: any): boolean {
  return typeof value === 'string';
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidSEI(sei: string): boolean {
  const limpo = limparDocumento(sei);
  return limpo.length >= 10 && limpo.length <= 20;
}

export function isValidPixKey(key: string): boolean {
  if (!key) return false;
  const limpo = key.trim();
  
  // CPF (11 dígitos)
  if (limparDocumento(limpo).length === 11) return true;
  // CNPJ (numérico ou alfanumérico)
  if (isCnpj(limpo)) return true;
  // Email
  if (isEmail(limpo)) return true;
  // Telefone (com DDD)
  if (isPhone(limpo)) return true;
  // Chave aleatória (UUID)
  if (isValidUUID(limpo)) return true;
  
  return false;
}

export function isValidCNAE(cnae: string): boolean {
  const limpo = limparDocumento(cnae);
  return limpo.length === 7;
}

export function isValidNCM(ncm: string): boolean {
  const limpo = limparDocumento(ncm);
  return limpo.length === 8;
}

export function isValidCFOP(cfop: string): boolean {
  const limpo = limparDocumento(cfop);
  return limpo.length === 4;
}

export function isValidCSTICMS(cst: string): boolean {
  const validos = ['00', '10', '20', '30', '40', '41', '50', '51', '60', '70', '90'];
  return validos.includes(cst);
}

export function isValidCSOSN(csosn: string): boolean {
  const validos = ['101', '102', '103', '201', '202', '203', '300', '400', '500', '900'];
  return validos.includes(csosn);
}

export function isValidAliquota(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function isValidRegimeTributario(value: number): boolean {
  return [1, 2, 3].includes(value);
}

export function isValidAmbiente(value: number): boolean {
  return [1, 2].includes(value);
}

export function isValidTipoDocumento(tipo: string): boolean {
  const validos = ['NFSE', 'NFE', 'NFCE', 'CTE', 'NFAE'];
  return validos.includes(tipo);
}

export function isValidStatusDocumento(status: string): boolean {
  const validos = ['AUTORIZADA', 'CANCELADA', 'SUBSTITUIDA', 'PROCESSANDO', 'REJEITADA'];
  return validos.includes(status);
}

export function isValidStatusTitulo(status: string): boolean {
  const validos = ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'];
  return validos.includes(status);
}

export function isValidTipoTitulo(tipo: string): boolean {
  const validos = ['RECEBER', 'PAGAR'];
  return validos.includes(tipo);
}