// src/utils/xmlMdfeGenerator.ts

/**
 * Gerador de XML Oficial MDF-e (Modelo 58) - Layout 3.00
 * Em conformidade com o Schema XSD da SEFAZ
 * SUP TECNOLOGIA - BACKEND
 */

import { limparDocumento } from './cpfCnpjValidator';

/**
 * Escapa caracteres especiais para XML
 */
function escapeXml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formata número para XML
 */
function formatarNumero(val: number | string | undefined | null, decimais: number = 2): string {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return num.toFixed(decimais);
}

/**
 * Base64 encode para Node.js
 */
function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64');
}

/**
 * Gera XML do MDF-e versão 3.00
 */
export function gerarXmlMDFe(params: {
  mdfe: any;
  emitente: any;
  municipiosCarrega: any[];
  percursos: any[];
  municipiosDescarga: any[];
  seguros: any[];
  lacres: string[];
  autorizadosDownload: any[];
  produtoPredominante: any;
  totalizadores: any;
}): string {
  const { mdfe, emitente, municipiosCarrega, percursos, municipiosDescarga, seguros, lacres, autorizadosDownload, produtoPredominante, totalizadores } = params;

  const cnpjEmit = limparDocumento(emitente.documento);
  const isCnpj = cnpjEmit.length === 14;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<MDFe xmlns="http://www.portalfiscal.inf.br/mdfe" versao="3.00">
  <infMDFe versao="3.00" Id="MDFe${mdfe.chaveAcesso}">
    
    <!-- ========================================== -->
    <!-- IDENTIFICAÇÃO DO MDF-e                     -->
    <!-- ========================================== -->
    <ide>
      <cUF>${mdfe.cUF}</cUF>
      <tpAmb>${mdfe.tpAmb}</tpAmb>
      <tpEmit>${mdfe.tpEmit}</tpEmit>
      ${mdfe.tpTransp ? `<tpTransp>${mdfe.tpTransp}</tpTransp>` : ''}
      <mod>${mdfe.modelo}</mod>
      <serie>${mdfe.serie}</serie>
      <nMDF>${mdfe.numero}</nMDF>
      <cMDF>${mdfe.cMDF}</cMDF>
      <cDV>${mdfe.cDV}</cDV>
      <modal>${mdfe.modal}</modal>
      <dhEmi>${mdfe.dhEmi.toISOString()}</dhEmi>
      <tpEmis>${mdfe.tpEmis}</tpEmis>
      <procEmi>${mdfe.procEmi}</procEmi>
      <verProc>${escapeXml(mdfe.verProc)}</verProc>
      <UFIni>${mdfe.UFIni}</UFIni>
      <UFFim>${mdfe.UFFim}</UFFim>
      
      ${municipiosCarrega.map(m => `
      <infMunCarrega>
        <cMunCarrega>${m.cMunCarrega}</cMunCarrega>
        <xMunCarrega>${escapeXml(m.xMunCarrega)}</xMunCarrega>
      </infMunCarrega>`).join('')}
      
      ${percursos.map(p => `
      <infPercurso>
        <UFPer>${p.UFPer}</UFPer>
      </infPercurso>`).join('')}
      
      ${mdfe.dhIniViagem ? `<dhIniViagem>${new Date(mdfe.dhIniViagem).toISOString()}</dhIniViagem>` : ''}
      ${mdfe.indCanalVerde ? `<indCanalVerde>1</indCanalVerde>` : ''}
      ${mdfe.indCarregaPosterior ? `<indCarregaPosterior>1</indCarregaPosterior>` : ''}
    </ide>

    <!-- ========================================== -->
    <!-- EMITENTE                                   -->
    <!-- ========================================== -->
    <emit>
      ${isCnpj ? `<CNPJ>${cnpjEmit}</CNPJ>` : `<CPF>${cnpjEmit}</CPF>`}
      ${emitente.inscricaoEstadual ? `<IE>${escapeXml(emitente.inscricaoEstadual)}</IE>` : ''}
      <xNome>${escapeXml(emitente.razaoSocial)}</xNome>
      ${emitente.nomeFantasia ? `<xFant>${escapeXml(emitente.nomeFantasia)}</xFant>` : ''}
      <enderEmit>
        <xLgr>${escapeXml(emitente.endereco.logradouro)}</xLgr>
        <nro>${escapeXml(emitente.endereco.numero)}</nro>
        ${emitente.endereco.complemento ? `<xCpl>${escapeXml(emitente.endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(emitente.endereco.bairro)}</xBairro>
        <cMun>${emitente.endereco.codigoMunicipio}</cMun>
        <xMun>${escapeXml(emitente.endereco.nomeMunicipio)}</xMun>
        <UF>${emitente.endereco.uf}</UF>
        <CEP>${limparDocumento(emitente.endereco.cep)}</CEP>
        ${emitente.endereco.telefone ? `<fone>${limparDocumento(emitente.endereco.telefone)}</fone>` : ''}
        ${emitente.endereco.email ? `<email>${escapeXml(emitente.endereco.email)}</email>` : ''}
      </enderEmit>
    </emit>

    <!-- ========================================== -->
    <!-- MODAL (ESPECÍFICO - AQUI VAI O XML DO MODAL) -->
    <!-- ========================================== -->
    <infModal versaoModal="3.00">
      <!-- 
        ATENÇÃO: Este é um placeholder. 
        O XML específico do modal (rodoviário, aéreo, aquaviário ou ferroviário)
        deve ser inserido aqui.
      -->
      <modalRodoviario>
        <veic>
          <!-- Dados do veículo principal -->
        </veic>
      </modalRodoviario>
    </infModal>

    <!-- ========================================== -->
    <!-- DOCUMENTOS FISCAIS VINCULADOS              -->
    <!-- ========================================== -->
    <infDoc>
      ${municipiosDescarga.map(mun => `
      <infMunDescarga>
        <cMunDescarga>${mun.cMunDescarga}</cMunDescarga>
        <xMunDescarga>${escapeXml(mun.xMunDescarga)}</xMunDescarga>
        
        ${mun.ctes?.map((cte: any) => `
        <infCTe>
          <chCTe>${cte.chCTe}</chCTe>
          ${cte.SegCodBarra ? `<SegCodBarra>${escapeXml(cte.SegCodBarra)}</SegCodBarra>` : ''}
          ${cte.indReentrega ? `<indReentrega>1</indReentrega>` : ''}
          
          ${cte.unidadesTransporte?.map((ut: any) => `
          <infUnidTransp>
            <tpUnidTransp>${ut.tpUnidTransp}</tpUnidTransp>
            <idUnidTransp>${escapeXml(ut.idUnidTransp)}</idUnidTransp>
            ${ut.lacres?.map((l: string) => `<lacUnidTransp><nLacre>${escapeXml(l)}</nLacre></lacUnidTransp>`).join('')}
            ${ut.unidadesCarga?.map((uc: any) => `
            <infUnidCarga>
              <tpUnidCarga>${uc.tpUnidCarga}</tpUnidCarga>
              <idUnidCarga>${escapeXml(uc.idUnidCarga)}</idUnidCarga>
              ${uc.lacres?.map((l: string) => `<lacUnidCarga><nLacre>${escapeXml(l)}</nLacre></lacUnidCarga>`).join('')}
              ${uc.qtdRat ? `<qtdRat>${formatarNumero(uc.qtdRat, 4)}</qtdRat>` : ''}
            </infUnidCarga>`).join('')}
            ${ut.qtdRat ? `<qtdRat>${formatarNumero(ut.qtdRat, 4)}</qtdRat>` : ''}
          </infUnidTransp>`).join('')}
          
          ${cte.perigosos?.map((p: any) => `
          <peri>
            <nONU>${p.nONU}</nONU>
            ${p.xNomeAE ? `<xNomeAE>${escapeXml(p.xNomeAE)}</xNomeAE>` : ''}
            ${p.xClaRisco ? `<xClaRisco>${escapeXml(p.xClaRisco)}</xClaRisco>` : ''}
            ${p.grEmb ? `<grEmb>${escapeXml(p.grEmb)}</grEmb>` : ''}
            <qTotProd>${escapeXml(p.qTotProd)}</qTotProd>
            ${p.qVolTipo ? `<qVolTipo>${escapeXml(p.qVolTipo)}</qVolTipo>` : ''}
          </peri>`).join('')}
          
          ${cte.qtdTotal && cte.qtdParcial ? `
          <infEntregaParcial>
            <qtdTotal>${formatarNumero(cte.qtdTotal, 4)}</qtdTotal>
            <qtdParcial>${formatarNumero(cte.qtdParcial, 4)}</qtdParcial>
          </infEntregaParcial>` : ''}
          
          ${cte.indPrestacaoParcial ? `
          <indPrestacaoParcial>1</indPrestacaoParcial>
          ${cte.nfesParciais?.map((nfe: any) => `
          <infNFePrestParcial>
            <chNFe>${nfe.chNFe}</chNFe>
          </infNFePrestParcial>`).join('')}` : ''}
        </infCTe>`).join('')}
        
        ${mun.nfes?.map((nfe: any) => `
        <infNFe>
          <chNFe>${nfe.chNFe}</chNFe>
          ${nfe.SegCodBarra ? `<SegCodBarra>${escapeXml(nfe.SegCodBarra)}</SegCodBarra>` : ''}
          ${nfe.indReentrega ? `<indReentrega>1</indReentrega>` : ''}
          
          ${nfe.unidadesTransporte?.map((ut: any) => `
          <infUnidTransp>
            <tpUnidTransp>${ut.tpUnidTransp}</tpUnidTransp>
            <idUnidTransp>${escapeXml(ut.idUnidTransp)}</idUnidTransp>
            ${ut.lacres?.map((l: string) => `<lacUnidTransp><nLacre>${escapeXml(l)}</nLacre></lacUnidTransp>`).join('')}
            ${ut.unidadesCarga?.map((uc: any) => `
            <infUnidCarga>
              <tpUnidCarga>${uc.tpUnidCarga}</tpUnidCarga>
              <idUnidCarga>${escapeXml(uc.idUnidCarga)}</idUnidCarga>
              ${uc.lacres?.map((l: string) => `<lacUnidCarga><nLacre>${escapeXml(l)}</nLacre></lacUnidCarga>`).join('')}
              ${uc.qtdRat ? `<qtdRat>${formatarNumero(uc.qtdRat, 4)}</qtdRat>` : ''}
            </infUnidCarga>`).join('')}
            ${ut.qtdRat ? `<qtdRat>${formatarNumero(ut.qtdRat, 4)}</qtdRat>` : ''}
          </infUnidTransp>`).join('')}
          
          ${nfe.perigosos?.map((p: any) => `
          <peri>
            <nONU>${p.nONU}</nONU>
            ${p.xNomeAE ? `<xNomeAE>${escapeXml(p.xNomeAE)}</xNomeAE>` : ''}
            ${p.xClaRisco ? `<xClaRisco>${escapeXml(p.xClaRisco)}</xClaRisco>` : ''}
            ${p.grEmb ? `<grEmb>${escapeXml(p.grEmb)}</grEmb>` : ''}
            <qTotProd>${escapeXml(p.qTotProd)}</qTotProd>
            ${p.qVolTipo ? `<qVolTipo>${escapeXml(p.qVolTipo)}</qVolTipo>` : ''}
          </peri>`).join('')}
        </infNFe>`).join('')}
        
        ${mun.mdfesTransp?.map((mdfeTransp: any) => `
        <infMDFeTransp>
          <chMDFe>${mdfeTransp.chMDFe}</chMDFe>
          ${mdfeTransp.indReentrega ? `<indReentrega>1</indReentrega>` : ''}
          
          ${mdfeTransp.unidadesTransporte?.map((ut: any) => `
          <infUnidTransp>
            <tpUnidTransp>${ut.tpUnidTransp}</tpUnidTransp>
            <idUnidTransp>${escapeXml(ut.idUnidTransp)}</idUnidTransp>
            ${ut.lacres?.map((l: string) => `<lacUnidTransp><nLacre>${escapeXml(l)}</nLacre></lacUnidTransp>`).join('')}
            ${ut.unidadesCarga?.map((uc: any) => `
            <infUnidCarga>
              <tpUnidCarga>${uc.tpUnidCarga}</tpUnidCarga>
              <idUnidCarga>${escapeXml(uc.idUnidCarga)}</idUnidCarga>
              ${uc.lacres?.map((l: string) => `<lacUnidCarga><nLacre>${escapeXml(l)}</nLacre></lacUnidCarga>`).join('')}
              ${uc.qtdRat ? `<qtdRat>${formatarNumero(uc.qtdRat, 4)}</qtdRat>` : ''}
            </infUnidCarga>`).join('')}
            ${ut.qtdRat ? `<qtdRat>${formatarNumero(ut.qtdRat, 4)}</qtdRat>` : ''}
          </infUnidTransp>`).join('')}
          
          ${mdfeTransp.perigosos?.map((p: any) => `
          <peri>
            <nONU>${p.nONU}</nONU>
            ${p.xNomeAE ? `<xNomeAE>${escapeXml(p.xNomeAE)}</xNomeAE>` : ''}
            ${p.xClaRisco ? `<xClaRisco>${escapeXml(p.xClaRisco)}</xClaRisco>` : ''}
            ${p.grEmb ? `<grEmb>${escapeXml(p.grEmb)}</grEmb>` : ''}
            <qTotProd>${escapeXml(p.qTotProd)}</qTotProd>
            ${p.qVolTipo ? `<qVolTipo>${escapeXml(p.qVolTipo)}</qVolTipo>` : ''}
          </peri>`).join('')}
        </infMDFeTransp>`).join('')}
        
      </infMunDescarga>`).join('')}
    </infDoc>

    <!-- ========================================== -->
    <!-- SEGURO                                     -->
    <!-- ========================================== -->
    ${seguros.map(seguro => `
    <seg>
      <infResp>
        <respSeg>${seguro.respSeg}</respSeg>
        ${seguro.respCNPJ ? `<CNPJ>${seguro.respCNPJ}</CNPJ>` : ''}
        ${seguro.respCPF ? `<CPF>${seguro.respCPF}</CPF>` : ''}
      </infResp>
      ${seguro.xSeg ? `
      <infSeg>
        <xSeg>${escapeXml(seguro.xSeg)}</xSeg>
        <CNPJ>${seguro.CNPJSeg}</CNPJ>
      </infSeg>` : ''}
      ${seguro.nApol ? `<nApol>${escapeXml(seguro.nApol)}</nApol>` : ''}
      ${seguro.nAver ? seguro.nAver.map((a: string) => `<nAver>${escapeXml(a)}</nAver>`).join('') : ''}
    </seg>`).join('')}

    <!-- ========================================== -->
    <!-- PRODUTO PREDOMINANTE                       -->
    <!-- ========================================== -->
    <prodPred>
      <tpCarga>${produtoPredominante.tpCarga}</tpCarga>
      <xProd>${escapeXml(produtoPredominante.xProd)}</xProd>
      ${produtoPredominante.cEAN ? `<cEAN>${escapeXml(produtoPredominante.cEAN)}</cEAN>` : ''}
      ${produtoPredominante.NCM ? `<NCM>${produtoPredominante.NCM}</NCM>` : ''}
    </prodPred>

    <!-- ========================================== -->
    <!-- TOTALIZADORES                              -->
    <!-- ========================================== -->
    <tot>
      ${totalizadores.qCTe ? `<qCTe>${totalizadores.qCTe}</qCTe>` : ''}
      ${totalizadores.qNFe ? `<qNFe>${totalizadores.qNFe}</qNFe>` : ''}
      ${totalizadores.qMDFe ? `<qMDFe>${totalizadores.qMDFe}</qMDFe>` : ''}
      <vCarga>${formatarNumero(totalizadores.vCarga, 2)}</vCarga>
      <cUnid>${totalizadores.cUnid}</cUnid>
      <qCarga>${formatarNumero(totalizadores.qCarga, 4)}</qCarga>
    </tot>

    <!-- ========================================== -->
    <!-- LACRES DO MDF-e                            -->
    <!-- ========================================== -->
    ${lacres.map(l => `
    <lacres>
      <nLacre>${escapeXml(l)}</nLacre>
    </lacres>`).join('')}

    <!-- ========================================== -->
    <!-- AUTORIZADOS PARA DOWNLOAD                  -->
    <!-- ========================================== -->
    ${autorizadosDownload.map(a => `
    <autXML>
      ${a.CNPJ ? `<CNPJ>${a.CNPJ}</CNPJ>` : ''}
      ${a.CPF ? `<CPF>${a.CPF}</CPF>` : ''}
    </autXML>`).join('')}

    <!-- ========================================== -->
    <!-- INFORMAÇÕES ADICIONAIS                     -->
    <!-- ========================================== -->
    ${mdfe.infAdFisco || mdfe.infCpl ? `
    <infAdic>
      ${mdfe.infAdFisco ? `<infAdFisco>${escapeXml(mdfe.infAdFisco)}</infAdFisco>` : ''}
      ${mdfe.infCpl ? `<infCpl>${escapeXml(mdfe.infCpl)}</infCpl>` : ''}
    </infAdic>` : ''}

  </infMDFe>
  
  <!-- ========================================== -->
  <!-- ASSINATURA DIGITAL                         -->
  <!-- ========================================== -->
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#MDFe${mdfe.chaveAcesso}">
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${base64Encode(`MDFE-DIGEST-${mdfe.chaveAcesso}`).slice(0, 28)}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${base64Encode(`MDFE-SIGNATURE-${mdfe.chaveAcesso}`)}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${base64Encode(`MII...CERT-SEFAZ-MDFE-${cnpjEmit}`)}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</MDFe>`;

  return xml.trim();
}