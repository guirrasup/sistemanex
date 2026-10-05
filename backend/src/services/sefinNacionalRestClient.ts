// backend/src/services/sefinNacionalRestClient.ts
// Cliente REST de baixo nível para a API SefinNacional (NFS-e Nacional / ADN).
// Assim como as SOAP das SEFAZ estaduais, essa API usa mTLS: o certificado A1 da
// empresa autentica a própria conexão HTTPS (não há OAuth/token separado).
import https from 'https';
import { gzipSync, gunzipSync } from 'zlib';
import type { CredenciaisMtls } from './sefazSoapClient.js';

export interface RespostaSefinNacional {
  statusHttp: number;
  corpo: unknown;
  bruto: string;
}

function request(params: {
  method: 'GET' | 'POST';
  url: string;
  body?: unknown;
  mtls: CredenciaisMtls;
  timeoutMs?: number;
}): Promise<RespostaSefinNacional> {
  const { method, url, body, mtls, timeoutMs = 30000 } = params;
  const target = new URL(url);
  const payload = body !== undefined ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: target.hostname,
        port: target.port || 443,
        path: target.pathname + target.search,
        method,
        cert: mtls.cert,
        key: mtls.key,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload, 'utf8') } : {}),
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const bruto = Buffer.concat(chunks).toString('utf8');
          let corpo: unknown = undefined;
          try {
            corpo = bruto ? JSON.parse(bruto) : undefined;
          } catch {
            corpo = undefined;
          }
          resolve({ statusHttp: res.statusCode || 0, corpo, bruto });
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error(`Tempo limite excedido ao conectar em ${url}`)));
    req.on('error', (err) => reject(err));

    if (payload) req.write(payload, 'utf8');
    req.end();
  });
}

export function postJson(params: { url: string; body: unknown; mtls: CredenciaisMtls }): Promise<RespostaSefinNacional> {
  return request({ method: 'POST', url: params.url, body: params.body, mtls: params.mtls });
}

export function getJson(params: { url: string; mtls: CredenciaisMtls }): Promise<RespostaSefinNacional> {
  return request({ method: 'GET', url: params.url, mtls: params.mtls });
}

/** Compacta (gzip) e codifica em base64 — formato exigido pela API para os XMLs. */
export function xmlParaGzipBase64(xml: string): string {
  return gzipSync(Buffer.from(xml, 'utf8')).toString('base64');
}

/** Decodifica base64 e descompacta (gzip) — para ler XMLs devolvidos pela API. */
export function gzipBase64ParaXml(gzipB64: string): string {
  return gunzipSync(Buffer.from(gzipB64, 'base64')).toString('utf8');
}
