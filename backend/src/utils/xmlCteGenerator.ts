// backend/src/utils/xmlCteGenerator.ts
// Gerador de XML do CT-e (Conhecimento de Transporte Eletrônico), modelo 57, layout 4.00.
//
// Recebe o registro do CT-e já persistido no banco (com emitente/remetente/destinatario/
// expedidor/recebedor/transportadora/componentes/quantidades/documentos/duplicatas
// incluídos), pois os campos do schema Prisma já seguem os nomes oficiais do manual
// (CST00, vBC00, cUF, etc.), dispensando uma camada extra de DTO — mesmo padrão usado
// pelo gerador de XML do MDF-e neste projeto.
import { limparDocumento } from './cpfCnpjValidator.js';
import { formatarDataHoraSefaz } from './dataHoraSefaz.js';
import { CRT_POR_REGIME } from './fiscalMappers.js';

function escapeXml(str: unknown): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fmt(val: unknown, decimais = 2): string {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'string' ? parseFloat(val) : Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(decimais);
}

const MODAL_CODIGO: Record<string, string> = {
  RODOVIARIO: '01', AEREO: '02', AQUAVIARIO: '03', FERROVIARIO: '04', DUTOVIARIO: '05', MULTIMODAL: '06',
};
const TIPO_SERVICO_CODIGO: Record<string, string> = {
  NORMAL: '0', SUBCONTRATACAO: '1', REDESPACHO: '2', REDESPACHO_INTERMEDIARIO: '3', VINCULADO_MULTIMODAL: '4',
};
const TIPO_CTE_CODIGO: Record<string, string> = { NORMAL: '0', COMPLEMENTO_VALORES: '1', SUBSTITUICAO: '3' };
const TOMADOR_CODIGO: Record<string, string> = { REMETENTE: '0', EXPEDIDOR: '1', RECEBEDOR: '2', DESTINATARIO: '3', OUTROS: '4' };
const IND_IE_CODIGO: Record<string, string> = { CONTRIBUINTE: '1', ISENTO: '2', NAO_CONTRIBUINTE: '9' };

// Nomes reais dos elementos de endereço por tipo de pessoa (não seguem o padrão
// simples "ender"+Tag — em especial "rem" -> "enderReme", confirmado via
// rejeição real da SEFAZ).
const TAG_ENDERECO: Record<string, string> = {
  emit: 'enderEmit',
  rem: 'enderReme',
  exped: 'enderExped',
  receb: 'enderReceb',
  dest: 'enderDest',
};

// `enderEmit` usa o tipo TEndeEmi (diferente de TEndereco, usado por
// rem/exped/receb/dest): sem <cPais>/<xPais>, e com <fone> opcional no final —
// confirmado via rejeição real da SEFAZ (schema XML: "invalid child element
// 'cPais'... expected 'fone'").
function enderecoXml(tag: string, endereco: any, isEmit = false): string {
  if (!endereco) return '';
  return `<${tag}>
        <xLgr>${escapeXml(endereco.logradouro)}</xLgr>
        <nro>${escapeXml(endereco.numero)}</nro>
        ${endereco.complemento ? `<xCpl>${escapeXml(endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(endereco.bairro)}</xBairro>
        <cMun>${escapeXml(endereco.codigoMunicipio)}</cMun>
        <xMun>${escapeXml(endereco.nomeMunicipio)}</xMun>
        <CEP>${limparDocumento(endereco.cep || '')}</CEP>
        <UF>${escapeXml(endereco.uf)}</UF>
        ${isEmit
          ? (endereco.telefone ? `<fone>${limparDocumento(endereco.telefone)}</fone>` : '')
          : `${endereco.codigoPais ? `<cPais>${escapeXml(endereco.codigoPais)}</cPais>` : ''}
        ${endereco.nomePais ? `<xPais>${escapeXml(endereco.nomePais)}</xPais>` : ''}`}
      </${tag}>`;
}

function pessoaXml(tag: string, pessoa: any, tagIE = 'IE'): string {
  if (!pessoa) return '';
  const doc = limparDocumento(pessoa.cnpj || pessoa.documento || '');
  const isCnpj = doc.length === 14;
  // O grupo <emit> do CT-e 4.00 (diferente de rem/exped/receb/dest) não tem
  // <fone>/<email> e exige <CRT> logo após o endereço — confirmado via rejeição
  // real da SEFAZ (schema XML: "invalid child element 'fone'... expected 'enderEmit'").
  const isEmit = tag === 'emit';
  // Só o grupo <rem> tem <xFant>; exped/receb/dest não têm — confirmado via
  // rejeição real da SEFAZ. <dest> ainda tem um <ISUF> opcional (SUFRAMA) entre
  // fone e o endereço, que este sistema não coleta (por isso sempre omitido).
  const temXFant = tag === 'rem';
  return `<${tag}>
      ${isCnpj ? `<CNPJ>${doc}</CNPJ>` : `<CPF>${doc}</CPF>`}
      ${pessoa.inscricaoEstadual ? `<${tagIE}>${escapeXml(pessoa.inscricaoEstadual)}</${tagIE}>` : ''}
      <xNome>${escapeXml(pessoa.razaoSocial)}</xNome>
      ${temXFant && pessoa.nomeFantasia ? `<xFant>${escapeXml(pessoa.nomeFantasia)}</xFant>` : ''}
      ${!isEmit && pessoa.endereco?.telefone ? `<fone>${limparDocumento(pessoa.endereco.telefone)}</fone>` : ''}
      ${enderecoXml(TAG_ENDERECO[tag] ?? `ender${tag[0].toUpperCase()}${tag.slice(1)}`, pessoa.endereco, isEmit)}
      ${isEmit ? `<CRT>${CRT_POR_REGIME[pessoa.regimeTributario] ?? 3}</CRT>` : ''}
      ${!isEmit && pessoa.endereco?.email ? `<email>${escapeXml(pessoa.endereco.email)}</email>` : ''}
    </${tag}>`;
}

/**
 * Monta o grupo de tributação de ICMS (exatamente um dos grupos 00/20/45/60/90/SN/OutraUF
 * é preenchido por CT-e, conforme o regime do emitente e a operação).
 */
function blocoIcms(cte: any): string {
  if (cte.CST00) {
    return `<ICMS00>
          <CST>${escapeXml(cte.CST00)}</CST>
          <vBC>${fmt(cte.vBC00)}</vBC>
          <pICMS>${fmt(cte.pICMS00)}</pICMS>
          <vICMS>${fmt(cte.vICMS00)}</vICMS>
        </ICMS00>`;
  }
  if (cte.CST20) {
    return `<ICMS20>
          <CST>${escapeXml(cte.CST20)}</CST>
          <pRedBC>${fmt(cte.pRedBC20)}</pRedBC>
          <vBC>${fmt(cte.vBC20)}</vBC>
          <pICMS>${fmt(cte.pICMS20)}</pICMS>
          <vICMS>${fmt(cte.vICMS20)}</vICMS>
        </ICMS20>`;
  }
  if (cte.CST45) {
    return `<ICMS45>
          <CST>${escapeXml(cte.CST45)}</CST>
          ${cte.vICMSDeson45 ? `<vICMSDeson>${fmt(cte.vICMSDeson45)}</vICMSDeson>` : ''}
          ${cte.cBenef45 ? `<cBenef>${escapeXml(cte.cBenef45)}</cBenef>` : ''}
        </ICMS45>`;
  }
  if (cte.CST60) {
    return `<ICMS60>
          <CST>${escapeXml(cte.CST60)}</CST>
          <vBCSTRet>${fmt(cte.vBCSTRet)}</vBCSTRet>
          <vICMSSTRet>${fmt(cte.vICMSSTRet)}</vICMSSTRet>
          <pICMSSTRet>${fmt(cte.pICMSSTRet)}</pICMSSTRet>
          ${cte.vCred ? `<vCred>${fmt(cte.vCred)}</vCred>` : ''}
        </ICMS60>`;
  }
  if (cte.CST90) {
    return `<ICMS90>
          <CST>${escapeXml(cte.CST90)}</CST>
          <pRedBC>${fmt(cte.pRedBC90)}</pRedBC>
          <vBC>${fmt(cte.vBC90)}</vBC>
          <pICMS>${fmt(cte.pICMS90)}</pICMS>
          <vICMS>${fmt(cte.vICMS90)}</vICMS>
          ${cte.vCred90 ? `<vCred>${fmt(cte.vCred90)}</vCred>` : ''}
        </ICMS90>`;
  }
  if (cte.CSTOutraUF) {
    return `<ICMSOutraUF>
          <CSTOutraUF>${escapeXml(cte.CSTOutraUF)}</CSTOutraUF>
          <pRedBCOutraUF>${fmt(cte.pRedBCOutraUF)}</pRedBCOutraUF>
          <vBCOutraUF>${fmt(cte.vBCOutraUF)}</vBCOutraUF>
          <pICMSOutraUF>${fmt(cte.pICMSOutraUF)}</pICMSOutraUF>
          <vICMSOutraUF>${fmt(cte.vICMSOutraUF)}</vICMSOutraUF>
        </ICMSOutraUF>`;
  }
  if (cte.CSTSN) {
    return `<ICMSSN>
          <CST>${escapeXml(cte.CSTSN)}</CST>
          ${cte.indSN ? `<indSN>${escapeXml(cte.indSN)}</indSN>` : '<indSN>1</indSN>'}
        </ICMSSN>`;
  }
  throw new Error(
    'CT-e sem grupo de tributação de ICMS informado (CST00/20/45/60/90/OutraUF/SN) — obrigatório para gerar o XML'
  );
}

function blocoIbsCbs(cte: any): string {
  if (!cte.CSTIBSCBS) return '';
  return `
      <ICMSUFFim>
        ${cte.vBCUFFim ? `<vBCUFFim>${fmt(cte.vBCUFFim)}</vBCUFFim>` : ''}
        ${cte.pFCPUFFim ? `<pFCPUFFim>${fmt(cte.pFCPUFFim)}</pFCPUFFim>` : ''}
        ${cte.pICMSUFFim ? `<pICMSUFFim>${fmt(cte.pICMSUFFim)}</pICMSUFFim>` : ''}
        ${cte.pICMSInter ? `<pICMSInter>${fmt(cte.pICMSInter)}</pICMSInter>` : ''}
        ${cte.vFCPUFFim ? `<vFCPUFFim>${fmt(cte.vFCPUFFim)}</vFCPUFFim>` : ''}
        ${cte.vICMSUFFim ? `<vICMSUFFim>${fmt(cte.vICMSUFFim)}</vICMSUFFim>` : ''}
        ${cte.vICMSUFIni ? `<vICMSUFIni>${fmt(cte.vICMSUFIni)}</vICMSUFIni>` : ''}
      </ICMSUFFim>
      <IBSCBS>
        <CSTIBSCBS>${escapeXml(cte.CSTIBSCBS)}</CSTIBSCBS>
        ${cte.cClassTrib ? `<cClassTrib>${escapeXml(cte.cClassTrib)}</cClassTrib>` : ''}
        <gIBSCBS>
          <vBC>${fmt(cte.vBCIBS)}</vBC>
          <gIBSUF><pIBSUF>${fmt(cte.pIBSUF, 4)}</pIBSUF><vIBSUF>${fmt(cte.vIBSUF)}</vIBSUF></gIBSUF>
          <gIBSMun><pIBSMun>${fmt(cte.pIBSMun, 4)}</pIBSMun><vIBSMun>${fmt(cte.vIBSMun)}</vIBSMun></gIBSMun>
          <vIBS>${fmt(cte.vIBS)}</vIBS>
          <gCBS><pCBS>${fmt(cte.pCBS, 4)}</pCBS><vCBS>${fmt(cte.vCBS)}</vCBS></gCBS>
        </gIBSCBS>
      </IBSCBS>`;
}

/**
 * Monta o infModal específico do modal de transporte. Somente o modal rodoviário
 * (o mais comum) está implementado por completo: na versão 4.00 do layout, os dados
 * de veículo/condutor migraram para o MDF-e, então o CT-e rodoviário carrega apenas
 * o RNTRC do transportador (Transportadora.rntrc), ordens de coleta e lacres.
 * Os demais modais (aéreo/aquaviário/ferroviário/dutoviário/multimodal) têm schemas
 * próprios ainda não implementados aqui.
 */
function blocoInfModal(cte: any): string {
  const versaoModal = '4.00';

  if (cte.modal !== 'RODOVIARIO') {
    return `<!-- infModal do modal ${escapeXml(cte.modal)} ainda não implementado -->
      <infModal versaoModal="${versaoModal}">
      </infModal>`;
  }

  const rntrc = cte.transportadora?.rntrc || 'ISENTO';
  const ordensColeta: any[] = cte.ordensColeta || [];
  const lacres: any[] = cte.lacresRodo || [];

  return `<infModal versaoModal="${versaoModal}">
        <rodo>
          <RNTRC>${escapeXml(rntrc)}</RNTRC>
          ${ordensColeta.map((occ) => `
          <occ>
            ${occ.serie ? `<serie>${escapeXml(occ.serie)}</serie>` : ''}
            <nOcc>${escapeXml(occ.nOcc)}</nOcc>
            <dEmi>${occ.dEmi instanceof Date ? occ.dEmi.toISOString().slice(0, 10) : occ.dEmi}</dEmi>
            <emiOcc>
              <CNPJ>${limparDocumento(occ.emiCNPJ)}</CNPJ>
              ${occ.emiCInt ? `<cInt>${escapeXml(occ.emiCInt)}</cInt>` : ''}
              ${occ.emiIE ? `<IE>${escapeXml(occ.emiIE)}</IE>` : ''}
              <UF>${escapeXml(occ.emiUF)}</UF>
              ${occ.emiFone ? `<fone>${limparDocumento(occ.emiFone)}</fone>` : ''}
            </emiOcc>
          </occ>`).join('')}
          ${lacres.map((l) => `
          <lacRodo>
            <nLacre>${escapeXml(l.nLacre)}</nLacre>
          </lacRodo>`).join('')}
        </rodo>
      </infModal>`;
}

export function gerarXmlCte400(cte: any): string {
  if (!cte.chaveAcesso || !/^[0-9]{44}$/.test(cte.chaveAcesso)) {
    throw new Error('Chave de acesso do CT-e inválida: deve ter 44 dígitos');
  }

  const emitente = cte.emitente;
  const documentos: any[] = cte.documentos || [];
  const componentes: any[] = cte.componentes || [];
  const quantidades: any[] = cte.quantidades || [];
  const duplicatas: any[] = cte.duplicatas || [];
  const autXML: any[] = cte.autorizadosDownload || [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CTe xmlns="http://www.portalfiscal.inf.br/cte">
  <infCte Id="CTe${cte.chaveAcesso}" versao="${cte.versao || '4.00'}">
    <ide>
      <cUF>${escapeXml(cte.cUF)}</cUF>
      <cCT>${escapeXml(cte.cCT)}</cCT>
      <CFOP>${escapeXml(cte.CFOP)}</CFOP>
      <natOp>${escapeXml(cte.natOp)}</natOp>
      <mod>${escapeXml(cte.mod || '57')}</mod>
      <serie>${cte.serie}</serie>
      <nCT>${cte.nCT}</nCT>
      <dhEmi>${cte.dhEmi instanceof Date ? formatarDataHoraSefaz(cte.dhEmi) : cte.dhEmi}</dhEmi>
      <tpImp>${escapeXml(cte.tpImp || '1')}</tpImp>
      <tpEmis>${escapeXml(cte.tpEmis || '1')}</tpEmis>
      <cDV>${escapeXml(cte.cDV)}</cDV>
      <tpAmb>${escapeXml(cte.tpAmb || '1')}</tpAmb>
      <tpCTe>${TIPO_CTE_CODIGO[cte.tpCTe] ?? '0'}</tpCTe>
      ${cte.chCteSub ? `<chCTe>${escapeXml(cte.chCteSub)}</chCTe>` : ''}
      <procEmi>${escapeXml(cte.procEmi || '0')}</procEmi>
      <verProc>${escapeXml(cte.verProc || 'SUP-TECNOLOGIA-4.00')}</verProc>
      ${cte.indGlobalizado ? `<indGlobalizado>1</indGlobalizado>` : ''}
      <cMunEnv>${escapeXml(cte.cMunEnv)}</cMunEnv>
      <xMunEnv>${escapeXml(cte.xMunEnv)}</xMunEnv>
      <UFEnv>${escapeXml(cte.UFEnv)}</UFEnv>
      <modal>${MODAL_CODIGO[cte.modal] ?? '01'}</modal>
      <tpServ>${TIPO_SERVICO_CODIGO[cte.tpServ] ?? '0'}</tpServ>
      <cMunIni>${escapeXml(cte.cMunIni)}</cMunIni>
      <xMunIni>${escapeXml(cte.xMunIni)}</xMunIni>
      <UFIni>${escapeXml(cte.UFIni)}</UFIni>
      <cMunFim>${escapeXml(cte.cMunFim)}</cMunFim>
      <xMunFim>${escapeXml(cte.xMunFim)}</xMunFim>
      <UFFim>${escapeXml(cte.UFFim)}</UFFim>
      <retira>${escapeXml(cte.retira ?? '1')}</retira>
      ${cte.xDetRetira ? `<xDetRetira>${escapeXml(cte.xDetRetira)}</xDetRetira>` : ''}
      <indIEToma>${IND_IE_CODIGO[cte.indIEToma] ?? '9'}</indIEToma>
      ${cte.toma === 'OUTROS' ? `<toma4>
        <toma>4</toma>
        ${cte.tomadorCNPJ ? `<CNPJ>${limparDocumento(cte.tomadorCNPJ)}</CNPJ>` : ''}
        ${cte.tomadorCPF ? `<CPF>${limparDocumento(cte.tomadorCPF)}</CPF>` : ''}
        ${cte.tomadorIE ? `<IE>${escapeXml(cte.tomadorIE)}</IE>` : ''}
        <xNome>${escapeXml(cte.tomadorxNome)}</xNome>
        ${cte.tomadorxFant ? `<xFant>${escapeXml(cte.tomadorxFant)}</xFant>` : ''}
        ${cte.tomadorFone ? `<fone>${limparDocumento(cte.tomadorFone)}</fone>` : ''}
        <enderToma>
          <xLgr>${escapeXml(cte.tomadorxLgr)}</xLgr>
          <nro>${escapeXml(cte.tomadorNro)}</nro>
          ${cte.tomadorxCpl ? `<xCpl>${escapeXml(cte.tomadorxCpl)}</xCpl>` : ''}
          ${cte.tomadorxBairro ? `<xBairro>${escapeXml(cte.tomadorxBairro)}</xBairro>` : ''}
          <cMun>${escapeXml(cte.tomadorcMun)}</cMun>
          <xMun>${escapeXml(cte.tomadorxMun)}</xMun>
          <CEP>${limparDocumento(cte.tomadorCEP || '')}</CEP>
          <UF>${escapeXml(cte.tomadorUF)}</UF>
          ${cte.tomadorcPais ? `<cPais>${escapeXml(cte.tomadorcPais)}</cPais>` : ''}
          ${cte.tomadorxPais ? `<xPais>${escapeXml(cte.tomadorxPais)}</xPais>` : ''}
        </enderToma>
        ${cte.tomadorEmail ? `<email>${escapeXml(cte.tomadorEmail)}</email>` : ''}
      </toma4>` : `<toma3>
        <toma>${TOMADOR_CODIGO[cte.toma] ?? '0'}</toma>
      </toma3>`}
    </ide>

    <!-- COMPLEMENTO -->
    ${cte.xCaracAd || cte.xCaracSer || cte.xEmi || cte.xObs ? `
    <compl>
      ${cte.xCaracAd ? `<xCaracAd>${escapeXml(cte.xCaracAd)}</xCaracAd>` : ''}
      ${cte.xCaracSer ? `<xCaracSer>${escapeXml(cte.xCaracSer)}</xCaracSer>` : ''}
      ${cte.xEmi ? `<xEmi>${escapeXml(cte.xEmi)}</xEmi>` : ''}
      ${cte.xObs ? `<xObs>${escapeXml(cte.xObs)}</xObs>` : ''}
    </compl>` : ''}

    <!-- EMITENTE -->
    ${pessoaXml('emit', {
      cnpj: emitente?.cnpj,
      inscricaoEstadual: emitente?.inscricaoEstadual,
      razaoSocial: emitente?.razaoSocial,
      nomeFantasia: emitente?.nomeFantasia,
      endereco: emitente?.endereco,
      regimeTributario: emitente?.regimeTributario,
    })}

    <!-- REMETENTE -->
    ${cte.remetente ? pessoaXml('rem', { ...cte.remetente, cnpj: cte.remetente.documento }, 'IE') : ''}

    <!-- EXPEDIDOR -->
    ${cte.expedidor ? pessoaXml('exped', { ...cte.expedidor, cnpj: cte.expedidor.documento }, 'IE') : ''}

    <!-- RECEBEDOR -->
    ${cte.recebedor ? pessoaXml('receb', { ...cte.recebedor, cnpj: cte.recebedor.documento }, 'IE') : ''}

    <!-- DESTINATARIO -->
    ${cte.destinatario ? pessoaXml('dest', { ...cte.destinatario, cnpj: cte.destinatario.documento }, 'IE') : ''}

    <!-- VALORES DA PRESTACAO -->
    <vPrest>
      <vTPrest>${fmt(cte.vTPrest)}</vTPrest>
      <vRec>${fmt(cte.vRec)}</vRec>
      ${componentes.map((c) => `
      <Comp>
        <xNome>${escapeXml(c.xNome)}</xNome>
        <vComp>${fmt(c.vComp)}</vComp>
      </Comp>`).join('')}
    </vPrest>

    <!-- IMPOSTO -->
    <imp>
      <ICMS>
        ${blocoIcms(cte)}
      </ICMS>
      ${blocoIbsCbs(cte)}
      ${cte.vTotDFe ? `<vTotDFe>${fmt(cte.vTotDFe)}</vTotDFe>` : ''}
      ${cte.infAdFisco ? `<infAdFisco>${escapeXml(cte.infAdFisco)}</infAdFisco>` : ''}
    </imp>

    <!-- INFORMACOES DO CTE NORMAL -->
    <infCTeNorm>
      <infCarga>
        ${cte.vCarga ? `<vCarga>${fmt(cte.vCarga)}</vCarga>` : ''}
        <proPred>${escapeXml(cte.proPred)}</proPred>
        ${cte.xOutCat ? `<xOutCat>${escapeXml(cte.xOutCat)}</xOutCat>` : ''}
        ${quantidades.map((q) => `
        <infQ>
          <cUnid>${escapeXml(q.cUnid)}</cUnid>
          <tpMed>${escapeXml(q.tpMed)}</tpMed>
          <qCarga>${fmt(q.qCarga, 4)}</qCarga>
        </infQ>`).join('')}
      </infCarga>
      ${documentos.length > 0 ? `<infDoc>
        ${documentos.map((doc) => {
          if (doc.tipo === 'NFe') {
            return `
        <infNFe>
          <chave>${escapeXml(doc.chave)}</chave>
          ${doc.PIN ? `<PIN>${escapeXml(doc.PIN)}</PIN>` : ''}
        </infNFe>`;
          }
          if (doc.tipo === 'NF') {
            return `
        <infNF>
          ${doc.serie ? `<serie>${escapeXml(doc.serie)}</serie>` : ''}
          <nDoc>${escapeXml(doc.nDoc)}</nDoc>
          ${doc.dEmi ? `<dEmi>${doc.dEmi instanceof Date ? doc.dEmi.toISOString().slice(0, 10) : doc.dEmi}</dEmi>` : ''}
          <vBC>${fmt(doc.vBC)}</vBC>
          <vICMS>${fmt(doc.vICMS)}</vICMS>
          <vBCST>${fmt(doc.vBCST)}</vBCST>
          <vST>${fmt(doc.vST)}</vST>
          <vProd>${fmt(doc.vProd)}</vProd>
          <vNF>${fmt(doc.vNF)}</vNF>
          ${doc.nCFOP ? `<nCFOP>${escapeXml(doc.nCFOP)}</nCFOP>` : ''}
          ${doc.nPeso ? `<nPeso>${fmt(doc.nPeso, 3)}</nPeso>` : ''}
        </infNF>`;
          }
          return `
        <infOutros>
          <tpDoc>${escapeXml(doc.tpDoc)}</tpDoc>
          ${doc.descOutros ? `<descOutros>${escapeXml(doc.descOutros)}</descOutros>` : ''}
          <nDoc>${escapeXml(doc.nDoc)}</nDoc>
          ${doc.dEmi ? `<dEmi>${doc.dEmi instanceof Date ? doc.dEmi.toISOString().slice(0, 10) : doc.dEmi}</dEmi>` : ''}
          ${doc.vDocFisc ? `<vDocFisc>${fmt(doc.vDocFisc)}</vDocFisc>` : ''}
        </infOutros>`;
        }).join('')}
      </infDoc>` : ''}
      ${blocoInfModal(cte)}
      <!-- COBRANCA (dentro de infCTeNorm, não é irmã dele) -->
      ${duplicatas.length > 0 || cte.nFat ? `
      <cobr>
        ${cte.nFat ? `
        <fat>
          <nFat>${escapeXml(cte.nFat)}</nFat>
          ${cte.vOrig ? `<vOrig>${fmt(cte.vOrig)}</vOrig>` : ''}
          ${cte.vDesc ? `<vDesc>${fmt(cte.vDesc)}</vDesc>` : ''}
          ${cte.vLiq ? `<vLiq>${fmt(cte.vLiq)}</vLiq>` : ''}
        </fat>` : ''}
        ${duplicatas.map((d) => `
        <dup>
          <nDup>${escapeXml(d.nDup)}</nDup>
          <dVenc>${d.dVenc instanceof Date ? d.dVenc.toISOString().slice(0, 10) : d.dVenc}</dVenc>
          <vDup>${fmt(d.vDup)}</vDup>
        </dup>`).join('')}
      </cobr>` : ''}
    </infCTeNorm>

    ${autXML.length > 0 ? autXML.map((a) => `
    <autXML>
      ${a.CNPJ ? `<CNPJ>${limparDocumento(a.CNPJ)}</CNPJ>` : ''}
      ${a.CPF ? `<CPF>${limparDocumento(a.CPF)}</CPF>` : ''}
    </autXML>`).join('') : ''}
  </infCte>
</CTe>`;

  // ⚠️ XML sem assinatura digital. A assinatura real é aplicada por assinarXmlEnvelopado()
  // (elemento assinado: infCte). O bloco infModal ainda é um placeholder (ver comentário acima).
  return xml.trim();
}

// ============================================================
// EVENTO DE CANCELAMENTO (CTeRecepcaoEventoV4)
// ============================================================

export function gerarXmlCancelamentoCte(params: {
  chaveAcessoCte: string;
  cnpjAutor: string;
  sequencialEvento: number;
  justificativa: string;
  protocoloAutorizacao: string;
  ambiente?: 1 | 2;
}): string {
  if (!/^[0-9]{44}$/.test(params.chaveAcessoCte)) {
    throw new Error('Chave de acesso do CT-e inválida: deve ter 44 dígitos');
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
<envEvento xmlns="http://www.portalfiscal.inf.br/cte" versao="4.00">
  <idLote>1</idLote>
  <evento versao="4.00">
    <infEvento Id="ID110111${params.chaveAcessoCte}${nSeq}">
      <cOrgao>${params.chaveAcessoCte.slice(0, 2)}</cOrgao>
      <tpAmb>${params.ambiente ?? 2}</tpAmb>
      <CNPJ>${cnpjLimpo}</CNPJ>
      <chCTe>${params.chaveAcessoCte}</chCTe>
      <dhEvento>${dhEvento}</dhEvento>
      <tpEvento>110111</tpEvento>
      <nSeqEvento>${params.sequencialEvento}</nSeqEvento>
      <verEvento>4.00</verEvento>
      <detEvento versao="4.00">
        <evCancCTe>
          <descEvento>Cancelamento</descEvento>
          <nProt>${params.protocoloAutorizacao}</nProt>
          <xJust>${escapeXml(params.justificativa)}</xJust>
        </evCancCTe>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
}
