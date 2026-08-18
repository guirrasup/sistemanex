import { NFePayload, TipoDocumentoFiscal } from "../types/sefaz.types";

export class XmlBuilder {
  /**
   * Calcula o Dígito Verificador (DV) Módulo 11 para a Chave de Acesso da NFe (43 dígitos)
   */
  public static calculateAccessKeyDv(key43: string): number {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9];
    let sum = 0;
    let weightIndex = 0;

    for (let i = key43.length - 1; i >= 0; i--) {
      sum += parseInt(key43[i], 10) * weights[weightIndex];
      weightIndex = (weightIndex + 1) % weights.length;
    }

    const remainder = sum % 11;
    const dv = 11 - remainder;
    return dv >= 10 ? 0 : dv;
  }

  /**
   * Gera Chave de Acesso de 44 dígitos para NF-e/NFC-e
   * cUF (2) + AAMM (4) + CNPJ (14) + mod (2) + serie (3) + nNF (9) + tpEmis (1) + cNF (8) + cDV (1)
   */
  public static generateAccessKey(payload: NFePayload, ufCode: string = "35"): string {
    const date = payload.dataEmissao ? new Date(payload.dataEmissao) : new Date();
    const aa = date.getFullYear().toString().slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const aamm = `${aa}${mm}`;

    const cnpjClean = payload.emitente.cnpj.replace(/\D/g, "").padStart(14, "0");
    const mod = payload.tipoDocumento === "65" || payload.tipoDocumento === "nfc_e" ? "65" : "55";
    const serie = String(payload.serie).padStart(3, "0");
    const nNF = String(payload.numeroNota).padStart(9, "0");
    const tpEmis = "1"; // Normal
    const cNF = String(Math.floor(10000000 + Math.random() * 90000000)); // Código Numérico Aleatório de 8 dígitos

    const key43 = `${ufCode}${aamm}${cnpjClean}${mod}${serie}${nNF}${tpEmis}${cNF}`;
    const cDV = this.calculateAccessKeyDv(key43);

    return `${key43}${cDV}`;
  }

  /**
   * Constrói a estrutura de XML da NF-e v4.00 com namespaces oficiais da SEFAZ
   */
  public static buildNFeXml(payload: NFePayload, accessKey: string): string {
    const mod = payload.tipoDocumento === "65" || payload.tipoDocumento === "nfc_e" ? "65" : "55";
    const dhEmi = payload.dataEmissao || new Date().toISOString();

    const itemsXml = payload.itens.map((item, idx) => `
      <det nItem="${idx + 1}">
        <prod>
          <cProd>${this.escapeXml(item.codigo)}</cProd>
          <cEAN>${item.gtin || "SEM GTIN"}</cEAN>
          <xProd>${this.escapeXml(item.descricao)}</xProd>
          <NCM>${item.ncm.replace(/\D/g, "")}</NCM>
          ${item.cest ? `<CEST>${item.cest.replace(/\D/g, "")}</CEST>` : ""}
          <CFOP>${item.cfop.replace(/\D/g, "")}</CFOP>
          <uCom>${item.unidade}</uCom>
          <qCom>${item.quantidade.toFixed(4)}</qCom>
          <vUnCom>${item.valorUnitario.toFixed(4)}</vUnCom>
          <vProd>${item.valorTotal.toFixed(2)}</vProd>
          <cEANTrib>${item.gtin || "SEM GTIN"}</cEANTrib>
          <uTrib>${item.unidade}</uTrib>
          <qTrib>${item.quantidade.toFixed(4)}</qTrib>
          <vUnTrib>${item.valorUnitario.toFixed(4)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>${item.valorTotal.toFixed(2)}</vBC>
              <pICMS>${(item.icmsRate || 18).toFixed(2)}</pICMS>
              <vICMS>${(item.icmsAmount || item.valorTotal * 0.18).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>${item.valorTotal.toFixed(2)}</vBC>
              <pPIS>${(item.pisRate || 1.65).toFixed(2)}</pPIS>
              <vPIS>${(item.pisAmount || item.valorTotal * 0.0165).toFixed(2)}</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>${item.valorTotal.toFixed(2)}</vBC>
              <pCOFINS>${(item.cofinsRate || 7.6).toFixed(2)}</pCOFINS>
              <vCOFINS>${(item.cofinsAmount || item.valorTotal * 0.076).toFixed(2)}</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
    `).join("");

    const totalIcms = payload.itens.reduce((acc, i) => acc + (i.icmsAmount || i.valorTotal * 0.18), 0);
    const totalPis = payload.itens.reduce((acc, i) => acc + (i.pisAmount || i.valorTotal * 0.0165), 0);
    const totalCofins = payload.itens.reduce((acc, i) => acc + (i.cofinsAmount || i.valorTotal * 0.076), 0);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${accessKey}" versao="4.00">
    <ide>
      <cUF>${accessKey.substring(0, 2)}</cUF>
      <cNF>${accessKey.substring(35, 43)}</cNF>
      <natOp>${this.escapeXml(payload.naturezaOperacao)}</natOp>
      <mod>${mod}</mod>
      <serie>${payload.serie}</serie>
      <nNF>${payload.numeroNota}</nNF>
      <dhEmi>${dhEmi}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${payload.emitente.endereco.codigoMunicipio}</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${accessKey.substring(43)}</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>NEX_ERP_v2.5</verProc>
    </ide>
    <emit>
      <CNPJ>${payload.emitente.cnpj.replace(/\D/g, "")}</CNPJ>
      <xNome>${this.escapeXml(payload.emitente.razaoSocial)}</xNome>
      ${payload.emitente.nomeFantasia ? `<xFant>${this.escapeXml(payload.emitente.nomeFantasia)}</xFant>` : ""}
      <enderEmit>
        <xLgr>${this.escapeXml(payload.emitente.endereco.logradouro)}</xLgr>
        <nro>${this.escapeXml(payload.emitente.endereco.numero)}</nro>
        <xBairro>${this.escapeXml(payload.emitente.endereco.bairro)}</xBairro>
        <cMun>${payload.emitente.endereco.codigoMunicipio}</cMun>
        <xMun>${this.escapeXml(payload.emitente.endereco.nomeMunicipio)}</xMun>
        <UF>${payload.emitente.endereco.uf}</UF>
        <CEP>${payload.emitente.endereco.cep.replace(/\D/g, "")}</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
      </enderEmit>
      <IE>${payload.emitente.inscricaoEstadual.replace(/\D/g, "")}</IE>
      <CRT>${payload.emitente.regimeTributario}</CRT>
    </emit>
    <dest>
      <CNPJ>${payload.destinatario.cpfCnpj.replace(/\D/g, "")}</CNPJ>
      <xNome>${this.escapeXml(payload.destinatario.razaoSocial)}</xNome>
      <indIEDest>9</indIEDest>
    </dest>
    ${itemsXml}
    <total>
      <ICMSTot>
        <vBC>${payload.valorTotalNota.toFixed(2)}</vBC>
        <vICMS>${totalIcms.toFixed(2)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${payload.valorTotalNota.toFixed(2)}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDexon>0.00</vIPIDexon>
        <vPIS>${totalPis.toFixed(2)}</vPIS>
        <vCOFINS>${totalCofins.toFixed(2)}</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${payload.valorTotalNota.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>01</tPag>
        <vPag>${payload.valorTotalNota.toFixed(2)}</vPag>
      </detPag>
    </pag>
    ${payload.informacoesAdicionais ? `<infAdic><infCpl>${this.escapeXml(payload.informacoesAdicionais)}</infCpl></infAdic>` : ""}
  </infNFe>
</NFe>`;

    return xml.trim();
  }

  /**
   * Emula a assinatura digital XML-DSig envelopada no elemento infNFe
   */
  public static signXml(xml: string, accessKey: string): string {
    const signatureXml = `
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <Reference URI="#NFe${accessKey}">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <DigestValue>d3Z3S1pOWm1vYnAxMlh5Wm1vY29tOTh6</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>M3pNWm85T3Axa1pYWXphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>TUlJRXREQ0NBeXlnQXdJQkFnS1RBT0NBYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXow</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>`;

    return xml.replace("</infNFe>", `</infNFe>${signatureXml}`);
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
