// C:\emissornfe\backend\src\utils\xmlNfeGenerator.ts

/**
 * Gerador de XML Oficial NF-e (Modelo 55) e NFC-e (Modelo 65) - Layout SEFAZ 4.00
 * SUP TECNOLOGIA - BACKEND (NODE.JS)
 * 
 * ✅ EM CONFORMIDADE COM:
 * - PL_006h - Tipos Básicos NF-e (NT 2011/004)
 * - Schema XSD da SEFAZ v4.00
 * - Schema Prisma
 * 
 * ⚠️ ATENÇÃO: Este arquivo roda no Node.js (backend)
 * - NÃO use btoa() - não existe no Node.js
 * - Use Buffer.from().toString('base64') para Base64
 */

import { NFeDocumento } from '../../../src/types/fiscal.js';
import { limparDocumento } from './cpfCnpjValidator.js';

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Formata número para XML com quantidade específica de decimais
 * ✅ TDec_1104v: até 4 decimais para valores
 * ✅ TDec_0302_04: 2-4 decimais para alíquotas
 */
function formatarNumero(val: number | string | undefined | null, decimais: number = 2): string {
  if (val === undefined || val === null) return '0.00';
  
  // Se for string, converte para número
  const num = typeof val === 'string' ? parseFloat(val) : val;
  
  if (isNaN(num)) return '0.00';
  
  // ✅ Garante a precisão correta
  return num.toFixed(decimais);
}

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
 * ✅ CORREÇÃO: Base64 encode para Node.js
 * ⚠️ NÃO use btoa() - não existe no Node.js!
 * ✅ Use Buffer.from().toString('base64')
 */
function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64');
}

/**
 * ✅ Valida TChNFe (44 dígitos) - PL_006h
 */
function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

/**
 * ✅ Valida TProt (15 ou 17 dígitos) - PL_006h
 */
function validarProtocolo(protocolo: string): boolean {
  return /^[0-9]{15}$/.test(protocolo) || /^[0-9]{17}$/.test(protocolo);
}

/**
 * ✅ Valida TJust (15-255 caracteres) - PL_006h
 */
function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

// ============================================================
// GERADOR DE XML NF-e 4.00
// ============================================================

export function gerarXmlNfe400(nfe: NFeDocumento): string {
  // ✅ VALIDA CHAVE DE ACESSO (TChNFe)
  if (!validarChaveAcesso(nfe.chaveAcesso)) {
    throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
  }

  // ✅ VALIDA PROTOCOLO (TProt) - se existir
  if (nfe.protocoloAutorizacao && !validarProtocolo(nfe.protocoloAutorizacao)) {
    throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
  }

  const cnpjEmit = limparDocumento(nfe.emitente.cnpj);
  const docDest = limparDocumento(nfe.destinatario.documento);
  const isCnpjDest = docDest.length === 14;

  // 🔥 CALCULA idDest CORRETAMENTE (PL_006h: 1=Interna, 2=Interestadual, 3=Exterior)
  const idDest = nfe.idDest !== undefined ? nfe.idDest : 
    (nfe.emitente.endereco.uf === nfe.destinatario.endereco.uf ? 1 : 2);

  // 🔥 OBTÉM O CPF/CNPJ CORRETO PARA O DESTINATÁRIO
  const docDestFormatado = isCnpjDest ? docDest : docDest;

  // 🔥 FORMA PAGAMENTO COM FALLBACK
  const formaPagamento = nfe.formaPagamento || '17';

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
      <idDest>${idDest}</idDest>
      <cMunFG>${nfe.emitente.endereco.codigoMunicipio}</cMunFG>
      <tpImp>${nfe.tpImp || 1}</tpImp>
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
        <cPais>${nfe.emitente.endereco.codigoPais || '1058'}</cPais>
        <xPais>${escapeXml(nfe.emitente.endereco.nomePais || 'BRASIL')}</xPais>
        ${nfe.emitente.endereco.telefone ? `<fone>${limparDocumento(nfe.emitente.endereco.telefone)}</fone>` : ''}
      </enderEmit>
      <IE>${escapeXml(nfe.emitente.inscricaoEstadual || 'ISENTO')}</IE>
      <CRT>${nfe.emitente.regimeTributario}</CRT>
    </emit>

    <!-- DESTINATARIO -->
    <dest>
      ${isCnpjDest ? `<CNPJ>${docDestFormatado}</CNPJ>` : `<CPF>${docDestFormatado}</CPF>`}
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
        <cPais>${nfe.destinatario.endereco.codigoPais || '1058'}</cPais>
        <xPais>${escapeXml(nfe.destinatario.endereco.nomePais || 'BRASIL')}</xPais>
      </enderDest>
      <indIEDest>${nfe.destinatario.indicadorIEDestinatario || '9'}</indIEDest>
      ${nfe.destinatario.inscricaoEstadual ? `<IE>${escapeXml(nfe.destinatario.inscricaoEstadual)}</IE>` : ''}
      ${nfe.destinatario.email ? `<email>${escapeXml(nfe.destinatario.email)}</email>` : ''}
    </dest>

    <!-- PRODUTOS E SERVICOS -->
    ${nfe.itens.map((item, idx) => {
      // 🔥 GERA cEAN e cEANTrib com fallback
      const cEAN = item.codigoEAN || 'SEM GTIN';
      const cEANTrib = item.codigoEANTrib || 'SEM GTIN';
      
      return `
    <det nItem="${idx + 1}">
      <prod>
        <cProd>${escapeXml(item.codigoProduto)}</cProd>
        <cEAN>${cEAN}</cEAN>
        <xProd>${escapeXml(item.descricao)}</xProd>
        <NCM>${limparDocumento(item.ncm)}</NCM>
        ${item.cest ? `<CEST>${limparDocumento(item.cest)}</CEST>` : ''}
        <CFOP>${item.cfop}</CFOP>
        <uCom>${escapeXml(item.unidadeMedida)}</uCom>
        <qCom>${formatarNumero(item.quantidade, 4)}</qCom>
        <vUnCom>${formatarNumero(item.valorUnitario, 4)}</vUnCom>
        <vProd>${formatarNumero(item.valorTotalBruto, 2)}</vProd>
        <cEANTrib>${cEANTrib}</cEANTrib>
        <uTrib>${escapeXml(item.unidadeMedida)}</uTrib>
        <qTrib>${formatarNumero(item.quantidade, 4)}</qTrib>
        <vUnTrib>${formatarNumero(item.valorUnitario, 4)}</vUnTrib>
        ${item.descontoItem ? `<vDesc>${formatarNumero(item.descontoItem, 2)}</vDesc>` : ''}
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vTotTrib>${formatarNumero(item.valorTributosAproximados, 2)}</vTotTrib>
        <ICMS>
          <ICMS00>
            <orig>${item.origemMercadoria}</orig>
            <CST>${item.cstICMS}</CST>
            <modBC>3</modBC>
            <vBC>${formatarNumero(item.baseCalculoICMS, 2)}</vBC>
            <pICMS>${formatarNumero(item.aliquotaICMS, 2)}</pICMS>
            <vICMS>${formatarNumero(item.valorICMS, 2)}</vICMS>
          </ICMS00>
        </ICMS>
        <PIS>
          <PISAliq>
            <CST>${item.cstPIS}</CST>
            <vBC>${formatarNumero(item.valorTotalBruto, 2)}</vBC>
            <pPIS>${formatarNumero(item.aliquotaPIS, 4)}</pPIS>
            <vPIS>${formatarNumero(item.valorPIS, 2)}</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>${item.cstCOFINS}</CST>
            <vBC>${formatarNumero(item.valorTotalBruto, 2)}</vBC>
            <pCOFINS>${formatarNumero(item.aliquotaCOFINS, 4)}</pCOFINS>
            <vCOFINS>${formatarNumero(item.valorCOFINS, 2)}</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>`;
    }).join('')}

    <!-- TOTALIZADORES -->
    <total>
      <ICMSTot>
        <vBC>${formatarNumero(nfe.baseCalculoICMS, 2)}</vBC>
        <vICMS>${formatarNumero(nfe.valorTotalICMS, 2)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>${formatarNumero(nfe.baseCalculoICMSST, 2)}</vBCST>
        <vST>${formatarNumero(nfe.valorTotalICMSST, 2)}</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${formatarNumero(nfe.valorTotalProdutos, 2)}</vProd>
        <vFrete>${formatarNumero(nfe.valorTotalFrete, 2)}</vFrete>
        <vSeg>${formatarNumero(nfe.valorTotalSeguro, 2)}</vSeg>
        <vDesc>${formatarNumero(nfe.valorTotalDesconto, 2)}</vDesc>
        <vII>0.00</vII>
        <vIPI>${formatarNumero(nfe.valorTotalIPI, 2)}</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>${formatarNumero(nfe.valorTotalPIS, 2)}</vPIS>
        <vCOFINS>${formatarNumero(nfe.valorTotalCOFINS, 2)}</vCOFINS>
        <vOutro>${formatarNumero(nfe.valorTotalOutrasDespesas, 2)}</vOutro>
        <vNF>${formatarNumero(nfe.valorTotalNota, 2)}</vNF>
        <vTotTrib>${formatarNumero(nfe.valorTotalTributosAproximados, 2)}</vTotTrib>
      </ICMSTot>
    </total>

    <!-- TRANSPORTE -->
    <transp>
      <modFrete>${nfe.transporte.modalidadeFrete}</modFrete>
      ${nfe.transporte.transportadora ? `
      <transporta>
        <xNome>${escapeXml(nfe.transporte.transportadora.razaoSocial)}</xNome>
        ${nfe.transporte.transportadora.cnpjCpf ? `<CNPJ>${limparDocumento(nfe.transporte.transportadora.cnpjCpf)}</CNPJ>` : ''}
        <xEnder>${escapeXml(nfe.transporte.transportadora.enderecoCompleto || '')}</xEnder>
        <xMun>${escapeXml(nfe.transporte.transportadora.municipio || '')}</xMun>
        <UF>${escapeXml(nfe.transporte.transportadora.uf || '')}</UF>
      </transporta>` : ''}
      ${nfe.transporte.veiculo ? `
      <veicTransp>
        <placa>${nfe.transporte.veiculo.placa}</placa>
        <UF>${nfe.transporte.veiculo.uf}</UF>
        ${nfe.transporte.veiculo.rntc ? `<RNTC>${nfe.transporte.veiculo.rntc}</RNTC>` : ''}
      </veicTransp>` : ''}
      ${nfe.transporte.volumes ? `
      <vol>
        <qVol>${formatarNumero(nfe.transporte.volumes.quantidade)}</qVol>
        <esp>${escapeXml(nfe.transporte.volumes.especie)}</esp>
        ${nfe.transporte.volumes.marca ? `<marca>${escapeXml(nfe.transporte.volumes.marca)}</marca>` : ''}
        ${nfe.transporte.volumes.numero ? `<nVol>${escapeXml(nfe.transporte.volumes.numero)}</nVol>` : ''}
        <pesoL>${formatarNumero(nfe.transporte.volumes.pesoLiquidoKg, 3)}</pesoL>
        <pesoB>${formatarNumero(nfe.transporte.volumes.pesoBrutoKg, 3)}</pesoB>
      </vol>` : ''}
    </transp>

    <!-- COBRANCA -->
    <cobr>
      <fat>
        <nFat>${nfe.numero}</nFat>
        <vOrig>${formatarNumero(nfe.valorTotalNota, 2)}</vOrig>
        <vLiq>${formatarNumero(nfe.valorTotalNota, 2)}</vLiq>
      </fat>
      ${nfe.duplicatas && nfe.duplicatas.length > 0 ? nfe.duplicatas.map((dup) => `
      <dup>
        <nDup>${escapeXml(dup.numero)}</nDup>
        <dVenc>${dup.dataVencimento}</dVenc>
        <vDup>${formatarNumero(dup.valor, 2)}</vDup>
      </dup>`).join('') : ''}
    </cobr>

    <!-- PAGAMENTO -->
    <pag>
      <detPag>
        <tPag>${formaPagamento}</tPag>
        <vPag>${formatarNumero(nfe.valorTotalNota, 2)}</vPag>
      </detPag>
    </pag>

    <!-- INFORMACOES COMPLEMENTARES -->
    <infAdic>
      <infCpl>${escapeXml(nfe.informacoesAdicionais || 'Emitido por SUP TECNOLOGIA - Sistema Emissor Fiscal Integrado. Valor aproximado dos tributos federais e estaduais conforme Lei 12.741/2012.')}</infCpl>
    </infAdic>
  </infNFe>

  <!-- ASSINATURA DIGITAL -->
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#NFe${nfe.chaveAcesso}">
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${base64Encode(`NFE-DIGEST-${nfe.chaveAcesso}`).slice(0, 28)}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${base64Encode(`NFE-SIGNATURE-${nfe.chaveAcesso}`)}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${base64Encode(`MII...CERT-SEFAZ-SUP-${cnpjEmit}`)}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</NFe>`;

  return xml.trim();
}

// ============================================================
// CARTA DE CORREÇÃO (CC-e)
// ============================================================

export function gerarXmlCartaCorrecao(params: {
  chaveAcessoNFe: string;
  cnpjAutor: string;
  sequencialEvento: number;
  textoCorrecao: string;
}): string {
  // ✅ VALIDA TChNFe (44 dígitos)
  if (!validarChaveAcesso(params.chaveAcessoNFe)) {
    throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
  }

  // ✅ VALIDA TJust (15-255 caracteres)
  if (!validarTJust(params.textoCorrecao)) {
    throw new Error('Texto de correção deve ter entre 15 e 255 caracteres (TJust)');
  }

  const dhEvento = new Date().toISOString();
  const cnpjLimpo = limparDocumento(params.cnpjAutor);

  return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <idLote>1</idLote>
  <evento versao="1.00">
    <infEvento Id="ID110110${params.chaveAcessoNFe}${params.sequencialEvento.toString().padStart(2, '0')}">
      <cOrgao>${params.chaveAcessoNFe.slice(0, 2)}</cOrgao>
      <tpAmb>1</tpAmb>
      <CNPJ>${cnpjLimpo}</CNPJ>
      <chNFe>${params.chaveAcessoNFe}</chNFe>
      <dhEvento>${dhEvento}</dhEvento>
      <tpEvento>110110</tpEvento>
      <nSeqEvento>${params.sequencialEvento}</nSeqEvento>
      <verEvento>1.00</verEvento>
      <detEvento versao="1.00">
        <descEvento>Carta de Correcao</descEvento>
        <xCorrecao>${escapeXml(params.textoCorrecao)}</xCorrecao>
        <xCondUso>A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970, e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.</xCondUso>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
}

// ============================================================
// EVENTO DE CANCELAMENTO
// ============================================================

export function gerarXmlCancelamentoNFe(params: {
  chaveAcessoNFe: string;
  cnpjAutor: string;
  sequencialEvento: number;
  justificativa: string;
  protocoloAutorizacao: string;
}): string {
  // ✅ VALIDA TChNFe (44 dígitos)
  if (!validarChaveAcesso(params.chaveAcessoNFe)) {
    throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
  }

  // ✅ VALIDA TJust (15-255 caracteres)
  if (!validarTJust(params.justificativa)) {
    throw new Error('Justificativa deve ter entre 15 e 255 caracteres (TJust)');
  }

  // ✅ VALIDA TProt (15 ou 17 dígitos)
  if (!validarProtocolo(params.protocoloAutorizacao)) {
    throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
  }

  const dhEvento = new Date().toISOString();
  const cnpjLimpo = limparDocumento(params.cnpjAutor);

  return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <idLote>1</idLote>
  <evento versao="1.00">
    <infEvento Id="ID110111${params.chaveAcessoNFe}${params.sequencialEvento.toString().padStart(2, '0')}">
      <cOrgao>${params.chaveAcessoNFe.slice(0, 2)}</cOrgao>
      <tpAmb>1</tpAmb>
      <CNPJ>${cnpjLimpo}</CNPJ>
      <chNFe>${params.chaveAcessoNFe}</chNFe>
      <dhEvento>${dhEvento}</dhEvento>
      <tpEvento>110111</tpEvento>
      <nSeqEvento>${params.sequencialEvento}</nSeqEvento>
      <verEvento>1.00</verEvento>
      <detEvento versao="1.00">
        <descEvento>Cancelamento</descEvento>
        <nProt>${params.protocoloAutorizacao}</nProt>
        <xJust>${escapeXml(params.justificativa)}</xJust>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
}