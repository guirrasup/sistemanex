// backend/src/utils/__tests__/xmlSigner.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../xmlSigner.js';

/** Gera um certificado autoassinado + PFX inteiramente em memória (sem depender do OpenSSL). */
function gerarPfxDeTeste(senha: string): Buffer {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const attrs = [{ name: 'commonName', value: 'TESTE SUP TECNOLOGIA:12345678000199' }, { name: 'organizationName', value: 'TESTE' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], senha);
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  return Buffer.from(p12Der, 'binary');
}

const SENHA_TESTE = 'senha-de-teste-123';

describe('extrairChaveECertificadoDoPfx', () => {
  it('extrai a chave privada e o certificado em PEM de um PKCS#12 válido', () => {
    const pfx = gerarPfxDeTeste(SENHA_TESTE);
    const { privateKeyPem, certPem } = extrairChaveECertificadoDoPfx(pfx, SENHA_TESTE);

    expect(privateKeyPem).toContain('BEGIN');
    expect(privateKeyPem).toContain('PRIVATE KEY');
    expect(certPem).toContain('BEGIN CERTIFICATE');
  });

  it('lança um erro claro quando a senha está incorreta', () => {
    const pfx = gerarPfxDeTeste(SENHA_TESTE);
    expect(() => extrairChaveECertificadoDoPfx(pfx, 'senha-errada')).toThrow(/senha|certificado/i);
  });

  it('lança um erro quando o arquivo não é um PKCS#12 válido', () => {
    const arquivoInvalido = Buffer.from('isto nao e um certificado');
    expect(() => extrairChaveECertificadoDoPfx(arquivoInvalido, SENHA_TESTE)).toThrow();
  });
});

describe('assinarXmlEnvelopado', () => {
  const chave = '35260012345678000199550010000000011234567890';
  const xmlSemAssinatura = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${chave}" versao="4.00">
    <ide><cUF>35</cUF><nNF>1</nNF></ide>
  </infNFe>
</NFe>`;

  let chaveECertificado: ReturnType<typeof extrairChaveECertificadoDoPfx>;

  beforeAll(() => {
    const pfx = gerarPfxDeTeste(SENHA_TESTE);
    chaveECertificado = extrairChaveECertificadoDoPfx(pfx, SENHA_TESTE);
  });

  it('insere o <Signature> logo após o elemento assinado, dentro do elemento pai', () => {
    const xmlAssinado = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertificado);

    const posInfNFeFim = xmlAssinado.indexOf('</infNFe>');
    const posSignature = xmlAssinado.indexOf('<Signature');
    const posNFeFim = xmlAssinado.lastIndexOf('</NFe>');

    expect(posInfNFeFim).toBeGreaterThan(0);
    expect(posSignature).toBeGreaterThan(posInfNFeFim);
    expect(posSignature).toBeLessThan(posNFeFim);
  });

  it('a Reference URI aponta exatamente para o Id do elemento assinado (#NFe<chave>)', () => {
    const xmlAssinado = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertificado);
    const match = xmlAssinado.match(/<Reference URI="([^"]+)"/);
    expect(match?.[1]).toBe(`#NFe${chave}`);
  });

  it('produz uma assinatura criptograficamente válida (verificável com a chave pública do certificado)', () => {
    const xmlAssinado = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertificado);

    const doc = new DOMParser().parseFromString(xmlAssinado);
    const signatureNode = doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature')[0];

    const verificador = new SignedXml({ publicCert: chaveECertificado.certPem });
    verificador.loadSignature(signatureNode);

    expect(verificador.checkSignature(xmlAssinado)).toBe(true);
  });

  it('detecta adulteração: alterar o conteúdo assinado invalida a assinatura', () => {
    const xmlAssinado = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertificado);
    const xmlAdulterado = xmlAssinado.replace('<nNF>1</nNF>', '<nNF>999</nNF>');

    const doc = new DOMParser().parseFromString(xmlAdulterado);
    const signatureNode = doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature')[0];

    const verificador = new SignedXml({ publicCert: chaveECertificado.certPem });
    verificador.loadSignature(signatureNode);

    expect(verificador.checkSignature(xmlAdulterado)).toBe(false);
  });

  it('detecta assinatura com certificado errado (chave pública que não corresponde à privada usada)', () => {
    const xmlAssinado = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertificado);

    const outroPfx = gerarPfxDeTeste('outra-senha');
    const outroPar = extrairChaveECertificadoDoPfx(outroPfx, 'outra-senha');

    const doc = new DOMParser().parseFromString(xmlAssinado);
    const signatureNode = doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature')[0];

    const verificador = new SignedXml({ publicCert: outroPar.certPem });
    verificador.loadSignature(signatureNode);

    // xml-crypto lança um erro (em vez de retornar false) quando o SignatureValue
    // não confere com a chave pública informada — só retorna `false` quando é o
    // digest de uma Reference que não bate (caso de adulteração de conteúdo, já
    // coberto no teste anterior).
    expect(() => verificador.checkSignature(xmlAssinado)).toThrow(/signature value.*is incorrect/i);
  });
});
