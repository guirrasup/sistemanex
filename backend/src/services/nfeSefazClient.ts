// backend/src/services/nfeSefazClient.ts
// Integração real com os webservices SOAP da SEFAZ para NF-e (modelo 55) e
// NFC-e (modelo 65), layout 4.00: consulta de status, autorização (envio),
// consulta de recibo (retorno assíncrono) e recepção de eventos (cancelamento,
// carta de correção).
import { postSoap, extrairTag, extrairTags, type CredenciaisMtls } from './sefazSoapClient.js';
import { obterEnderecosNfe, obterEnderecosNfce, type AmbienteSefaz, type EnderecosServicoUf } from '../config/sefazEndpoints.js';

/** NFe = modelo 55, NFC-e = modelo 65 — cada uma tem sua própria tabela de UFs/autorizadores. */
function resolverEnderecos(modelo: '55' | '65', uf: string, ambiente: AmbienteSefaz): EnderecosServicoUf {
  return modelo === '65' ? obterEnderecosNfce(uf, ambiente) : obterEnderecosNfe(uf, ambiente);
}

const NS_NFE = 'http://www.portalfiscal.inf.br/nfe';
const XMLNS_SOAP12 = 'http://www.w3.org/2003/05/soap-envelope';

function envelope(nsWsdl: string, corpo: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="${XMLNS_SOAP12}">
  <soap12:Body>
    <nfeDadosMsg xmlns="${nsWsdl}">${corpo}</nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;
}

export interface ResultadoStatusServico {
  cStat?: string;
  xMotivo?: string;
  online: boolean;
}

export interface ResultadoAutorizacao {
  cStat?: string;
  xMotivo?: string;
  /** Presente quando o envio foi síncrono e já retornou o protocolo (indSinc=1). */
  nProt?: string;
  /** Presente quando o envio foi assíncrono (lote) — usar para consultar depois. */
  nRec?: string;
  autorizado: boolean;
  xmlRetorno: string;
}

export interface ResultadoEvento {
  cStat?: string;
  xMotivo?: string;
  nProt?: string;
  sucesso: boolean;
  xmlRetorno: string;
}

/**
 * NfeStatusServico4 — verifica se o autorizador da UF está online.
 * Não exige o XML de nenhum documento; útil como teste de conectividade/mTLS.
 */
export async function consultarStatusServico(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  cUF: string;
  mtls: CredenciaisMtls;
  modelo?: '55' | '65';
}): Promise<ResultadoStatusServico> {
  const enderecos = resolverEnderecos(params.modelo || '55', params.uf, params.ambiente);
  const tpAmb = params.ambiente === 'producao' ? '1' : '2';

  const corpo = `<consStatServ versao="4.00" xmlns="${NS_NFE}">
      <tpAmb>${tpAmb}</tpAmb>
      <cUF>${params.cUF}</cUF>
      <xServ>STATUS</xServ>
    </consStatServ>`;

  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4', corpo);

  const resposta = await postSoap({
    url: enderecos.statusServico,
    soapAction: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const cStat = extrairTag(resposta.xmlBruto, 'cStat');
  const xMotivo = extrairTag(resposta.xmlBruto, 'xMotivo');

  return { cStat, xMotivo, online: cStat === '107' };
}

/**
 * NFeAutorizacao4 — envia o XML assinado da NF-e/NFC-e para autorização.
 * Usa envio síncrono (indSinc=1): a SEFAZ tenta responder na mesma chamada com o
 * protocolo de autorização (cStat 100) ou rejeição, sem precisar de uma segunda
 * consulta via NFeRetAutorizacao4 (que continua disponível para o caso da SEFAZ
 * cair para processamento em lote, cStat 103/105).
 */
export async function autorizarNfe(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  cUF: string;
  xmlAssinado: string;
  mtls: CredenciaisMtls;
  modelo?: '55' | '65';
}): Promise<ResultadoAutorizacao> {
  const enderecos = resolverEnderecos(params.modelo || '55', params.uf, params.ambiente);
  const idLote = Date.now().toString().slice(-15);

  const corpo = `<enviNFe versao="4.00" xmlns="${NS_NFE}">
      <idLote>${idLote}</idLote>
      <indSinc>1</indSinc>
      ${params.xmlAssinado.replace(/^<\?xml[^>]*\?>/, '')}
    </enviNFe>`;

  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4', corpo);

  const resposta = await postSoap({
    url: enderecos.autorizacao,
    soapAction: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  // <cStat> aparece na ordem do documento: primeiro o do lote (retEnviNFe) — só
  // confirma que o LOTE foi processado (cStat 104 "Lote processado" mesmo numa
  // rejeição!) — e, quando o processamento síncrono chega a avaliar o documento,
  // um segundo dentro de protNFe > infProt com o resultado real (autorizado OU
  // rejeitado). Usar `nProt` para decidir qual pegar é o bug: nProt só existe
  // quando autorizado, então toda rejeição caía de volta no cStat do lote,
  // escondendo o motivo real da rejeição. Confirmado com uma rejeição real da
  // SEFAZ: cStat 104/"Lote processado" (lote) + cStat 297/"Assinatura difere do
  // calculado" (infProt) — o segundo é sempre o que importa quando presente.
  const cStats = extrairTags(resposta.xmlBruto, 'cStat');
  const nProt = extrairTag(resposta.xmlBruto, 'nProt');
  const nRec = extrairTag(resposta.xmlBruto, 'nRec');
  const cStatRelevante = cStats.length > 1 ? cStats[1] : cStats[0];
  const xMotivos = extrairTags(resposta.xmlBruto, 'xMotivo');
  const xMotivoRelevante = cStats.length > 1 ? xMotivos[1] : xMotivos[0];

  return {
    cStat: cStatRelevante,
    xMotivo: xMotivoRelevante,
    nProt,
    nRec,
    autorizado: cStatRelevante === '100',
    xmlRetorno: resposta.xmlBruto,
  };
}

/**
 * NFeRetAutorizacao4 — consulta o resultado de um lote enviado de forma assíncrona
 * (quando autorizarNfe() retornou nRec em vez de nProt).
 */
export async function consultarRecibo(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  nRec: string;
  mtls: CredenciaisMtls;
  modelo?: '55' | '65';
}): Promise<ResultadoAutorizacao> {
  const enderecos = resolverEnderecos(params.modelo || '55', params.uf, params.ambiente);
  const tpAmb = params.ambiente === 'producao' ? '1' : '2';

  const corpo = `<consReciNFe versao="4.00" xmlns="${NS_NFE}">
      <tpAmb>${tpAmb}</tpAmb>
      <nRec>${params.nRec}</nRec>
    </consReciNFe>`;

  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4', corpo);

  const resposta = await postSoap({
    url: enderecos.retAutorizacao,
    soapAction: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4/nfeRetAutorizacaoLote',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  // Mesma ressalva de autorizarNfe(): quando o protNFe/infProt está presente, o
  // segundo cStat/xMotivo é o resultado real do documento — o primeiro é só do lote.
  const cStats = extrairTags(resposta.xmlBruto, 'cStat');
  const xMotivos = extrairTags(resposta.xmlBruto, 'xMotivo');
  const nProt = extrairTag(resposta.xmlBruto, 'nProt');
  const cStat = cStats.length > 1 ? cStats[1] : cStats[0];
  const xMotivo = cStats.length > 1 ? xMotivos[1] : xMotivos[0];

  return {
    cStat,
    xMotivo,
    nProt,
    autorizado: cStat === '100',
    xmlRetorno: resposta.xmlBruto,
  };
}

/**
 * RecepcaoEvento4 — envia um evento assinado (cancelamento 110111, carta de
 * correção 110110, etc.) já pronto (envEvento assinado via assinarXmlEnvelopado
 * com elementoAssinado="infEvento").
 */
export async function enviarEvento(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  xmlEventoAssinado: string;
  mtls: CredenciaisMtls;
  modelo?: '55' | '65';
}): Promise<ResultadoEvento> {
  const enderecos = resolverEnderecos(params.modelo || '55', params.uf, params.ambiente);

  const corpo = params.xmlEventoAssinado.replace(/^<\?xml[^>]*\?>/, '');
  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/nfe/wsdl/RecepcaoEvento4', corpo);

  const resposta = await postSoap({
    url: enderecos.recepcaoEvento,
    soapAction: 'http://www.portalfiscal.inf.br/nfe/wsdl/RecepcaoEvento4/nfeRecepcaoEvento',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const cStat = extrairTag(resposta.xmlBruto, 'cStat');
  const nProt = extrairTag(resposta.xmlBruto, 'nProt');
  const xMotivo = extrairTag(resposta.xmlBruto, 'xMotivo');

  // 135/136 = evento registrado e vinculado (cancelamento/CC-e aceitos)
  return {
    cStat,
    xMotivo,
    nProt,
    sucesso: cStat === '135' || cStat === '136',
    xmlRetorno: resposta.xmlBruto,
  };
}

export interface ResultadoInutilizacao {
  cStat?: string;
  xMotivo?: string;
  nProt?: string;
  sucesso: boolean;
  xmlRetorno: string;
}

/**
 * NFeInutilizacao4 — inutiliza uma faixa de numeração de NF-e/NFC-e que nunca
 * chegou a ser transmitida (pulo de numeração, erro de sequência). Diferente de
 * autorizarNfe/enviarEvento, o corpo é o próprio <inutNFe> assinado
 * (elementoAssinado="infInut" em assinarXmlEnvelopado), sem envelope envEvento.
 */
export async function inutilizarNfe(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  xmlInutilizacaoAssinado: string;
  mtls: CredenciaisMtls;
  modelo?: '55' | '65';
}): Promise<ResultadoInutilizacao> {
  const enderecos = resolverEnderecos(params.modelo || '55', params.uf, params.ambiente);

  const corpo = params.xmlInutilizacaoAssinado.replace(/^<\?xml[^>]*\?>/, '');
  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/nfe/wsdl/NFeInutilizacao4', corpo);

  const resposta = await postSoap({
    url: enderecos.inutilizacao,
    soapAction: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeInutilizacao4/nfeInutilizacaoNF',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const cStat = extrairTag(resposta.xmlBruto, 'cStat');
  const nProt = extrairTag(resposta.xmlBruto, 'nProt');
  const xMotivo = extrairTag(resposta.xmlBruto, 'xMotivo');

  // 102 = Inutilização de número homologada
  return {
    cStat,
    xMotivo,
    nProt,
    sucesso: cStat === '102',
    xmlRetorno: resposta.xmlBruto,
  };
}
