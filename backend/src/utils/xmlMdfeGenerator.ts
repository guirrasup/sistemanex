// backend/src/utils/xmlMdfeGenerator.ts
import { limparDocumento } from './cpfCnpjValidator.js';
import { formatarDataHoraSefaz } from './dataHoraSefaz.js';

function escapeXml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatarNumero(val: number | string | undefined | null, decimais: number = 2): string {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return num.toFixed(decimais);
}

// Códigos numéricos do layout SEFAZ para os enums do Prisma — confirmado contra
// o XSD oficial (mdfeTiposBasico_v3.00.xsd). Sem este mapeamento, o gerador
// emitia o nome do enum (ex. "RODOVIARIO") em vez do código esperado, causando
// rejeição real de schema XML.
const MODAL_CODIGO: Record<string, string> = { RODOVIARIO: '1', AEREO: '2', AQUAVIARIO: '3', FERROVIARIO: '4' };
const TP_EMIT_CODIGO: Record<string, string> = { PRESTADOR_SERVICO: '1', TRANSPORTADOR_CARGA_PROPRIA: '2', CTE_GLOBALIZADO: '3' };
const TP_TRANSP_CODIGO: Record<string, string> = { ETC: '1', TAC: '2', CTC: '3' };
const TP_CARGA_CODIGO: Record<string, string> = {
  GRANEL_SOLIDO: '01', GRANEL_LIQUIDO: '02', FRIGORIFICADA: '03', CONTEINERIZADA: '04',
  CARGA_GERAL: '05', NEOGRANEL: '06', PERIGOSA_GRANEL_SOLIDO: '07', PERIGOSA_GRANEL_LIQUIDO: '08',
  PERIGOSA_FRIGORIFICADA: '09', PERIGOSA_CONTEINERIZADA: '10', PERIGOSA_CARGA_GERAL: '11',
  GRANEL_PRESSURIZADA: '12',
};


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
<MDFe xmlns="http://www.portalfiscal.inf.br/mdfe">
  <infMDFe versao="3.00" Id="MDFe${mdfe.chaveAcesso}">
    
    <!-- ========================================== -->
    <!-- IDENTIFICAÇÃO DO MDF-e                     -->
    <!-- ========================================== -->
    <ide>
      <cUF>${mdfe.cUF}</cUF>
      <tpAmb>${mdfe.tpAmb}</tpAmb>
      <tpEmit>${TP_EMIT_CODIGO[mdfe.tpEmit] ?? mdfe.tpEmit}</tpEmit>
      ${mdfe.tpTransp ? `<tpTransp>${TP_TRANSP_CODIGO[mdfe.tpTransp] ?? mdfe.tpTransp}</tpTransp>` : ''}
      <mod>${mdfe.modelo}</mod>
      <serie>${mdfe.serie}</serie>
      <nMDF>${mdfe.numero}</nMDF>
      <cMDF>${mdfe.cMDF}</cMDF>
      <cDV>${mdfe.cDV}</cDV>
      <modal>${MODAL_CODIGO[mdfe.modal] ?? mdfe.modal}</modal>
      <dhEmi>${formatarDataHoraSefaz(mdfe.dhEmi)}</dhEmi>
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
      
      ${mdfe.dhIniViagem ? `<dhIniViagem>${formatarDataHoraSefaz(new Date(mdfe.dhIniViagem))}</dhIniViagem>` : ''}
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
        <CEP>${limparDocumento(emitente.endereco.cep)}</CEP>
        <UF>${emitente.endereco.uf}</UF>
        ${emitente.endereco.telefone ? `<fone>${limparDocumento(emitente.endereco.telefone)}</fone>` : ''}
        ${emitente.endereco.email ? `<email>${escapeXml(emitente.endereco.email)}</email>` : ''}
      </enderEmit>
    </emit>

    <!-- ========================================== -->
    <!-- MODAL RODOVIÁRIO (rodo/infANTT/veicTracao)  -->
    <!-- Somente aéreo/aquaviário/ferroviário ainda não implementados. -->
    <!-- ========================================== -->
    <infModal versaoModal="3.00">
      <rodo>
        ${mdfe.rntrc ? `<infANTT>
          <RNTRC>${escapeXml(mdfe.rntrc)}</RNTRC>
        </infANTT>` : ''}
        <veicTracao>
          <placa>${escapeXml(mdfe.veicTracaoPlaca)}</placa>
          ${mdfe.veicTracaoRenavam ? `<RENAVAM>${escapeXml(mdfe.veicTracaoRenavam)}</RENAVAM>` : ''}
          <tara>${escapeXml(mdfe.veicTracaoTara)}</tara>
          ${(mdfe.condutores || []).map((c: any) => `
          <condutor>
            <xNome>${escapeXml(c.xNome)}</xNome>
            <CPF>${limparDocumento(c.CPF)}</CPF>
          </condutor>`).join('')}
          <tpRod>${escapeXml(mdfe.veicTracaoTpRod)}</tpRod>
          <tpCar>${escapeXml(mdfe.veicTracaoTpCar)}</tpCar>
          ${mdfe.veicTracaoUF ? `<UF>${escapeXml(mdfe.veicTracaoUF)}</UF>` : ''}
        </veicTracao>
      </rodo>
    </infModal>

    <!-- ========================================== -->
    <!-- DOCUMENTOS FISCAIS VINCULADOS              -->
    <!-- ========================================== -->
    <infDoc>
      ${municipiosDescarga.map(mun => `
      <infMunDescarga>
        <cMunDescarga>${mun.cMunDescarga}</cMunDescarga>
        <xMunDescarga>${escapeXml(mun.xMunDescarga)}</xMunDescarga>
        
        ${(mun.ctes || []).map((cte: any) => `
        <infCTe>
          <chCTe>${cte.chCTe}</chCTe>
          ${cte.SegCodBarra ? `<SegCodBarra>${escapeXml(cte.SegCodBarra)}</SegCodBarra>` : ''}
          ${cte.indReentrega ? `<indReentrega>1</indReentrega>` : ''}
          
          ${(cte.unidadesTransporte || []).map((ut: any) => `
          <infUnidTransp>
            <tpUnidTransp>${ut.tpUnidTransp}</tpUnidTransp>
            <idUnidTransp>${escapeXml(ut.idUnidTransp)}</idUnidTransp>
            ${(ut.lacres || []).map((l: string) => `<lacUnidTransp><nLacre>${escapeXml(l)}</nLacre></lacUnidTransp>`).join('')}
            ${(ut.unidadesCarga || []).map((uc: any) => `
            <infUnidCarga>
              <tpUnidCarga>${uc.tpUnidCarga}</tpUnidCarga>
              <idUnidCarga>${escapeXml(uc.idUnidCarga)}</idUnidCarga>
              ${(uc.lacres || []).map((l: string) => `<lacUnidCarga><nLacre>${escapeXml(l)}</nLacre></lacUnidCarga>`).join('')}
              ${uc.qtdRat ? `<qtdRat>${formatarNumero(uc.qtdRat, 4)}</qtdRat>` : ''}
            </infUnidCarga>`).join('')}
            ${ut.qtdRat ? `<qtdRat>${formatarNumero(ut.qtdRat, 4)}</qtdRat>` : ''}
          </infUnidTransp>`).join('')}
          
          ${(cte.perigosos || []).map((p: any) => `
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
          ${(cte.nfesParciais || []).map((nfe: any) => `
          <infNFePrestParcial>
            <chNFe>${nfe.chNFe}</chNFe>
          </infNFePrestParcial>`).join('')}` : ''}
        </infCTe>`).join('')}
        
        ${(mun.nfes || []).map((nfe: any) => `
        <infNFe>
          <chNFe>${nfe.chNFe}</chNFe>
          ${nfe.SegCodBarra ? `<SegCodBarra>${escapeXml(nfe.SegCodBarra)}</SegCodBarra>` : ''}
          ${nfe.indReentrega ? `<indReentrega>1</indReentrega>` : ''}
          
          ${(nfe.unidadesTransporte || []).map((ut: any) => `
          <infUnidTransp>
            <tpUnidTransp>${ut.tpUnidTransp}</tpUnidTransp>
            <idUnidTransp>${escapeXml(ut.idUnidTransp)}</idUnidTransp>
            ${(ut.lacres || []).map((l: string) => `<lacUnidTransp><nLacre>${escapeXml(l)}</nLacre></lacUnidTransp>`).join('')}
            ${(ut.unidadesCarga || []).map((uc: any) => `
            <infUnidCarga>
              <tpUnidCarga>${uc.tpUnidCarga}</tpUnidCarga>
              <idUnidCarga>${escapeXml(uc.idUnidCarga)}</idUnidCarga>
              ${(uc.lacres || []).map((l: string) => `<lacUnidCarga><nLacre>${escapeXml(l)}</nLacre></lacUnidCarga>`).join('')}
              ${uc.qtdRat ? `<qtdRat>${formatarNumero(uc.qtdRat, 4)}</qtdRat>` : ''}
            </infUnidCarga>`).join('')}
            ${ut.qtdRat ? `<qtdRat>${formatarNumero(ut.qtdRat, 4)}</qtdRat>` : ''}
          </infUnidTransp>`).join('')}
          
          ${(nfe.perigosos || []).map((p: any) => `
          <peri>
            <nONU>${p.nONU}</nONU>
            ${p.xNomeAE ? `<xNomeAE>${escapeXml(p.xNomeAE)}</xNomeAE>` : ''}
            ${p.xClaRisco ? `<xClaRisco>${escapeXml(p.xClaRisco)}</xClaRisco>` : ''}
            ${p.grEmb ? `<grEmb>${escapeXml(p.grEmb)}</grEmb>` : ''}
            <qTotProd>${escapeXml(p.qTotProd)}</qTotProd>
            ${p.qVolTipo ? `<qVolTipo>${escapeXml(p.qVolTipo)}</qVolTipo>` : ''}
          </peri>`).join('')}
        </infNFe>`).join('')}
        
        ${(mun.mdfesTransp || []).map((mdfeTransp: any) => `
        <infMDFeTransp>
          <chMDFe>${mdfeTransp.chMDFe}</chMDFe>
          ${mdfeTransp.indReentrega ? `<indReentrega>1</indReentrega>` : ''}
          
          ${(mdfeTransp.unidadesTransporte || []).map((ut: any) => `
          <infUnidTransp>
            <tpUnidTransp>${ut.tpUnidTransp}</tpUnidTransp>
            <idUnidTransp>${escapeXml(ut.idUnidTransp)}</idUnidTransp>
            ${(ut.lacres || []).map((l: string) => `<lacUnidTransp><nLacre>${escapeXml(l)}</nLacre></lacUnidTransp>`).join('')}
            ${(ut.unidadesCarga || []).map((uc: any) => `
            <infUnidCarga>
              <tpUnidCarga>${uc.tpUnidCarga}</tpUnidCarga>
              <idUnidCarga>${escapeXml(uc.idUnidCarga)}</idUnidCarga>
              ${(uc.lacres || []).map((l: string) => `<lacUnidCarga><nLacre>${escapeXml(l)}</nLacre></lacUnidCarga>`).join('')}
              ${uc.qtdRat ? `<qtdRat>${formatarNumero(uc.qtdRat, 4)}</qtdRat>` : ''}
            </infUnidCarga>`).join('')}
            ${ut.qtdRat ? `<qtdRat>${formatarNumero(ut.qtdRat, 4)}</qtdRat>` : ''}
          </infUnidTransp>`).join('')}
          
          ${(mdfeTransp.perigosos || []).map((p: any) => `
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
      <tpCarga>${TP_CARGA_CODIGO[produtoPredominante.tpCarga] ?? produtoPredominante.tpCarga}</tpCarga>
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
  <infMDFeSupl>
    <qrCodMDFe>https://dfe-portal.svrs.rs.gov.br/mdfe/qrCode?chMDFe=${mdfe.chaveAcesso}&amp;tpAmb=${mdfe.tpAmb}</qrCodMDFe>
  </infMDFeSupl>
</MDFe>`;

  // ⚠️ XML sem assinatura digital. A assinatura real é aplicada por assinarXmlEnvelopado().

  return xml.trim();
}

// ============================================================
// EVENTOS DO MDF-e (MDFeRecepcaoEvento)
// ============================================================
// ⚠️ Diferente de NFe/CTe (envEvento > idLote > evento > infEvento), o layout
// 3.00 do MDF-e usa <eventoMDFe> como raiz do documento, sem o agrupador
// idLote/evento — conforme o Manual de Orientação do Contribuinte MDF-e.
// Valide contra o ambiente de homologação antes de usar em produção.

export function gerarXmlCancelamentoMdfe(params: {
  chaveAcessoMdfe: string;
  cnpjAutor: string;
  sequencialEvento: number;
  justificativa: string;
  protocoloAutorizacao: string;
  ambiente?: 1 | 2;
}): string {
  if (!/^[0-9]{44}$/.test(params.chaveAcessoMdfe)) {
    throw new Error('Chave de acesso do MDF-e inválida: deve ter 44 dígitos');
  }
  if (params.justificativa.length < 15 || params.justificativa.length > 255) {
    throw new Error('Justificativa deve ter entre 15 e 255 caracteres (TJust)');
  }
  if (!/^[0-9]{15}$/.test(params.protocoloAutorizacao) && !/^[0-9]{17}$/.test(params.protocoloAutorizacao)) {
    throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
  }

  const dhEvento = formatarDataHoraSefaz();
  const cnpjLimpo = limparDocumento(params.cnpjAutor);
  const nSeq = params.sequencialEvento.toString().padStart(2, '0');

  return `<?xml version="1.0" encoding="UTF-8"?>
<eventoMDFe xmlns="http://www.portalfiscal.inf.br/mdfe" versao="3.00">
  <infEvento Id="ID110111${params.chaveAcessoMdfe}${nSeq}">
    <cOrgao>${params.chaveAcessoMdfe.slice(0, 2)}</cOrgao>
    <tpAmb>${params.ambiente ?? 2}</tpAmb>
    <CNPJ>${cnpjLimpo}</CNPJ>
    <chMDFe>${params.chaveAcessoMdfe}</chMDFe>
    <dhEvento>${dhEvento}</dhEvento>
    <tpEvento>110111</tpEvento>
    <nSeqEvento>${params.sequencialEvento}</nSeqEvento>
    <detEvento versao="3.00">
      <evCancMDFe>
        <descEvento>Cancelamento</descEvento>
        <nProt>${params.protocoloAutorizacao}</nProt>
        <xJust>${escapeXml(params.justificativa)}</xJust>
      </evCancMDFe>
    </detEvento>
  </infEvento>
</eventoMDFe>`;
}

export function gerarXmlEncerramentoMdfe(params: {
  chaveAcessoMdfe: string;
  cnpjAutor: string;
  sequencialEvento: number;
  protocoloAutorizacao: string;
  codigoUFEncerramento: string;
  codigoMunicipioEncerramento: string;
  dataEncerramento?: string; // YYYY-MM-DD; padrão: hoje
  ambiente?: 1 | 2;
}): string {
  if (!/^[0-9]{44}$/.test(params.chaveAcessoMdfe)) {
    throw new Error('Chave de acesso do MDF-e inválida: deve ter 44 dígitos');
  }
  if (!/^[0-9]{15}$/.test(params.protocoloAutorizacao) && !/^[0-9]{17}$/.test(params.protocoloAutorizacao)) {
    throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
  }

  const dhEvento = formatarDataHoraSefaz();
  const cnpjLimpo = limparDocumento(params.cnpjAutor);
  const nSeq = params.sequencialEvento.toString().padStart(2, '0');
  const dtEnc = params.dataEncerramento || dhEvento.slice(0, 10);

  return `<?xml version="1.0" encoding="UTF-8"?>
<eventoMDFe xmlns="http://www.portalfiscal.inf.br/mdfe" versao="3.00">
  <infEvento Id="ID110112${params.chaveAcessoMdfe}${nSeq}">
    <cOrgao>${params.chaveAcessoMdfe.slice(0, 2)}</cOrgao>
    <tpAmb>${params.ambiente ?? 2}</tpAmb>
    <CNPJ>${cnpjLimpo}</CNPJ>
    <chMDFe>${params.chaveAcessoMdfe}</chMDFe>
    <dhEvento>${dhEvento}</dhEvento>
    <tpEvento>110112</tpEvento>
    <nSeqEvento>${params.sequencialEvento}</nSeqEvento>
    <detEvento versao="3.00">
      <evEncMDFe>
        <descEvento>Encerramento</descEvento>
        <nProt>${params.protocoloAutorizacao}</nProt>
        <dtEnc>${dtEnc}</dtEnc>
        <cUF>${params.codigoUFEncerramento}</cUF>
        <cMun>${params.codigoMunicipioEncerramento}</cMun>
      </evEncMDFe>
    </detEvento>
  </infEvento>
</eventoMDFe>`;
}