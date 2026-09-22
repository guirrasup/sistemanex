// backend/src/services/mdfeSefazClient.ts
// Integração real com os webservices SOAP da SEFAZ (SVRS, autorizador único
// nacional) para MDF-e, layout 3.00. Usa recepção síncrona (MDFeRecepcaoSinc),
// igual ao CT-e: a resposta já traz o protocolo de autorização na mesma chamada.
import { postSoap, extrairTag, extrairTags, type CredenciaisMtls } from './sefazSoapClient.js';
import { obterEnderecosMdfe, type AmbienteSefaz } from '../config/mdfeEndpoints.js';

const NS_MDFE = 'http://www.portalfiscal.inf.br/mdfe';
const XMLNS_SOAP12 = 'http://www.w3.org/2003/05/soap-envelope';

function envelope(nsWsdl: string, corpo: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="${XMLNS_SOAP12}">
  <soap12:Body>
    <mdfeDadosMsg xmlns="${nsWsdl}">${corpo}</mdfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;
}

function cStatMaisRelevante(xml: string): { cStat?: string; xMotivo?: string } {
  const cStats = extrairTags(xml, 'cStat');
  const xMotivos = extrairTags(xml, 'xMotivo');
  return { cStat: cStats[cStats.length - 1], xMotivo: xMotivos[xMotivos.length - 1] };
}

export interface ResultadoStatusServicoMdfe {
  cStat?: string;
  xMotivo?: string;
  online: boolean;
}

export interface ResultadoAutorizacaoMdfe {
  cStat?: string;
  xMotivo?: string;
  nProt?: string;
  autorizado: boolean;
  xmlRetorno: string;
}

export interface ResultadoEventoMdfe {
  cStat?: string;
  xMotivo?: string;
  nProt?: string;
  sucesso: boolean;
  xmlRetorno: string;
}

export async function consultarStatusServicoMdfe(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  cUF: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoStatusServicoMdfe> {
  const enderecos = obterEnderecosMdfe(params.uf, params.ambiente);
  const tpAmb = params.ambiente === 'producao' ? '1' : '2';

  const corpo = `<consStatServMDFe versao="3.00" xmlns="${NS_MDFE}">
      <tpAmb>${tpAmb}</tpAmb>
      <cUF>${params.cUF}</cUF>
      <xServ>STATUS</xServ>
    </consStatServMDFe>`;

  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/mdfe/wsdl/MDFeStatusServico', corpo);

  const resposta = await postSoap({
    url: enderecos.statusServico,
    soapAction: 'http://www.portalfiscal.inf.br/mdfe/wsdl/MDFeStatusServico/mdfeStatusServicoMDF',
    envelope: soapEnvelope,
    mtls: params.mtls,
  });

  const { cStat, xMotivo } = cStatMaisRelevante(resposta.xmlBruto);
  return { cStat, xMotivo, online: cStat === '107' };
}

/** MDFeRecepcaoSinc — envia o XML assinado do MDF-e para autorização síncrona. */
export async function autorizarMdfe(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  xmlAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoAutorizacaoMdfe> {
  const enderecos = obterEnderecosMdfe(params.uf, params.ambiente);
  const idLote = Date.now().toString().slice(-15);

  const corpo = `<mdfeDadosMsg xmlns="${NS_MDFE}">
      <enviMDFe versao="3.00">
        <idLote>${idLote}</idLote>
        ${params.xmlAssinado.replace(/^<\?xml[^>]*\?>/, '')}
      </enviMDFe>
    </mdfeDadosMsg>`;

  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/mdfe/wsdl/MDFeRecepcaoSinc', corpo);

  const resposta = await postSoap({
    url: enderecos.recepcaoSinc,
    soapAction: 'http://www.portalfiscal.inf.br/mdfe/wsdl/MDFeRecepcaoSinc/mdfeRecepcao',
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

/** MDFeRecepcaoEvento — cancelamento e encerramento do MDF-e. */
export async function enviarEventoMdfe(params: {
  uf: string;
  ambiente: AmbienteSefaz;
  xmlEventoAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoEventoMdfe> {
  const enderecos = obterEnderecosMdfe(params.uf, params.ambiente);

  const corpo = params.xmlEventoAssinado.replace(/^<\?xml[^>]*\?>/, '');
  const soapEnvelope = envelope('http://www.portalfiscal.inf.br/mdfe/wsdl/MDFeRecepcaoEvento', corpo);

  const resposta = await postSoap({
    url: enderecos.recepcaoEvento,
    soapAction: 'http://www.portalfiscal.inf.br/mdfe/wsdl/MDFeRecepcaoEvento/mdfeRecepcaoEvento',
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
