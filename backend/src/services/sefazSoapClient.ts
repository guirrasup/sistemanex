// backend/src/services/sefazSoapClient.ts
// Cliente SOAP de baixo nível para os webservices da SEFAZ (NFe/NFCe/CTe/MDFe).
// A comunicação exige TLS mútuo (mTLS): o certificado A1 da empresa é usado como
// certificado de CLIENTE na conexão HTTPS, além de assinar o XML do documento.
import https from 'https';
import tls from 'tls';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';

export interface CredenciaisMtls {
  cert: string; // certificado em PEM
  key: string; // chave privada em PEM
}

export interface RespostaSefaz {
  statusHttp: number;
  xmlBruto: string;
}

// As AC Raiz da ICP-Brasil não estão no truststore padrão do Node (que usa a
// lista pública da Mozilla) — confirmado em teste real contra a SEFAZ homologação
// (SVRS/DF): o servidor manda seu certificado + a AC intermediária, mas não a raiz,
// e o handshake falha com "unable to get local issuer certificate" sem ela. Em vez
// de `rejectUnauthorized: false` (desativaria a verificação por completo), carregamos
// as raízes oficiais da ICP-Brasil publicadas pelo ITI (https://acraiz.icpbrasil.gov.br)
// como CAs confiáveis adicionais — o Node continua validando a cadeia normalmente.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAMINHO_CAS_ICP_BRASIL = path.join(__dirname, '../config/certs/icp-brasil-raizes.pem');

function carregarCasIcpBrasil(): string[] {
  const conteudo = readFileSync(CAMINHO_CAS_ICP_BRASIL, 'utf8');
  return conteudo
    .split(/(?=-----BEGIN CERTIFICATE-----)/)
    .map((bloco) => bloco.trim())
    .filter(Boolean);
}

// Node substitui (não soma) a lista de CAs confiáveis quando `ca` é informado —
// então incluímos as CAs públicas padrão (tls.rootCertificates) junto das raízes
// ICP-Brasil, para não deixar de confiar nas CAs globalmente conhecidas.
const CAS_CONFIAVEIS = [...tls.rootCertificates, ...carregarCasIcpBrasil()];

/**
 * Envia um envelope SOAP 1.2 para a SEFAZ via HTTPS com autenticação mútua (mTLS)
 * usando o certificado da empresa. A cadeia de certificados do servidor é validada
 * contra as CAs padrão do Node MAIS as raízes ICP-Brasil (CAS_ICP_BRASIL acima) —
 * nunca `rejectUnauthorized: false`.
 */
/**
 * Remove espaços/quebras de linha entre tags XML. Confirmado contra a SEFAZ
 * homologação real: mensagens "bonitas" (indentadas, como os geradores deste
 * projeto produzem para facilitar leitura/depuração) são REJEITADAS com
 * "Rejeicao: Nao eh permitida a presenca de caracteres de edicao no inicio/fim
 * da mensagem ou entre as tags da mensagem" — a SEFAZ exige a mensagem compacta.
 * Seguro do ponto de vista da assinatura XML-DSig: C14N (usado por xml-crypto)
 * já trata espaço em branco entre elementos como insignificante ao calcular o
 * digest, então compactar depois de assinar não invalida a assinatura — só
 * remove espaço que fica ENTRE tags (`>...<`), nunca dentro do conteúdo de texto.
 */
function compactarXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}

export function postSoap(params: {
  url: string;
  soapAction: string;
  envelope: string;
  mtls: CredenciaisMtls;
  timeoutMs?: number;
  // SOAP 1.2 (default) é o que a SEFAZ (NFe/CTe/MDFe) usa: a soapAction vai
  // dentro do Content-Type ("application/soap+xml... action=..."). Webservices
  // ASP.NET .asmx (ex.: NFS-e do DF) são SOAP 1.1: content-type "text/xml" e a
  // soapAction vai num header HTTP "SOAPAction" separado, entre aspas —
  // confirmado contra o WSDL real do webservice (binding soap 1.1).
  versaoSoap?: '1.1' | '1.2';
}): Promise<RespostaSefaz> {
  const { url, soapAction, mtls, timeoutMs = 30000, versaoSoap = '1.2' } = params;
  const envelope = compactarXml(params.envelope);
  const target = new URL(url);
  const headers: Record<string, string | number> =
    versaoSoap === '1.1'
      ? {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: `"${soapAction}"`,
          'Content-Length': Buffer.byteLength(envelope, 'utf8'),
        }
      : {
          'Content-Type': 'application/soap+xml; charset=utf-8; action="' + soapAction + '"',
          'Content-Length': Buffer.byteLength(envelope, 'utf8'),
        };

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: target.hostname,
        port: target.port || 443,
        path: target.pathname + target.search,
        method: 'POST',
        cert: mtls.cert,
        key: mtls.key,
        ca: CAS_CONFIAVEIS,
        headers,
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
