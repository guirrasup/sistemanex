// backend/src/services/cteSefazClient.ts
// Integração real com os webservices SOAP da SEFAZ para CT-e (modelo 57), layout 4.00.
//
// Diferença importante em relação à NFe: o CT-e usa recepção SÍNCRONA
// (CTeRecepcaoSincV4) — a resposta já traz o protocolo de autorização (ou rejeição)
// na mesma chamada, sem o ciclo de lote assíncrono + NFeRetAutorizacao4 da NFe.
import { gzipSync } from 'zlib';
import { postSoap, extrairTag, extrairTags, type CredenciaisMtls } from './sefazSoapClient.js';
import { obterEnderecosCte, type AmbienteSefaz } from '../config/cteEndpoints.js';

const NS_CTE = 'http://www.portalfiscal.inf.br/cte';
const XMLNS_SOAP12 = 'http://www.w3.org/2003/05/soap-envelope';

function envelope(nsWsdl: string, corpo: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="${XMLNS_SOAP12}">
  <soap12:Body>
    <cteDadosMsg xmlns="${nsWsdl}">${corpo}</cteDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;
}

export interface ResultadoStatusServicoCte {
  cStat?: string;
  xMotivo?: string;
  online: boolean;
}

export interface ResultadoAutorizacaoCte {
  cStat?: string;
  xMotivo?: string;
  nProt?: string;
  autorizado: boolean;
  xmlRetorno: string;
}

export interface ResultadoEventoCte {
  cStat?: string;
  xMotivo?: string;
  nProt?: string;
  sucesso: boolean;
  xmlRetorno: string;
}

/**
 * Extrai o cStat mais relevante de uma resposta síncrona: quando há mais de uma
 * ocorrência de <cStat> no XML (nível do lote/envelope + nível do protocolo), a
 * última é sempre a mais interna/específica — a que realmente diz se o documento
 * foi autorizado. Com apenas uma ocorrência, essa é a única disponível de qualquer forma.
 */
function cStatMaisRelevante(xml: string): { cStat?: string; xMotivo?: string } {
  const cStats = extrairTags(xml, 'cStat');
  const xMotivos = extrairTags(xml, 'xMotivo');
  return { cStat: cStats[cStats.length - 1], xMotivo: xMotivos[xMotivos.length - 1] };
}

export async function consultarStatusServicoCte(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  cUF: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoStatusServicoCte> {
  const enderecos = obterEnderecosCte(params.uf, params.ambiente);
  const tpAmb = params.ambiente === 'producao' ? '1' : '2';

  const corpo = `<consStatServCTe versao="4.00" xmlns="${NS_CTE}">
      <tpAmb>${tpAmb}</tpAmb>
      <cUF>${params.cUF}</cUF>
      <xServ>STATUS</xServ>
    </consStatServCTe>`;

  // Confirmado contra a SEFAZ homologação real (SVRS/DF): o nome do serviço é
  // "CTeStatusServicoV4" (com o "V"), diferente de "CTeStatusServico4" usado nos
  // demais serviços do CT-e — usar o nome errado faz o servidor recusar a
  // requisição com "The action ... was not recognized" (SOAP Fault).
  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/cte/wsdl/CTeStatusServicoV4', corpo);

  const resposta = await postSoap({
    url: enderecos.statusServico,
    soapAction: 'http://www.portalfiscal.inf.br/cte/wsdl/CTeStatusServicoV4/cteStatusServicoCT',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const { cStat, xMotivo } = cStatMaisRelevante(resposta.xmlBruto);
  return { cStat, xMotivo, online: cStat === '107' };
}

/**
 * CTeRecepcaoSincV4 — envia o XML assinado do CT-e para autorização síncrona.
 *
 * Diferença crítica confirmada via WSDL real e testes ao vivo contra a SVRS:
 * ao contrário de CTeStatusServicoV4/CTeRecepcaoEventoV4 (cujo `cteDadosMsg` é
 * um `complexType mixed` que aceita XML literal), o `cteDadosMsg` desta operação
 * é tipado como `xs:string` puro — e o conteúdo esperado não é sequer o XML em
 * texto simples, mas sim o documento `<CTe>` assinado (sem wrapper `enviCTe`/
 * `idLote`, que não existe no layout 4.00 síncrono), compactado com gzip e
 * codificado em base64 (mesmo padrão do sped-cte). Enviar XML literal aqui
 * resulta em HTTP 400 com corpo vazio (exceção não tratada na desserialização).
 */
export async function autorizarCte(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  xmlAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoAutorizacaoCte> {
  const enderecos = obterEnderecosCte(params.uf, params.ambiente);

  const cteSemDeclaracaoXml = params.xmlAssinado.replace(/^<\?xml[^>]*\?>/, '');
  const cteGzipBase64 = gzipSync(cteSemDeclaracaoXml).toString('base64');

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="${XMLNS_SOAP12}">
  <soap12:Body>
    <cteDadosMsg xmlns="http://www.portalfiscal.inf.br/cte/wsdl/CTeRecepcaoSincV4">${cteGzipBase64}</cteDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;

  const resposta = await postSoap({
    url: enderecos.recepcao,
    // Confirmado contra o WSDL real da SVRS: o "method" do SOAPAction é
    // "cteRecepcao", não "cteRecepcaoSinc".
    soapAction: 'http://www.portalfiscal.inf.br/cte/wsdl/CTeRecepcaoSincV4/cteRecepcao',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const { cStat, xMotivo } = cStatMaisRelevante(resposta.xmlBruto);
  const nProt = extrairTag(resposta.xmlBruto, 'nProt');

  return {
    cStat,
    xMotivo,
    nProt,
    autorizado: cStat === '100',
    xmlRetorno: resposta.xmlBruto,
  };
}

/** CTeRecepcaoEventoV4 — cancelamento e demais eventos do CT-e. */
export async function enviarEventoCte(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  xmlEventoAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoEventoCte> {
  const enderecos = obterEnderecosCte(params.uf, params.ambiente);

  const corpo = params.xmlEventoAssinado.replace(/^<\?xml[^>]*\?>/, '');
  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/cte/wsdl/CTeRecepcaoEventoV4', corpo);

  const resposta = await postSoap({
    url: enderecos.recepcaoEvento,
    soapAction: 'http://www.portalfiscal.inf.br/cte/wsdl/CTeRecepcaoEventoV4/cteRecepcaoEvento',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const { cStat, xMotivo } = cStatMaisRelevante(resposta.xmlBruto);
  const nProt = extrairTag(resposta.xmlBruto, 'nProt');

  return {
    cStat,
    xMotivo,
    nProt,
    sucesso: cStat === '135' || cStat === '136',
    xmlRetorno: resposta.xmlBruto,
  };
}
