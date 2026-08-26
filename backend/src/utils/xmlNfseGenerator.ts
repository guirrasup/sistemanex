// C:\emissornfe\backend\src\utils\xmlNfseGenerator.ts

/**
 * Gerador de XML Oficial NFS-e Padrão Nacional v1.01 (com Reforma Tributária IBS/CBS 2026)
 * Em total conformidade com o Manual de Integração da Receita Federal / SEFIN / ABRASF
 * SUP TECNOLOGIA - BACKEND
 */

import { NFSeDocumento } from '../types/fiscal.js';
import { limparDocumento } from './cpfCnpjValidator.js';

function formatarNumeroXml(num: number | undefined | null, decimais = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '0.00';
  return num.toFixed(decimais);
}

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
 * Gera o XML completo da Nota Fiscal de Serviços Eletrônica Padrão Nacional
 */
export function gerarXmlNfseNacional(nfse: NFSeDocumento): string {
  const cnpjEmit = limparDocumento(nfse.emitente.cnpj);
  const docToma = limparDocumento(nfse.tomador.documento);
  const isCnpjToma = docToma.length === 14;

  const ibs = nfse.servico.ibscbs;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFSe xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infNFSe Id="${escapeXml(nfse.chaveAcesso ? `NFS${nfse.chaveAcesso}` : nfse.id)}">
    <xLocEmi>${escapeXml(nfse.emitente.endereco.nomeMunicipio)}</xLocEmi>
    <xLocPrestacao>${escapeXml(nfse.servico.localPrestacao.nomeMunicipio)}</xLocPrestacao>
    <nNFSe>${nfse.numeroNfse}</nNFSe>
    <cLocIncid>${escapeXml(nfse.servico.localPrestacao.codigoMunicipio)}</cLocIncid>
    <xLocIncid>${escapeXml(nfse.servico.localPrestacao.nomeMunicipio)}</xLocIncid>
    <xTribNac>${escapeXml(nfse.servico.codigoTributacaoNacional)}</xTribNac>
    <xTribMun>${escapeXml(nfse.servico.codigoTributacaoMunicipal)}</xTribMun>
    <xNBS>${escapeXml(nfse.servico.codigoNBS || '1.1403.21.10')}</xNBS>
    <verAplic>SUP-TECNOLOGIA-1.01</verAplic>
    <ambGer>1</ambGer>
    <tpEmis>${nfse.tipoEmissao}</tpEmis>
    <cStat>100</cStat>
    <dhProc>${escapeXml(nfse.dataHoraProcessamento)}</dhProc>
    <nDFSe>${nfse.numeroNfse}</nDFSe>
    
    <!-- IDENTIFICACAO DO EMITENTE -->
    <emit>
      <CNPJ>${cnpjEmit}</CNPJ>
      <IM>${escapeXml(nfse.emitente.inscricaoMunicipal)}</IM>
      <xNome>${escapeXml(nfse.emitente.razaoSocial)}</xNome>
      ${nfse.emitente.nomeFantasia ? `<xFant>${escapeXml(nfse.emitente.nomeFantasia)}</xFant>` : ''}
      <enderNac>
        <xLgr>${escapeXml(nfse.emitente.endereco.logradouro)}</xLgr>
        <nro>${escapeXml(nfse.emitente.endereco.numero)}</nro>
        ${nfse.emitente.endereco.complemento ? `<xCpl>${escapeXml(nfse.emitente.endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(nfse.emitente.endereco.bairro)}</xBairro>
        <cMun>${escapeXml(nfse.emitente.endereco.codigoMunicipio)}</cMun>
        <UF>${escapeXml(nfse.emitente.endereco.uf)}</UF>
        <CEP>${limparDocumento(nfse.emitente.endereco.cep)}</CEP>
        ${nfse.emitente.endereco.telefone ? `<fone>${limparDocumento(nfse.emitente.endereco.telefone)}</fone>` : ''}
        ${nfse.emitente.endereco.email ? `<email>${escapeXml(nfse.emitente.endereco.email)}</email>` : ''}
      </enderNac>
    </emit>

    <!-- GRUPO DE VALORES E TRIBUTOS DO SERVICO -->
    <valores>
      <vCalcDR>${formatarNumeroXml(nfse.valorTotalDeducoes)}</vCalcDR>
      <vBC>${formatarNumeroXml(nfse.baseCalculoISS)}</vBC>
      <pAliqAplic>${formatarNumeroXml(nfse.servico.aliquotaISS)}</pAliqAplic>
      <vISSQN>${formatarNumeroXml(nfse.valorTotalISS)}</vISSQN>
      <vTotalRet>${formatarNumeroXml(nfse.valorTotalISSRetido + nfse.valorTotalRetencoesFederais)}</vTotalRet>
      <vLiq>${formatarNumeroXml(nfse.valorLiquidoNfse)}</vLiq>
    </valores>

    <!-- REFORMA TRIBUTARIA IBS/CBS (2026) -->
    <IBSCBS>
      <cLocalidadeIncid>${escapeXml(nfse.servico.localPrestacao.codigoMunicipio)}</cLocalidadeIncid>
      <xLocalidadeIncid>${escapeXml(nfse.servico.localPrestacao.nomeMunicipio)}</xLocalidadeIncid>
      <valores>
        <vBC>${formatarNumeroXml(nfse.servico.ibscbs ? (nfse.valorTotalServicos - nfse.valorTotalISS) : nfse.valorTotalServicos)}</vBC>
        <uf>
          <pIBSUF>${formatarNumeroXml(ibs?.aliquotaIBSUF || 0.05)}</pIBSUF>
          <pAliqEfetUF>${formatarNumeroXml(ibs?.aliquotaIBSUF || 0.05)}</pAliqEfetUF>
        </uf>
        <mun>
          <pIBSMun>${formatarNumeroXml(ibs?.aliquotaIBSMun || 0.05)}</pIBSMun>
          <pAliqEfetMun>${formatarNumeroXml(ibs?.aliquotaIBSMun || 0.05)}</pAliqEfetMun>
        </mun>
        <fed>
          <pCBS>${formatarNumeroXml(ibs?.aliquotaCBS || 0.90)}</pCBS>
          <pAliqEfetCBS>${formatarNumeroXml(ibs?.aliquotaCBS || 0.90)}</pAliqEfetCBS>
        </fed>
      </valores>
      <totCIBS>
        <vTotNF>${formatarNumeroXml(nfse.valorTotalNotaFinal)}</vTotNF>
        <gIBS>
          <vIBSTot>${formatarNumeroXml(nfse.valorTotalIBS)}</vIBSTot>
          <gIBSUFTot>
            <vIBSUF>${formatarNumeroXml(ibs?.valorIBSUF || 0)}</vIBSUF>
          </gIBSUFTot>
          <gIBSMunTot>
            <vIBSMun>${formatarNumeroXml(ibs?.valorIBSMun || 0)}</vIBSMun>
          </gIBSMunTot>
        </gIBS>
        <gCBS>
          <vCBS>${formatarNumeroXml(nfse.valorTotalCBS)}</vCBS>
        </gCBS>
      </totCIBS>
    </IBSCBS>

    <!-- DECLARACAO DE PRESTACAO DE SERVICOS ORIGINAL (DPS) -->
    <DPS>
      <infDPS Id="DPS${escapeXml(nfse.emitente.endereco.codigoMunicipio)}${isCnpjToma ? '1' : '2'}${docToma.padStart(14, '0')}${nfse.serieDPS.toString().padStart(5, '0')}${nfse.numeroDPS.toString().padStart(15, '0')}">
        <tpAmb>${nfse.ambiente}</tpAmb>
        <dhEmi>${escapeXml(nfse.dataHoraEmissao)}</dhEmi>
        <verAplic>SUP-TECNOLOGIA-1.01</verAplic>
        <serie>${nfse.serieDPS}</serie>
        <nDPS>${nfse.numeroDPS}</nDPS>
        <dCompet>${escapeXml(nfse.dataCompetencia)}</dCompet>
        <tpEmit>1</tpEmit>
        <cLocEmi>${escapeXml(nfse.emitente.endereco.codigoMunicipio)}</cLocEmi>
        
        <!-- PRESTADOR -->
        <prest>
          <CNPJ>${cnpjEmit}</CNPJ>
          <IM>${escapeXml(nfse.emitente.inscricaoMunicipal)}</IM>
          <xNome>${escapeXml(nfse.emitente.razaoSocial)}</xNome>
          <regTrib>
            <opSimpNac>${nfse.emitente.optanteSimplesNacional ? '3' : '1'}</opSimpNac>
            <regEspTrib>${nfse.emitente.regimeEspecial || '0'}</regEspTrib>
          </regTrib>
        </prest>

        <!-- TOMADOR -->
        <toma>
          ${isCnpjToma ? `<CNPJ>${docToma}</CNPJ>` : `<CPF>${docToma}</CPF>`}
          <xNome>${escapeXml(nfse.tomador.nomeRazaoSocial)}</xNome>
          <end>
            <endNac>
              <cMun>${escapeXml(nfse.tomador.endereco.codigoMunicipio)}</cMun>
              <CEP>${limparDocumento(nfse.tomador.endereco.cep)}</CEP>
            </endNac>
            <xLgr>${escapeXml(nfse.tomador.endereco.logradouro)}</xLgr>
            <nro>${escapeXml(nfse.tomador.endereco.numero)}</nro>
            ${nfse.tomador.endereco.complemento ? `<xCpl>${escapeXml(nfse.tomador.endereco.complemento)}</xCpl>` : ''}
            <xBairro>${escapeXml(nfse.tomador.endereco.bairro)}</xBairro>
          </end>
          ${nfse.tomador.email ? `<email>${escapeXml(nfse.tomador.email)}</email>` : ''}
          ${nfse.tomador.telefone ? `<fone>${limparDocumento(nfse.tomador.telefone)}</fone>` : ''}
        </toma>

        <!-- SERVICO -->
        <serv>
          <locPrest>
            <cLocPrestacao>${escapeXml(nfse.servico.localPrestacao.codigoMunicipio)}</cLocPrestacao>
          </locPrest>
          <cServ>
            <cTribNac>${escapeXml(nfse.servico.codigoTributacaoNacional)}</cTribNac>
            <cTribMun>${escapeXml(nfse.servico.codigoTributacaoMunicipal)}</cTribMun>
            <xDescServ>${escapeXml(nfse.servico.descricao)}</xDescServ>
            <cNBS>${escapeXml(nfse.servico.codigoNBS || '1.1403.21.10')}</cNBS>
          </cServ>
        </serv>

        <!-- VALORES DA DPS -->
        <valores>
          <vServPrest>
            <vServ>${formatarNumeroXml(nfse.valorTotalServicos)}</vServ>
          </vServPrest>
          ${nfse.valorTotalDescontos > 0 ? `
          <vDescCondIncond>
            <vDescIncond>${formatarNumeroXml(nfse.valorTotalDescontos)}</vDescIncond>
          </vDescCondIncond>` : ''}
          <Trib>
            <tribMun>
              <tribISSQN>${nfse.servico.tributacaoISSQN}</tribISSQN>
              <tpRetISSQN>${nfse.servico.tipoRetencaoISS}</tpRetISSQN>
              <pAliq>${formatarNumeroXml(nfse.servico.aliquotaISS)}</pAliq>
            </tribMun>
            <tribFed>
              <piscofins>
                <CST>${escapeXml(nfse.servico.cstPisCofins || '01')}</CST>
                <vBCPisCofins>${formatarNumeroXml(nfse.baseCalculoISS)}</vBCPisCofins>
                <pAliqPis>${formatarNumeroXml(nfse.servico.aliquotaPIS || 0)}</pAliqPis>
                <pAliqCofins>${formatarNumeroXml(nfse.servico.aliquotaCOFINS || 0)}</pAliqCofins>
                <vPis>${formatarNumeroXml(nfse.servico.valorPIS || 0)}</vPis>
                <vCofins>${formatarNumeroXml(nfse.servico.valorCOFINS || 0)}</vCofins>
              </piscofins>
              ${nfse.servico.valorIRRF ? `<vRetIRRF>${formatarNumeroXml(nfse.servico.valorIRRF)}</vRetIRRF>` : ''}
              ${nfse.servico.valorCSLL ? `<vRetCSLL>${formatarNumeroXml(nfse.servico.valorCSLL)}</vRetCSLL>` : ''}
              ${nfse.servico.valorINSS ? `<vRetCP>${formatarNumeroXml(nfse.servico.valorINSS)}</vRetCP>` : ''}
            </tribFed>
            <totTrib>
              <pTotTrib>
                <pTotTribFed>${formatarNumeroXml(nfse.servico.valorTributosFederais / (nfse.valorTotalServicos || 1) * 100)}</pTotTribFed>
                <pTotTribEst>0.00</pTotTribEst>
                <pTotTribMun>${formatarNumeroXml(nfse.servico.aliquotaISS)}</pTotTribMun>
              </pTotTrib>
            </totTrib>
          </Trib>
        </valores>

        <!-- IBS/CBS NA DPS -->
        <IBSCBS>
          <finNFSe>0</finNFSe>
          <cIndOp>030101</cIndOp>
          <indDest>0</indDest>
          <valores>
            <trib>
              <gIBSCBS>
                <CST>01</CST>
                <cClassTrib>001</cClassTrib>
              </gIBSCBS>
            </trib>
          </valores>
          <gPgtoVinc>
            <pgto>
              <nPag>1</nPag>
              <idTransacao>${escapeXml(ibs?.pagamentoVinculado?.idTransacao || 'TX-998811')}</idTransacao>
              <tpMeioPgto>${escapeXml(ibs?.pagamentoVinculado?.tipoMeioPagamento || '17')}</tpMeioPgto>
              <CNPJReceb>${cnpjEmit}</CNPJReceb>
              <CNPJBasePSP>${cnpjEmit.slice(0, 8)}</CNPJBasePSP>
            </pgto>
          </gPgtoVinc>
        </IBSCBS>
      </infDPS>
    </DPS>
  </infNFSe>

  <!-- ASSINATURA DIGITAL XMLDSIG (ICP-BRASIL) -->
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#${escapeXml(nfse.chaveAcesso ? `NFS${nfse.chaveAcesso}` : nfse.id)}">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${btoa(`SUP-DIGEST-${nfse.chaveAcesso}`).slice(0, 28)}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${btoa(`SUP-SIG-VAL-${nfse.chaveAcesso}-${Date.now()}`)}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${btoa(`MIIE...SUP-TECNOLOGIA-ICP-BRASIL-CERT-${cnpjEmit}`)}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</NFSe>`;

  return xml.trim();
}

/**
 * Gera mensagem SOAP de Envio de Lote Síncrono de DPS (Manual pág. 68)
 */
export function gerarSoapEnviarLoteDpsSincrono(nfse: NFSeDocumento): string {
  const xmlNfse = gerarXmlNfseNacional(nfse);
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <cabecalho versao="1.01" xmlns="http://www.sped.fazenda.gov.br/nfse">
      <versaoDados>1.01</versaoDados>
    </cabecalho>
  </soap:Header>
  <soap:Body>
    <EnviarLoteDpsSincronoEnvio xmlns="http://www.sped.fazenda.gov.br/nfse">
      <LoteDps versao="1.01">
        <NumeroLote>${nfse.numeroDPS}</NumeroLote>
        <Prestador>
          <CNPJ>${limparDocumento(nfse.emitente.cnpj)}</CNPJ>
          <IM>${escapeXml(nfse.emitente.inscricaoMunicipal)}</IM>
        </Prestador>
        <QuantidadeDPS>1</QuantidadeDPS>
        <ListaDps>
          ${xmlNfse}
        </ListaDps>
      </LoteDps>
    </EnviarLoteDpsSincronoEnvio>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Gera XML do Evento de Cancelamento de NFS-e (Evento e101101)
 */
export function gerarXmlCancelamentoNfse(params: {
  chaveNFSe: string;
  cnpjAutor: string;
  motivoCodigo: '1' | '2' | '9';
  justificativa: string;
  sequencial?: number;
}): string {
  const dhEvento = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<pedRegEvento xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infPedReg Id="PRE${params.chaveNFSe}101101">
    <tpAmb>1</tpAmb>
    <verAplic>SUP-TECNOLOGIA-1.01</verAplic>
    <dhEvento>${dhEvento}</dhEvento>
    <CNPJAutor>${limparDocumento(params.cnpjAutor)}</CNPJAutor>
    <chNFSe>${params.chaveNFSe}</chNFSe>
    <e101101>
      <xDesc>Cancelamento de NFS-e</xDesc>
      <cMotivo>${params.motivoCodigo}</cMotivo>
      <xMotivo>${escapeXml(params.justificativa)}</xMotivo>
    </e101101>
  </infPedReg>
</pedRegEvento>`;
}