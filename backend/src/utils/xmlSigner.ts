// backend/src/utils/xmlSigner.ts
// Assinatura digital real (XML-DSig) de documentos fiscais brasileiros (NFe/NFCe/MDFe),
// usando a chave privada extraída do certificado A1 (.pfx) da empresa.
//
// Algoritmos exigidos pelo Manual de Orientação do Contribuinte (NFe/NFCe) e pelo
// Manual do MDF-e: RSA-SHA1 + canonicalização C14N (não exclusiva), assinatura
// envelopada (enveloped-signature) sobre o elemento "inf*" identificado por Id.
import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';

export interface ChaveECertificadoPem {
  privateKeyPem: string;
  certPem: string;
}

/**
 * Extrai a chave privada e o certificado (em PEM) de um arquivo PKCS#12 (.pfx/.p12).
 */
export function extrairChaveECertificadoDoPfx(pfxBuffer: Buffer, senha: string): ChaveECertificadoPem {
  let p12: forge.pkcs12.Pkcs12Pfx;
  try {
    const p12Der = forge.util.createBuffer(pfxBuffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
  } catch {
    throw new Error('Senha incorreta ou arquivo de certificado inválido');
  }

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
  if (!keyBag?.key) {
    throw new Error('Não foi possível extrair a chave privada do certificado');
  }

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  if (!certBag?.cert) {
    throw new Error('Não foi possível extrair o certificado (X.509) do arquivo');
  }

  return {
    privateKeyPem: forge.pki.privateKeyToPem(keyBag.key),
    certPem: forge.pki.certificateToPem(certBag.cert),
  };
}

/**
 * Assina digitalmente (envelope XML-DSig) o elemento identificado por `elementoAssinado`
 * (ex.: "infNFe", "infMDFe") dentro do `xml` informado, e devolve o XML completo já assinado.
 *
 * Pré-requisito: o elemento alvo já deve ter um atributo `Id` com o valor esperado pela
 * SEFAZ (ex.: `Id="NFe<chave44>"`), pois a assinatura referencia esse Id via `URI="#..."`.
 */
export function assinarXmlEnvelopado(
  xmlSemAssinatura: string,
  elementoAssinado: string,
  chaveECertificado: ChaveECertificadoPem
): string {
  const sig = new SignedXml({
    privateKey: chaveECertificado.privateKeyPem,
    publicCert: chaveECertificado.certPem,
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  });

  sig.addReference({
    xpath: `//*[local-name(.)='${elementoAssinado}']`,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
  });

  sig.computeSignature(xmlSemAssinatura, {
    location: {
      reference: `//*[local-name(.)='${elementoAssinado}']`,
      action: 'after',
    },
  });

  return sig.getSignedXml();
}
