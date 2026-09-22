// backend/src/utils/crypto.ts
// Criptografia simétrica (AES-256-GCM) para segredos em repouso (ex.: certificado digital
// A1 e sua senha). A chave mestra vem de uma variável de ambiente e nunca é gravada no banco.
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITMO = 'aes-256-gcm';
const TAMANHO_IV = 12;
const TAMANHO_TAG = 16;
const VERSAO = 'v1';

function obterChaveMestra(): Buffer {
  const chaveEnv = process.env.CERTIFICADO_ENCRYPTION_KEY;
  if (!chaveEnv) {
    throw new Error(
      'Variável obrigatória ausente: CERTIFICADO_ENCRYPTION_KEY. ' +
      'Gere uma com "openssl rand -hex 32" e configure no .env antes de armazenar certificados digitais.'
    );
  }
  if (/^[0-9a-fA-F]{64}$/.test(chaveEnv)) {
    return Buffer.from(chaveEnv, 'hex');
  }
  // Fallback: deriva uma chave de 32 bytes a partir de qualquer string fornecida
  // (permite valores não-hex, mas o formato hex de 64 caracteres é o recomendado).
  return scryptSync(chaveEnv, 'sup-tecnologia-certificado-salt', 32);
}

export function encryptSecret(plaintext: string): string {
  const chave = obterChaveMestra();
  const iv = randomBytes(TAMANHO_IV);
  const cipher = createCipheriv(ALGORITMO, chave, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${VERSAO}:${Buffer.concat([iv, authTag, ciphertext]).toString('base64')}`;
}

export function decryptSecret(valorArmazenado: string): string {
  const [versao, payloadBase64] = valorArmazenado.split(':');
  if (versao !== VERSAO || !payloadBase64) {
    throw new Error('Formato de segredo criptografado inválido ou não suportado');
  }

  const payload = Buffer.from(payloadBase64, 'base64');
  const iv = payload.subarray(0, TAMANHO_IV);
  const authTag = payload.subarray(TAMANHO_IV, TAMANHO_IV + TAMANHO_TAG);
  const ciphertext = payload.subarray(TAMANHO_IV + TAMANHO_TAG);

  const chave = obterChaveMestra();
  const decipher = createDecipheriv(ALGORITMO, chave, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
