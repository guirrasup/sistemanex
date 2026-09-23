// backend/src/utils/xmlNfeGenerator.ts
import { NFeDocumento, NFCeDocumento, ItemNfe } from '../types/fiscal.js';
import { limparDocumento } from './cpfCnpjValidator.js';
import { formatarDataHoraSefaz } from './dataHoraSefaz.js';

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function formatarNumero(val: number | string | undefined | null, decimais: number = 2): string {
  if (val === undefined || val === null) return '0.00';
  
  // Se for string, converte para número
  const num = typeof val === 'string' ? parseFloat(val) : val;
  
  if (isNaN(num)) return '0.00';
  
  // ✅ Garante a precisão correta
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

function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

function validarProtocolo(protocolo: string): boolean {
  return /^[0-9]{15}$/.test(protocolo) || /^[0-9]{17}$/.test(protocolo);
}

function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

/**
 * Monta o grupo de tributação de ICMS do item. Confirmado contra a SEFAZ
 * homologação real: um emitente do Simples Nacional (CRT=1) é REJEITADO
 * ("Informado CST para emissor do Simples Nacional") se o item usar um grupo
 * CST de regime normal (ICMS00 etc.) — precisa usar o grupo CSOSN
 * correspondente. CRT=2/3 continuam usando CST normalmente.
 */
function blocoIcmsItem(item: ItemNfe, regimeTributario: number): string {
  if (regimeTributario !== 1) {
    return `<ICMS00>
            <orig>${item.origemMercadoria}</orig>
            <CST>${item.cstICMS}</CST>
            <modBC>3</modBC>
            <vBC>${formatarNumero(item.baseCalculoICMS, 2)}</vBC>
            <pICMS>${formatarNumero(item.aliquotaICMS, 2)}</pICMS>
            <vICMS>${formatarNumero(item.valorICMS, 2)}</vICMS>
          </ICMS00>`;
  }

  const csosn = item.csosnICMS;
  if (!csosn) {
    throw new Error(`Item "${item.descricao}" sem CSOSN informado (obrigatório para emitente do Simples Nacional, CRT=1)`);
  }

  switch (csosn) {
    case '101':
      return `<ICMSSN101>
            <orig>${item.origemMercadoria}</orig>
            <CSOSN>101</CSOSN>
            <pCredSN>${formatarNumero(item.aliquotaICMS, 4)}</pCredSN>
            <vCredICMSSN>${formatarNumero(item.valorICMS, 2)}</vCredICMSSN>
          </ICMSSN101>`;
    case '102':
    case '103':
    case '300':
    case '400':
      return `<ICMSSN102>
            <orig>${item.origemMercadoria}</orig>
            <CSOSN>${csosn}</CSOSN>
          </ICMSSN102>`;
    case '201':
      return `<ICMSSN201>
            <orig>${item.origemMercadoria}</orig>
            <CSOSN>201</CSOSN>
            <modBCST>4</modBCST>
            <vBCST>${formatarNumero(item.valorICMSST, 2)}</vBCST>
            <pICMSST>${formatarNumero(item.aliquotaICMSST, 2)}</pICMSST>
            <vICMSST>${formatarNumero(item.valorICMSST, 2)}</vICMSST>
            <pCredSN>${formatarNumero(item.aliquotaICMS, 4)}</pCredSN>
            <vCredICMSSN>${formatarNumero(item.valorICMS, 2)}</vCredICMSSN>
          </ICMSSN201>`;
    case '202':
    case '203':
      return `<ICMSSN202>
            <orig>${item.origemMercadoria}</orig>
            <CSOSN>${csosn}</CSOSN>
            <modBCST>4</modBCST>
            <vBCST>${formatarNumero(item.valorICMSST, 2)}</vBCST>
            <pICMSST>${formatarNumero(item.aliquotaICMSST, 2)}</pICMSST>
            <vICMSST>${formatarNumero(item.valorICMSST, 2)}</vICMSST>
          </ICMSSN202>`;
    case '500':
      return `<ICMSSN500>
            <orig>${item.origemMercadoria}</orig>
            <CSOSN>500</CSOSN>
          </ICMSSN500>`;
    case '900':
      return `<ICMSSN900>
            <orig>${item.origemMercadoria}</orig>
            <CSOSN>900</CSOSN>
            <modBC>3</modBC>
            <vBC>${formatarNumero(item.baseCalculoICMS, 2)}</vBC>
            <pICMS>${formatarNumero(item.aliquotaICMS, 2)}</pICMS>
            <vICMS>${formatarNumero(item.valorICMS, 2)}</vICMS>
          </ICMSSN900>`;
    default:
      throw new Error(`CSOSN "${csosn}" não suportado pelo gerador de XML (item: "${item.descricao}")`);
  }
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
      <!-- NT 2020.006: obrigatório quando indPres é 2/3/4/9 (rejeição 434 sem ele); 0 = sem intermediador/marketplace -->
      <indIntermed>0</indIntermed>
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
          ${blocoIcmsItem(item, nfe.emitente.regimeTributario)}
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
</NFe>`;

  // ⚠️ XML sem assinatura digital. A assinatura real (XML-DSig, RSA-SHA1) é aplicada
  // separadamente por assinarXmlEnvelopado(), com a chave privada do certificado A1 da empresa.
  return xml.trim();
}

// ============================================================
// GERADOR DE XML NFC-e (MODELO 65) - LEIAUTE 4.00
// ============================================================

export function gerarXmlNfce400(nfce: NFCeDocumento): string {
  // ✅ VALIDA CHAVE DE ACESSO (TChNFe)
  if (!validarChaveAcesso(nfce.chaveAcesso)) {
    throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
  }

  if (nfce.protocoloAutorizacao && !validarProtocolo(nfce.protocoloAutorizacao)) {
    throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
  }

  const cnpjEmit = limparDocumento(nfce.emitente.cnpj);

  // 🔥 TOTALIZADORES DE ICMS/PIS/COFINS CALCULADOS A PARTIR DOS ITENS
  // (NFC-e não guarda esses totais no documento, apenas por item)
  const totais = nfce.itens.reduce(
    (acc, item) => {
      acc.vBC += item.baseCalculoICMS || 0;
      acc.vICMS += item.valorICMS || 0;
      acc.vPIS += item.valorPIS || 0;
      acc.vCOFINS += item.valorCOFINS || 0;
      return acc;
    },
    { vBC: 0, vICMS: 0, vPIS: 0, vCOFINS: 0 }
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nfce.chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${nfce.emitente.endereco.codigoMunicipio.slice(0, 2)}</cUF>
      <cNF>${nfce.chaveAcesso.slice(35, 43)}</cNF>
      <natOp>${escapeXml(nfce.naturezaOperacao)}</natOp>
      <mod>65</mod>
      <serie>${nfce.serie}</serie>
      <nNF>${nfce.numero}</nNF>
      <dhEmi>${nfce.dataHoraEmissao}</dhEmi>
      <tpNF>${nfce.tpNF ?? 1}</tpNF>
      <idDest>${nfce.idDest ?? 1}</idDest>
      <cMunFG>${nfce.emitente.endereco.codigoMunicipio}</cMunFG>
      <tpImp>4</tpImp>
      <tpEmis>${nfce.tpEmis ?? 1}</tpEmis>
      <cDV>${nfce.chaveAcesso.slice(-1)}</cDV>
      <tpAmb>${nfce.ambiente}</tpAmb>
      <finNFe>${nfce.finNFe ?? 1}</finNFe>
      <indFinal>${nfce.indFinal ?? 1}</indFinal>
      <indPres>${nfce.indPres ?? 1}</indPres>
      <!-- NT 2020.006: obrigatório quando indPres é 2/3/4/9 (rejeição 434 sem ele); 0 = sem intermediador/marketplace -->
      <indIntermed>0</indIntermed>
      <procEmi>${nfce.procEmi ?? '0'}</procEmi>
      <verProc>${nfce.verProc || 'SUP-TECNOLOGIA-4.00'}</verProc>
    </ide>

    <!-- EMITENTE -->
    <emit>
      <CNPJ>${cnpjEmit}</CNPJ>
      <xNome>${escapeXml(nfce.emitente.razaoSocial)}</xNome>
      ${nfce.emitente.nomeFantasia ? `<xFant>${escapeXml(nfce.emitente.nomeFantasia)}</xFant>` : ''}
      <enderEmit>
        <xLgr>${escapeXml(nfce.emitente.endereco.logradouro)}</xLgr>
        <nro>${escapeXml(nfce.emitente.endereco.numero)}</nro>
        ${nfce.emitente.endereco.complemento ? `<xCpl>${escapeXml(nfce.emitente.endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(nfce.emitente.endereco.bairro)}</xBairro>
        <cMun>${nfce.emitente.endereco.codigoMunicipio}</cMun>
        <xMun>${escapeXml(nfce.emitente.endereco.nomeMunicipio)}</xMun>
        <UF>${nfce.emitente.endereco.uf}</UF>
        <CEP>${limparDocumento(nfce.emitente.endereco.cep)}</CEP>
        <cPais>${nfce.emitente.endereco.codigoPais || '1058'}</cPais>
        <xPais>${escapeXml(nfce.emitente.endereco.nomePais || 'BRASIL')}</xPais>
      </enderEmit>
      <IE>${escapeXml(nfce.emitente.inscricaoEstadual || 'ISENTO')}</IE>
      <CRT>${nfce.emitente.regimeTributario}</CRT>
    </emit>

    <!-- CONSUMIDOR (opcional na NFC-e) -->
    ${nfce.consumidorIdentificado && nfce.consumidorCpf ? `
    <dest>
      ${limparDocumento(nfce.consumidorCpf).length === 14 ? `<CNPJ>${limparDocumento(nfce.consumidorCpf)}</CNPJ>` : `<CPF>${limparDocumento(nfce.consumidorCpf)}</CPF>`}
      ${nfce.consumidorNome ? `<xNome>${escapeXml(nfce.consumidorNome)}</xNome>` : ''}
      ${nfce.consumidorEmail ? `<email>${escapeXml(nfce.consumidorEmail)}</email>` : ''}
    </dest>` : ''}

    <!-- PRODUTOS E SERVICOS -->
    ${nfce.itens.map((item, idx) => {
      const cEAN = item.codigoEAN || 'SEM GTIN';
      const cEANTrib = item.codigoEANTrib || 'SEM GTIN';

      return `
    <det nItem="${idx + 1}">
      <prod>
        <cProd>${escapeXml(item.codigoProduto)}</cProd>
        <cEAN>${cEAN}</cEAN>
        <xProd>${escapeXml(item.descricao)}</xProd>
        <NCM>${limparDocumento(item.ncm)}</NCM>
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
          ${blocoIcmsItem(item, nfce.emitente.regimeTributario)}
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
        <vBC>${formatarNumero(totais.vBC, 2)}</vBC>
        <vICMS>${formatarNumero(totais.vICMS, 2)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${formatarNumero(nfce.valorTotalProdutos, 2)}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>${formatarNumero(nfce.valorTotalDesconto, 2)}</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>${formatarNumero(totais.vPIS, 2)}</vPIS>
        <vCOFINS>${formatarNumero(totais.vCOFINS, 2)}</vCOFINS>
        <vOutro>${formatarNumero(nfce.valorTotalAcrescimo || 0, 2)}</vOutro>
        <vNF>${formatarNumero(nfce.valorTotalNota, 2)}</vNF>
        <vTotTrib>${formatarNumero(nfce.valorTotalTributosAproximados, 2)}</vTotTrib>
      </ICMSTot>
    </total>

    <!-- TRANSPORTE (obrigatório mesmo na NFC-e; confirmado contra rejeição real
         "Falha no Schema XML" — sem este bloco, o validador da SEFAZ acusa o
         elemento de pagamento seguinte, como se fosse ali o erro) -->
    <transp>
      <modFrete>9</modFrete>
    </transp>

    <!-- PAGAMENTO -->
    <pag>
      <detPag>
        <tPag>${nfce.formaPagamento}</tPag>
        <vPag>${formatarNumero(nfce.valorPago, 2)}</vPag>
      </detPag>
      <vTroco>${formatarNumero(nfce.valorTroco, 2)}</vTroco>
    </pag>

    <!-- INFORMACOES COMPLEMENTARES -->
    <infAdic>
      <infCpl>${escapeXml(nfce.infCpl || 'Emitido por SUP TECNOLOGIA - Sistema Emissor Fiscal Integrado.')}</infCpl>
    </infAdic>
  </infNFe>

  <!-- DADOS SUPLEMENTARES (QR CODE) -->
  <infNFeSupl>
    <qrCode><![CDATA[${nfce.urlQrCode}]]></qrCode>
    <urlChave>${nfce.urlConsultaChave || 'https://www.nfce.fazenda.gov.br/portal/consultaNFCe.aspx'}</urlChave>
  </infNFeSupl>
</NFe>`;

  // ⚠️ XML sem assinatura digital. A assinatura real é aplicada por assinarXmlEnvelopado(),
  // que insere o <Signature> logo após </infNFe> (posição correta, antes de <infNFeSupl>).
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
  ambiente?: 1 | 2;
}): string {
  // ✅ VALIDA TChNFe (44 dígitos)
  if (!validarChaveAcesso(params.chaveAcessoNFe)) {
    throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
  }

  // ✅ VALIDA TJust (15-255 caracteres)
  if (!validarTJust(params.textoCorrecao)) {
    throw new Error('Texto de correção deve ter entre 15 e 255 caracteres (TJust)');
  }

  const dhEvento = formatarDataHoraSefaz();
  const cnpjLimpo = limparDocumento(params.cnpjAutor);

  return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <idLote>1</idLote>
  <evento versao="1.00">
    <infEvento Id="ID110110${params.chaveAcessoNFe}${params.sequencialEvento.toString().padStart(2, '0')}">
      <cOrgao>${params.chaveAcessoNFe.slice(0, 2)}</cOrgao>
      <tpAmb>${params.ambiente ?? 2}</tpAmb>
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
  ambiente?: 1 | 2;
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

  const dhEvento = formatarDataHoraSefaz();
  const cnpjLimpo = limparDocumento(params.cnpjAutor);

  return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <idLote>1</idLote>
  <evento versao="1.00">
    <infEvento Id="ID110111${params.chaveAcessoNFe}${params.sequencialEvento.toString().padStart(2, '0')}">
      <cOrgao>${params.chaveAcessoNFe.slice(0, 2)}</cOrgao>
      <tpAmb>${params.ambiente ?? 2}</tpAmb>
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

// ============================================================
// INUTILIZAÇÃO DE NUMERAÇÃO (NFeInutilizacao4)
// ============================================================
// Diferente dos eventos acima (envEvento/RecepcaoEvento4), a inutilização é um
// documento próprio (inutNFe), transmitido a um webservice dedicado
// (NFeInutilizacao4) — usado para "queimar" uma faixa de números de NF-e que
// nunca chegou a ser emitida (pulo de numeração, erro de sequência etc.).

export function gerarXmlInutilizacaoNFe(params: {
  cUF: string;
  cnpjAutor: string;
  ano: string; // AA (2 dígitos)
  modelo: '55' | '65';
  serie: number;
  numeroInicial: number;
  numeroFinal: number;
  justificativa: string;
  ambiente?: 1 | 2;
}): string {
  if (!validarTJust(params.justificativa)) {
    throw new Error('Justificativa deve ter entre 15 e 255 caracteres (TJust)');
  }
  if (params.numeroInicial > params.numeroFinal) {
    throw new Error('Número inicial deve ser menor ou igual ao número final (TNF)');
  }

  const cnpjLimpo = limparDocumento(params.cnpjAutor);
  const cUF = params.cUF.padStart(2, '0');
  const serie = params.serie.toString().padStart(3, '0');
  const nNFIni = params.numeroInicial.toString().padStart(9, '0');
  const nNFFin = params.numeroFinal.toString().padStart(9, '0');

  // Formato oficial do Id (TInutId, PL_009): "ID" + cUF + ano + CNPJ + mod + serie + nNFIni + nNFFin
  const id = `ID${cUF}${params.ano}${cnpjLimpo}${params.modelo}${serie}${nNFIni}${nNFFin}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<inutNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <infInut Id="${id}">
    <tpAmb>${params.ambiente ?? 2}</tpAmb>
    <xServ>INUTILIZAR</xServ>
    <cUF>${cUF}</cUF>
    <ano>${params.ano}</ano>
    <CNPJ>${cnpjLimpo}</CNPJ>
    <mod>${params.modelo}</mod>
    <serie>${params.serie}</serie>
    <nNFIni>${params.numeroInicial}</nNFIni>
    <nNFFin>${params.numeroFinal}</nNFFin>
    <xJust>${escapeXml(params.justificativa)}</xJust>
  </infInut>
</inutNFe>`;
}