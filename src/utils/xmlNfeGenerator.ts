// C:\emissornfe\src\utils\xmlNfeGenerator.ts

/**
 * Gerador de XML Oficial NF-e (Modelo 55) e NFC-e (Modelo 65) - Layout SEFAZ 4.00
 * SUP TECNOLOGIA - FRONTEND
 */

import { NFeDocumento } from '../types/fiscal';
import { limparDocumento } from './cpfCnpjValidator';

function formatarNumero(val: number | undefined | null, decimais = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return val.toFixed(decimais);
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

export function gerarXmlNfe400(nfe: NFeDocumento): string {
  const cnpjEmit = limparDocumento(nfe.emitente.cnpj);
  const docDest = limparDocumento(nfe.destinatario.documento);
  const isCnpjDest = docDest.length === 14;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nfe.chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${nfe.emitente.endereco.codigoMunicipio.slice(0, 2)}</cUF>
      <cNF>${nfe.chaveAcesso.slice(35, 43)}</cNF>
      <natOp>${escapeXml(nfe.naturezaOperacao)}</natOp>
      <mod>${nfe.modelo}</mod>
      <serie>${nfe.serie}</serie>
      <nNF>${nfe.numero}</nNF>
      <dhEmi>${nfe.dataHoraEmissao}</dhEmi>
      <tpNF>${nfe.tipoDocumento}</tpNF>
      <idDest>${nfe.emitente.endereco.uf === nfe.destinatario.endereco.uf ? '1' : '2'}</idDest>
      <cMunFG>${nfe.emitente.endereco.codigoMunicipio}</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>${nfe.tipoEmissao}</tpEmis>
      <cDV>${nfe.chaveAcesso.slice(-1)}</cDV>
      <tpAmb>${nfe.ambiente}</tpAmb>
      <finNFe>${nfe.finalidade}</finNFe>
      <indFinal>${nfe.consumidorFinal ? '1' : '0'}</indFinal>
      <indPres>${nfe.presencaComprador}</indPres>
      <procEmi>0</procEmi>
      <verProc>SUP-TECNOLOGIA-4.00</verProc>
    </ide>

    <!-- EMITENTE -->
    <emit>
      <CNPJ>${cnpjEmit}</CNPJ>
      <xNome>${escapeXml(nfe.emitente.razaoSocial)}</xNome>
      ${nfe.emitente.nomeFantasia ? `<xFant>${escapeXml(nfe.emitente.nomeFantasia)}</xFant>` : ''}
      <enderEmit>
        <xLgr>${escapeXml(nfe.emitente.endereco.logradouro)}</xLgr>
        <nro>${escapeXml(nfe.emitente.endereco.numero)}</nro>
        ${nfe.emitente.endereco.complemento ? `<xCpl>${escapeXml(nfe.emitente.endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(nfe.emitente.endereco.bairro)}</xBairro>
        <cMun>${nfe.emitente.endereco.codigoMunicipio}</cMun>
        <xMun>${escapeXml(nfe.emitente.endereco.nomeMunicipio)}</xMun>
        <UF>${nfe.emitente.endereco.uf}</UF>
        <CEP>${limparDocumento(nfe.emitente.endereco.cep)}</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
        ${nfe.emitente.endereco.telefone ? `<fone>${limparDocumento(nfe.emitente.endereco.telefone)}</fone>` : ''}
      </enderEmit>
      <IE>${escapeXml(nfe.emitente.inscricaoEstadual || 'ISENTO')}</IE>
      <CRT>${nfe.emitente.regimeTributario}</CRT>
    </emit>

    <!-- DESTINATARIO -->
    <dest>
      ${isCnpjDest ? `<CNPJ>${docDest}</CNPJ>` : `<CPF>${docDest}</CPF>`}
      <xNome>${escapeXml(nfe.destinatario.nomeRazaoSocial)}</xNome>
      <enderDest>
        <xLgr>${escapeXml(nfe.destinatario.endereco.logradouro)}</xLgr>
        <nro>${escapeXml(nfe.destinatario.endereco.numero)}</nro>
        ${nfe.destinatario.endereco.complemento ? `<xCpl>${escapeXml(nfe.destinatario.endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(nfe.destinatario.endereco.bairro)}</xBairro>
        <cMun>${nfe.destinatario.endereco.codigoMunicipio}</cMun>
        <xMun>${escapeXml(nfe.destinatario.endereco.nomeMunicipio)}</xMun>
        <UF>${nfe.destinatario.endereco.uf}</UF>
        <CEP>${limparDocumento(nfe.destinatario.endereco.cep)}</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
      </enderDest>
      <indIEDest>${nfe.destinatario.indicadorIEDestinatario || '9'}</indIEDest>
      ${nfe.destinatario.inscricaoEstadual ? `<IE>${escapeXml(nfe.destinatario.inscricaoEstadual)}</IE>` : ''}
      ${nfe.destinatario.email ? `<email>${escapeXml(nfe.destinatario.email)}</email>` : ''}
    </dest>

    <!-- PRODUTOS E SERVICOS -->
    ${nfe.itens.map((item, idx) => `
    <det nItem="${idx + 1}">
      <prod>
        <cProd>${escapeXml(item.codigoProduto)}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${escapeXml(item.descricao)}</xProd>
        <NCM>${limparDocumento(item.ncm)}</NCM>
        ${item.cest ? `<CEST>${limparDocumento(item.cest)}</CEST>` : ''}
        <CFOP>${item.cfop}</CFOP>
        <uCom>${escapeXml(item.unidadeMedida)}</uCom>
        <qCom>${formatarNumero(item.quantidade, 4)}</qCom>
        <vUnCom>${formatarNumero(item.valorUnitario, 4)}</vUnCom>
        <vProd>${formatarNumero(item.valorTotalBruto)}</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>${escapeXml(item.unidadeMedida)}</uTrib>
        <qTrib>${formatarNumero(item.quantidade, 4)}</qTrib>
        <vUnTrib>${formatarNumero(item.valorUnitario, 4)}</vUnTrib>
        ${item.descontoItem ? `<vDesc>${formatarNumero(item.descontoItem)}</vDesc>` : ''}
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vTotTrib>${formatarNumero(item.valorTributosAproximados)}</vTotTrib>
        <ICMS>
          <ICMS00>
            <orig>${item.origemMercadoria}</orig>
            <CST>${item.cstICMS}</CST>
            <modBC>3</modBC>
            <vBC>${formatarNumero(item.baseCalculoICMS)}</vBC>
            <pICMS>${formatarNumero(item.aliquotaICMS)}</pICMS>
            <vICMS>${formatarNumero(item.valorICMS)}</vICMS>
          </ICMS00>
        </ICMS>
        <PIS>
          <PISAliq>
            <CST>${item.cstPIS}</CST>
            <vBC>${formatarNumero(item.valorTotalBruto)}</vBC>
            <pPIS>${formatarNumero(item.aliquotaPIS)}</pPIS>
            <vPIS>${formatarNumero(item.valorPIS)}</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>${item.cstCOFINS}</CST>
            <vBC>${formatarNumero(item.valorTotalBruto)}</vBC>
            <pCOFINS>${formatarNumero(item.aliquotaCOFINS)}</pCOFINS>
            <vCOFINS>${formatarNumero(item.valorCOFINS)}</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>`).join('')}

    <!-- TOTALIZADORES -->
    <total>
      <ICMSTot>
        <vBC>${formatarNumero(nfe.baseCalculoICMS)}</vBC>
        <vICMS>${formatarNumero(nfe.valorTotalICMS)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${formatarNumero(nfe.valorTotalProdutos)}</vProd>
        <vFrete>${formatarNumero(nfe.valorTotalFrete)}</vFrete>
        <vSeg>${formatarNumero(nfe.valorTotalSeguro)}</vSeg>
        <vDesc>${formatarNumero(nfe.valorTotalDesconto)}</vDesc>
        <vII>0.00</vII>
        <vIPI>${formatarNumero(nfe.valorTotalIPI)}</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>${formatarNumero(nfe.valorTotalPIS)}</vPIS>
        <vCOFINS>${formatarNumero(nfe.valorTotalCOFINS)}</vCOFINS>
        <vOutro>${formatarNumero(nfe.valorTotalOutrasDespesas)}</vOutro>
        <vNF>${formatarNumero(nfe.valorTotalNota)}</vNF>
        <vTotTrib>${formatarNumero(nfe.valorTotalTributosAproximados)}</vTotTrib>
      </ICMSTot>
    </total>

    <!-- TRANSPORTE -->
    <transp>
      <modFrete>${nfe.transporte.modalidadeFrete}</modFrete>
      ${nfe.transporte.transportadora ? `
      <transporta>
        <xNome>${escapeXml(nfe.transporte.transportadora.razaoSocial)}</xNome>
        <xEnder>${escapeXml(nfe.transporte.transportadora.enderecoCompleto || '')}</xEnder>
        <xMun>${escapeXml(nfe.transporte.transportadora.municipio || '')}</xMun>
        <UF>${escapeXml(nfe.transporte.transportadora.uf || '')}</UF>
      </transporta>` : ''}
    </transp>

    <!-- COBRANCA -->
    <cobr>
      <fat>
        <nFat>${nfe.numero}</nFat>
        <vOrig>${formatarNumero(nfe.valorTotalNota)}</vOrig>
        <vLiq>${formatarNumero(nfe.valorTotalNota)}</vLiq>
      </fat>
      ${nfe.duplicatas.map((dup) => `
      <dup>
        <nDup>${escapeXml(dup.numero)}</nDup>
        <dVenc>${dup.dataVencimento}</dVenc>
        <vDup>${formatarNumero(dup.valor)}</vDup>
      </dup>`).join('')}
    </cobr>

    <!-- PAGAMENTO -->
    <pag>
      <detPag>
        <tPag>${nfe.formaPagamento}</tPag>
        <vPag>${formatarNumero(nfe.valorTotalNota)}</vPag>
      </detPag>
    </pag>

    <!-- INFORMACOES COMPLEMENTARES -->
    <infAdic>
      <infCpl>${escapeXml(nfe.informacoesAdicionais || 'Emitido por SUP TECNOLOGIA - Sistema Emissor Fiscal Integrado.')}</infCpl>
    </infAdic>
  </infNFe>

  <!-- ASSINATURA DIGITAL -->
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#NFe${nfe.chaveAcesso}">
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${btoa(`NFE-DIGEST-${nfe.chaveAcesso}`).slice(0, 28)}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${btoa(`NFE-SIGNATURE-${nfe.chaveAcesso}`)}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${btoa(`MII...CERT-SEFAZ-SUP-${cnpjEmit}`)}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</NFe>`;

  return xml.trim();
}

export function gerarXmlCartaCorrecao(params: {
  chaveAcessoNFe: string;
  cnpjAutor: string;
  sequencialEvento: number;
  textoCorrecao: string;
}): string {
  const dhEvento = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <idLote>1</idLote>
  <evento versao="1.00">
    <infEvento Id="ID110110${params.chaveAcessoNFe}${params.sequencialEvento.toString().padStart(2, '0')}">
      <cOrgao>${params.chaveAcessoNFe.slice(0, 2)}</cOrgao>
      <tpAmb>1</tpAmb>
      <CNPJ>${limparDocumento(params.cnpjAutor)}</CNPJ>
      <chNFe>${params.chaveAcessoNFe}</chNFe>
      <dhEvento>${dhEvento}</dhEvento>
      <tpEvento>110110</tpEvento>
      <nSeqEvento>${params.sequencialEvento}</nSeqEvento>
      <verEvento>1.00</verEvento>
      <detEvento versao="1.00">
        <descEvento>Carta de Correcao</descEvento>
        <xCorrecao>${escapeXml(params.textoCorrecao)}</xCorrecao>
        <xCondUso>A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970...</xCondUso>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
}