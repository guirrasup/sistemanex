// backend/src/utils/helpers.ts
import { randomBytes } from 'crypto';

export function gerarIdUnico(prefixo: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  return `${prefixo}${timestamp}${random}`;
}

export function formatarDataISO(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toISOString().split('T')[0];
}

export function formatarDataBrasil(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR');
}

export function formatarDataHoraBrasil(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function diferencaDias(data1: Date | string, data2: Date | string): number {
  const d1 = typeof data1 === 'string' ? new Date(data1) : data1;
  const d2 = typeof data2 === 'string' ? new Date(data2) : data2;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isDataValida(data: string): boolean {
  const d = new Date(data);
  return !isNaN(d.getTime());
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomString(tamanho: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < tamanho; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function gerarCodigoVerificacao(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) codigo += '-';
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(texto: string): string {
  return removerAcentos(texto)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(texto: string, maxLength: number = 100, suffix: string = '...'): string {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - suffix.length) + suffix;
}

export function isNumero(valor: unknown): boolean {
  return !isNaN(parseFloat(valor)) && isFinite(valor);
}

export function paraNumero(valor: any, fallback: number = 0): number {
  const num = parseFloat(valor);
  return isNaN(num) ? fallback : num;
}

export function paraString(valor: any, fallback: string = ''): string {
  return valor !== null && valor !== undefined ? String(valor) : fallback;
}

export function paraBooleano(valor: any): boolean {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    return ['true', '1', 'yes', 'sim', 's'].includes(valor.toLowerCase());
  }
  return !!valor;
}

export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function toQueryString(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

export function getAmbiente(): 'development' | 'production' | 'test' {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
}

export function isProducao(): boolean {
  return getAmbiente() === 'production';
}

export function isDesenvolvimento(): boolean {
  return getAmbiente() === 'development';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function dataAtual(): string {
  return new Date().toISOString();
}

export function dataAtualBrasil(): string {
  return formatarDataBrasil(new Date());
}

export function isEmailValido(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function isTelefoneValido(telefone: string): boolean {
  const limpo = telefone.replace(/\D/g, '');
  return limpo.length >= 10 && limpo.length <= 11;
}

export function formatarTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6, 10)}`;
  }
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
  }
  return telefone;
}

export function extrairNumeros(texto: string): string {
  return texto.replace(/\D/g, '');
}

export function mascararDocumento(documento: string): string {
  const limpo = extrairNumeros(documento);
  if (limpo.length === 11) {
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (limpo.length === 14) {
    return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return documento;
}

export function mascararCEP(cep: string): string {
  const limpo = extrairNumeros(cep);
  if (limpo.length === 8) {
    return limpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function uppercaseSemAcentos(texto: string): string {
  return removerAcentos(texto).toUpperCase();
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(obj: any, fallback: string = ''): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
}

export function isPromise(valor: any): boolean {
  return valor && typeof valor.then === 'function';
}

export function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

export function getVersao(): string {
  return process.env.npm_package_version || '1.0.0';
}

export function gerarNomeArquivo(prefixo: string, extensao: string): string {
  const timestamp = Date.now();
  const random = randomString(6);
  return `${prefixo}_${timestamp}_${random}.${extensao}`;
}

export function isJsonString(texto: string): boolean {
  try {
    JSON.parse(texto);
    return true;
  } catch {
    return false;
  }
}

export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export function getUserAgent(req: any): string {
  return req.headers['user-agent'] || 'unknown';
}