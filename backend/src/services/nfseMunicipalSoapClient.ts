// backend/src/services/nfseMunicipalSoapClient.ts
// Cliente SOAP para o webservice PRÓPRIO de NFS-e de municípios que não aceitam
// a DPS pelo Emissor Nacional público (ver nfseMunicipiosWebservicePropio.ts).
// Mesma DPS/XSD do Padrão Nacional (namespace http://www.sped.fazenda.gov.br/nfse),
// mas protocolo SOAP 1.1 clássico (.asmx) — confirmado ao vivo contra o WSDL real
// do webservice de homologação do DF (plataforma NotaControl/ISS.net Online):
//
// - Método GerarNfse: entrada { nfseCabecMsg: string, nfseDadosMsg: string },
//   ambos texto XML (não elementos tipados) — segue o padrão clássico ABRASF de
//   "área de cabeçalho" + "área de dados", reaproveitado aqui pra carregar o XML
//   da DPS nacional.
// - nfseCabecMsg é sempre <cabecalho versao="1.00" xmlns="...nfse"><versaoDados>
//   1.00</versaoDados></cabecalho> (1.00 pois não preenchemos o grupo IBSCBS
//   ainda — confirmado no manual de integração, seção 14).
// - nfseDadosMsg é a DPS já assinada, envelopada em <GerarNfseEnvio xmlns="...">
//   (confirmado no XML de exemplo GerarNfseEnvio.xml do manual).
// - Resposta: <GerarNfseResponse><outputXML>...</outputXML></GerarNfseResponse>,
//   onde outputXML é o texto do <GerarNfseResposta> — ou <ListaNfse><CompNfse>
//   <Nfse> (sucesso, com o <infNFSe Id="NFS..."> autorizado) ou
//   <ListaMensagemRetorno><MensagemRetorno><Codigo>/<Mensagem> (rejeição).
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { postSoap, type CredenciaisMtls } from './sefazSoapClient.js';
import type { ResultadoEnvioDps } from './adnNfseClient.js';

const NS_NFSE = 'http://www.sped.fazenda.gov.br/nfse';
const SOAP_ACTION_GERAR_NFSE = `${NS_NFSE}/GerarNfse`;

const CABECALHO_V1_00 = `<cabecalho versao="1.00" xmlns="${NS_NFSE}"><versaoDados>1.00</versaoDados></cabecalho>`;

function montarEnvelopeGerarNfse(xmlDpsAssinado: string): string {
  // gerarXmlDps() devolve um documento completo com prólogo <?xml version="1.0"...?>.
  // Como aqui a DPS vai aninhada CRUA dentro do envelope SOAP (não escapada, nem num
  // documento próprio), um <?xml?> no meio do documento é rejeitado pelo parser do
  // .NET com "Unexpected XML declaration... must be the first node" — confirmado
  // testando ao vivo. Só o elemento <DPS>...</DPS> em si deve ir aninhado.
  const dpsSemProlog = xmlDpsAssinado.replace(/^\s*<\?xml[^>]*\?>\s*/, '');
  const dadosMsg = `<GerarNfseEnvio xmlns="${NS_NFSE}">${dpsSemProlog}</GerarNfseEnvio>`;
  // nfseCabecMsg/nfseDadosMsg são declarados xsd:string no WSDL, mas o webservice
  // real (confirmado testando ao vivo) trata o conteúdo como XML cru aninhado, não
  // como texto com entidades escapadas — mesmo padrão clássico ABRASF reaproveitado
  // aqui (a resposta do servidor também devolve XML cru dentro de "string", em vez
  // de texto escapado, confirmando o comportamento nos dois sentidos).
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="${NS_NFSE}">
  <soap:Body>
    <ws:GerarNfse>
      <nfseCabecMsg>${CABECALHO_V1_00}</nfseCabecMsg>
      <nfseDadosMsg>${dadosMsg}</nfseDadosMsg>
    </ws:GerarNfse>
  </soap:Body>
</soap:Envelope>`;
}

function extrairXmlDaTag(xml: string, tagName: string): string | undefined {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const encontrar = (nome: string) => {
    const direto = doc.getElementsByTagName(nome)[0];
    if (direto) return direto;
    const todos = doc.getElementsByTagName('*');
    for (let i = 0; i < todos.length; i++) {
      const node = todos[i];
      const localName = node.localName || node.nodeName.split(':').pop();
      if (localName === nome) return node;
    }
    return undefined;
  };
  const node = encontrar(tagName);
  if (!node) return undefined;
  return new XMLSerializer().serializeToString(node);
}

/** Monta a mensagem de erro a partir de <ListaMensagemRetorno><MensagemRetorno><Codigo>/<Mensagem>. */
function extrairErroMunicipal(outputXml: string): string {
  const doc = new DOMParser().parseFromString(outputXml, 'text/xml');
  const mensagens = doc.getElementsByTagName('MensagemRetorno');
  if (mensagens.length === 0) return 'Rejeitado pelo webservice municipal sem motivo informado';
  const partes: string[] = [];
  for (let i = 0; i < mensagens.length; i++) {
    const msg = mensagens[i];
    const codigo = msg.getElementsByTagName('Codigo')[0]?.textContent;
    const descricao = msg.getElementsByTagName('Mensagem')[0]?.textContent;
    partes.push(`${codigo ? `[${codigo}] ` : ''}${descricao || ''}`);
  }
  return partes.join(' | ');
}

/**
 * Envia a DPS assinada pro webservice próprio do município (SOAP 1.1),
 * retornando o mesmo formato de ResultadoEnvioDps usado pelo cliente do
 * Emissor Nacional público (adnNfseClient.ts), pra nfse.service.ts poder
 * tratar os dois caminhos de forma intercambiável.
 */
export async function enviarDpsMunicipal(params: {
  url: string;
  xmlDpsAssinado: string;
  mtls: CredenciaisMtls;
}): Promise<ResultadoEnvioDps> {
  const envelope = montarEnvelopeGerarNfse(params.xmlDpsAssinado);

  const resposta = await postSoap({
    url: params.url,
    soapAction: SOAP_ACTION_GERAR_NFSE,
    envelope,
    mtls: params.mtls,
    versaoSoap: '1.1',
  });

  if (resposta.statusHttp < 200 || resposta.statusHttp >= 300) {
    return {
      sucesso: false,
      statusHttp: resposta.statusHttp,
      erro: `HTTP ${resposta.statusHttp} ao chamar o webservice municipal`,
      respostaBruta: resposta.xmlBruto,
    };
  }

  // O WSDL declara a resposta como { outputXML: xsd:string }, mas o webservice
  // real devolve o XML cru aninhado direto dentro de <GerarNfseResponse> (sem
  // um wrapper <outputXML> de texto escapado) — confirmado testando ao vivo,
  // mesmo comportamento "string que na prática é XML cru" do lado do envio.
  // Por isso busca as tags direto na resposta bruta, sem depender de outputXML.
  const nfseXml = extrairXmlDaTag(resposta.xmlBruto, 'Nfse') || extrairXmlDaTag(resposta.xmlBruto, 'NFSe');
  if (!nfseXml) {
    return {
      sucesso: false,
      statusHttp: resposta.statusHttp,
      erro: extrairErroMunicipal(resposta.xmlBruto),
      respostaBruta: resposta.xmlBruto,
    };
  }

  // O Id do <infNFSe> segue o padrão "NFS" + chave de acesso (50 dígitos) —
  // mesmo padrão que xmlNfseGenerator.ts usa pra montar localmente.
  const idInfNfse = extrairXmlDaTag(nfseXml, 'infNFSe');
  const idMatch = idInfNfse?.match(/Id="NFS(\d{50})"/);

  return {
    sucesso: true,
    chaveAcesso: idMatch?.[1],
    nfseXml,
    statusHttp: resposta.statusHttp,
    respostaBruta: resposta.xmlBruto,
  };
}
