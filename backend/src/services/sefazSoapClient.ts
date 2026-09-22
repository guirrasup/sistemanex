// backend/src/services/sefazSoapClient.ts
// Cliente SOAP de baixo nível para os webservices da SEFAZ (NFe/NFCe/CTe/MDFe).
// A comunicação exige TLS mútuo (mTLS): o certificado A1 da empresa é usado como
// certificado de CLIENTE na conexão HTTPS, além de assinar o XML do documento.
import https from 'https';
import { DOMParser } from '@xmldom/xmldom';

export interface CredenciaisMtls {
  cert: string; // certificado em PEM
  key: string; // chave privada em PEM
}

export interface RespostaSefaz {
  statusHttp: number;
  xmlBruto: string;
}

/**
 * Envia um envelope SOAP 1.2 para a SEFAZ via HTTPS com autenticação mútua (mTLS)
 * usando o certificado da empresa. Não usa `rejectUnauthorized: false` — a cadeia
 * de certificados da SEFAZ deve validar contra as CAs confiáveis do Node; caso o
 * ambiente não tenha a cadeia ICP-Brasil no truststore padrão, será necessário
 * fornecer o bundle de CAs via a opção `ca` (não implementado aqui: normalmente
 * as CAs do ICP-Brasil já são aceitas pelas cadeias públicas usadas pelos servidores
 * da SEFAZ, mas isso deve ser validado no primeiro teste real contra homologação).
 */
export function postSoap(params: {
  url: string;
  soapAction: string;
  envelope: string;
  mtls: CredenciaisMtls;
  timeoutMs?: number;
}): Promise<RespostaSefaz> {
  const { url, soapAction, envelope, mtls, timeoutMs = 30000 } = params;
  const target = new URL(url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: target.hostname,
        port: target.port || 443,
        path: target.pathname + target.search,
        method: 'POST',
        cert: mtls.cert,
        key: mtls.key,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8; action="' + soapAction + '"',
          'Content-Length': Buffer.byteLength(envelope, 'utf8'),
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusHttp: res.statusCode || 0,
            xmlBruto: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Tempo limite excedido ao conectar em ${url}`));
    });
    req.on('error', (err) => reject(err));

    req.write(envelope, 'utf8');
    req.end();
  });
}

/**
 * Extrai o texto de TODAS as ocorrências de uma tag (por local-name, ignorando
 * namespace/prefixo) de um XML, na ordem em que aparecem no documento. Usa DOM em
 * vez de regex para não quebrar com atributos/namespaces variáveis.
 */
export function extrairTags(xml: string, tagName: string): string[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const nodes = doc.getElementsByTagName(tagName);
  if (nodes.length > 0) {
    return Array.from({ length: nodes.length }, (_, i) => nodes[i].textContent || '');
  }

  // Fallback: busca por qualquer elemento cujo nome local bata (caso venha com prefixo)
  const resultados: string[] = [];
  const all = doc.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    const node = all[i];
    const localName = node.localName || node.nodeName.split(':').pop();
    if (localName === tagName) resultados.push(node.textContent || '');
  }
  return resultados;
}

/** Extrai a primeira ocorrência de uma tag. Ver extrairTags() para múltiplas ocorrências. */
export function extrairTag(xml: string, tagName: string): string | undefined {
  return extrairTags(xml, tagName)[0];
}
