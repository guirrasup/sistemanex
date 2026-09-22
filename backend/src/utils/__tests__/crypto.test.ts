// backend/src/utils/__tests__/crypto.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptSecret, decryptSecret } from '../crypto.js';

const CHAVE_HEX_VALIDA = 'a'.repeat(64);
const chaveOriginal = process.env.CERTIFICADO_ENCRYPTION_KEY;

beforeEach(() => {
  process.env.CERTIFICADO_ENCRYPTION_KEY = CHAVE_HEX_VALIDA;
});

afterEach(() => {
  if (chaveOriginal === undefined) delete process.env.CERTIFICADO_ENCRYPTION_KEY;
  else process.env.CERTIFICADO_ENCRYPTION_KEY = chaveOriginal;
});

describe('encryptSecret / decryptSecret', () => {
  it('faz round-trip: decryptSecret(encryptSecret(x)) === x', () => {
    const original = 'senha-super-secreta-do-certificado-A1';
    const criptografado = encryptSecret(original);
    expect(decryptSecret(criptografado)).toBe(original);
  });

  it('o valor criptografado tem o prefixo de versão "v1:" e não contém o texto original', () => {
    const original = 'valor-que-nao-deve-aparecer-em-claro';
    const criptografado = encryptSecret(original);
    expect(criptografado.startsWith('v1:')).toBe(true);
    expect(criptografado).not.toContain(original);
  });

  it('duas criptografias do mesmo texto produzem saídas diferentes (IV aleatório)', () => {
    const original = 'mesmo-texto-duas-vezes';
    const c1 = encryptSecret(original);
    const c2 = encryptSecret(original);
    expect(c1).not.toBe(c2);
    expect(decryptSecret(c1)).toBe(original);
    expect(decryptSecret(c2)).toBe(original);
  });

  it('lança erro quando CERTIFICADO_ENCRYPTION_KEY não está definida', () => {
    delete process.env.CERTIFICADO_ENCRYPTION_KEY;
    expect(() => encryptSecret('qualquer coisa')).toThrow(/CERTIFICADO_ENCRYPTION_KEY/);
  });

  it('decryptSecret falha ao usar uma chave mestra diferente da usada para criptografar', () => {
    const criptografado = encryptSecret('segredo-original');

    process.env.CERTIFICADO_ENCRYPTION_KEY = 'b'.repeat(64);
    expect(() => decryptSecret(criptografado)).toThrow();
  });

  it('decryptSecret falha (authTag) se o payload criptografado for adulterado', () => {
    const criptografado = encryptSecret('segredo-integro');
    const [versao, payloadBase64] = criptografado.split(':');
    const payload = Buffer.from(payloadBase64, 'base64');
    payload[payload.length - 1] ^= 0xff; // adultera o último byte do ciphertext
    const adulterado = `${versao}:${payload.toString('base64')}`;

    expect(() => decryptSecret(adulterado)).toThrow();
  });

  it('decryptSecret lança erro para formato de versão desconhecido ou ausente', () => {
    expect(() => decryptSecret('v2:qualquer-coisa')).toThrow(/formato/i);
    expect(() => decryptSecret('valor-sem-prefixo-de-versao')).toThrow(/formato/i);
  });

  it('aceita uma chave mestra não-hex via derivação (scrypt) como alternativa à chave hex de 64 chars', () => {
    process.env.CERTIFICADO_ENCRYPTION_KEY = 'uma-senha-qualquer-nao-hexadecimal';
    const original = 'segredo-com-chave-derivada';
    const criptografado = encryptSecret(original);
    expect(decryptSecret(criptografado)).toBe(original);
  });
});
