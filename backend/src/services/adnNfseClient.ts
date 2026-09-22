// backend/src/services/adnNfseClient.ts
// Integração real com a API REST do Sistema Nacional NFS-e (SEFIN Nacional/ADN):
// envio da DPS (gera a NFS-e), consulta e eventos (cancelamento).
import { postJson, getJson, xmlParaGzipBase64, gzipBase64ParaXml } from './sefinNacionalRestClient.js';
import { obterBaseUrlSefinNacional, type AmbienteAdn } from '../config/nfseAdnEndpoints.js';
import type { CredenciaisMtls } from './sefazSoapClient.js';

export interface ResultadoEnvioDps {
  sucesso: boolean;
  chaveAcesso?: string;
  nfseXml?: string;
  statusHttp: number;
  erro?: string;
  respostaBruta: string;
}

/**
 * POST {base}/nfse — envia a DPS assinada (gzip+base64) e recebe de volta a
 * NFS-e já autorizada pelo Sistema Nacional (também gzip+base64), de forma síncrona.
 */
export async function enviarDps(params: {
  ambiente: AmbienteAdn;
  xmlDpsAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoEnvioDps> {
  const url = `${obterBaseUrlSefinNacional(params.ambiente)}/nfse`;
  const dpsXmlGZipB64 = xmlParaGzipBase64(params.xmlDpsAssinado);

  const resposta = await postJson({
    url,
    body: { dpsXmlGZipB64 },
    mtls: params.mtls,
  });

  if (resposta.statusHttp < 200 || resposta.statusHttp >= 300) {
    const corpo = resposta.corpo as { mensagem?: string; message?: string } | undefined;
    return {
      sucesso: false,
      statusHttp: resposta.statusHttp,
      erro: corpo?.mensagem || corpo?.message || `HTTP ${resposta.statusHttp}`,
      respostaBruta: resposta.bruto,
    };
  }

  const corpo = resposta.corpo as { chaveAcesso?: string; nfseXmlGZipB64?: string } | undefined;
  if (!corpo?.chaveAcesso || !corpo?.nfseXmlGZipB64) {
    return {
      sucesso: false,
      statusHttp: resposta.statusHttp,
      erro: 'Resposta da API não trouxe chaveAcesso/nfseXmlGZipB64',
      respostaBruta: resposta.bruto,
    };
  }

  return {
    sucesso: true,
    chaveAcesso: corpo.chaveAcesso,
    nfseXml: gzipBase64ParaXml(corpo.nfseXmlGZipB64),
    statusHttp: resposta.statusHttp,
    respostaBruta: resposta.bruto,
  };
}

/** GET {base}/nfse/{chaveAcesso} — consulta a NFS-e autorizada. */
export async function consultarNfse(params: {
  ambiente: AmbienteAdn;
  chaveAcesso: string;
  mtls: CredenciaisMtls;
}): Promise<{ encontrada: boolean; nfseXml?: string; statusHttp: number }> {
  const url = `${obterBaseUrlSefinNacional(params.ambiente)}/nfse/${params.chaveAcesso}`;
  const resposta = await getJson({ url, mtls: params.mtls });

  if (resposta.statusHttp !== 200) {
    return { encontrada: false, statusHttp: resposta.statusHttp };
  }

  const corpo = resposta.corpo as { nfseXmlGZipB64?: string } | undefined;
  return {
    encontrada: true,
    nfseXml: corpo?.nfseXmlGZipB64 ? gzipBase64ParaXml(corpo.nfseXmlGZipB64) : undefined,
    statusHttp: resposta.statusHttp,
  };
}

export interface ResultadoEventoNfse {
  sucesso: boolean;
  statusHttp: number;
  erro?: string;
  respostaBruta: string;
}

/**
 * POST {base}/nfse/{chaveAcesso}/eventos — registra um evento (cancelamento etc.).
 * ⚠️ O nome exato do campo JSON do corpo não foi confirmado contra a documentação
 * oficial nesta implementação (usei "eventoXmlGZipB64" por analogia ao endpoint de
 * envio de DPS) — valide contra o ambiente de Produção Restrita antes do uso real.
 */
export async function enviarEventoNfse(params: {
  ambiente: AmbienteAdn;
  chaveAcesso: string;
  xmlEventoAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoEventoNfse> {
  const url = `${obterBaseUrlSefinNacional(params.ambiente)}/nfse/${params.chaveAcesso}/eventos`;
  const eventoXmlGZipB64 = xmlParaGzipBase64(params.xmlEventoAssinado);

  const resposta = await postJson({
    url,
    body: { eventoXmlGZipB64 },
    mtls: params.mtls,
  });

  if (resposta.statusHttp < 200 || resposta.statusHttp >= 300) {
    const corpo = resposta.corpo as { mensagem?: string; message?: string } | undefined;
    return {
      sucesso: false,
      statusHttp: resposta.statusHttp,
      erro: corpo?.mensagem || corpo?.message || `HTTP ${resposta.statusHttp}`,
      respostaBruta: resposta.bruto,
    };
  }

  return { sucesso: true, statusHttp: resposta.statusHttp, respostaBruta: resposta.bruto };
}
