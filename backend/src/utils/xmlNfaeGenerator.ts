// backend/src/utils/xmlNfaeGenerator.ts
// Gerador de XML para NFA-e (Nota Fiscal Avulsa Eletrônica, modelo 63).
//
// ⚠️ Diferente de NFe/NFCe/CTe/MDFe, a NFA-e NÃO tem um layout nacional único —
// cada SEFAZ estadual publica seu próprio manual e schema (SEFAZ-SP, SEFAZ-MG etc.
// têm estruturas distintas). Esta função gera uma estrutura genérica, alinhada ao
// padrão mais comum entre estados (muito próxima da NFe simplificada), pensada para
// ser ajustada ao manual da UF específica de cada emitente antes da transmissão real.
import { limparDocumento } from './cpfCnpjValidator.js';

function escapeXml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatarNumero(val: number | string | undefined | null, decimais = 2): string {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? '0.00' : num.toFixed(decimais);
}

export interface EnderecoNfae {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  municipioIbge?: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
}

export interface ParteNfae {
  tipoPessoa: string;
  documento: string;
  nome: string;
  inscricaoEstadual?: string;
  endereco: EnderecoNfae;
}

export interface ItemNfae {
  codigo: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  aliquotaICMS: number;
  valorICMS: number;
  codigoBarrasEAN?: string;
}

export interface NfaeParaXml {
  chaveAcesso: string;
  numero: number;
  serie: number;
  dataHoraEmissao: string;
  naturezaOperacao: string;
  motivoEmissao: string;
  descricaoMotivo: string;
  ambiente: number;
  orgaoEmissorSefaz: string;
  requerente: ParteNfae;
  destinatario: ParteNfae;
  itens: ItemNfae[];
  valorTotalProdutos: number;
  baseCalculoICMS: number;
  aliquotaICMSMediana: number;
  valorTotalICMS: number;
  valorTotalNota: number;
  guiaDAE?: {
    numero?: string;
    codigoBarras?: string;
    vencimento?: string;
    valor?: number;
  };
  informacoesComplementares?: string;
}

function enderecoXml(tag: string, endereco: EnderecoNfae): string {
  return `<${tag}>
        <xLgr>${escapeXml(endereco.logradouro)}</xLgr>
        <nro>${escapeXml(endereco.numero)}</nro>
        ${endereco.complemento ? `<xCpl>${escapeXml(endereco.complemento)}</xCpl>` : ''}
        <xBairro>${escapeXml(endereco.bairro)}</xBairro>
        <xMun>${escapeXml(endereco.municipio)}</xMun>
        ${endereco.municipioIbge ? `<cMun>${escapeXml(endereco.municipioIbge)}</cMun>` : ''}
        <UF>${escapeXml(endereco.uf)}</UF>
        <CEP>${limparDocumento(endereco.cep)}</CEP>
        ${endereco.telefone ? `<fone>${limparDocumento(endereco.telefone)}</fone>` : ''}
      </${tag}>`;
}

export function gerarXmlNfae(nfae: NfaeParaXml): string {
  if (!/^[0-9]{44}$/.test(nfae.chaveAcesso)) {
    throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
  }

  const docRequerente = limparDocumento(nfae.requerente.documento);
  const isCnpjRequerente = docRequerente.length === 14;
  const docDest = limparDocumento(nfae.destinatario.documento);
  const isCnpjDest = docDest.length === 14;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFAe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFAe Id="NFAe${nfae.chaveAcesso}" versao="1.00">
    <ide>
      <cUF>${nfae.chaveAcesso.slice(0, 2)}</cUF>
      <mod>63</mod>
      <serie>${nfae.serie}</serie>
      <nNF>${nfae.numero}</nNF>
      <dhEmi>${nfae.dataHoraEmissao}</dhEmi>
      <tpAmb>${nfae.ambiente}</tpAmb>
      <natOp>${escapeXml(nfae.naturezaOperacao)}</natOp>
      <motEmi>${escapeXml(nfae.motivoEmissao)}</motEmi>
      <xMotEmi>${escapeXml(nfae.descricaoMotivo)}</xMotEmi>
      <orgaoEmissor>${escapeXml(nfae.orgaoEmissorSefaz)}</orgaoEmissor>
    </ide>

    <!-- REQUERENTE (emitente avulso) -->
    <requerente>
      ${isCnpjRequerente ? `<CNPJ>${docRequerente}</CNPJ>` : `<CPF>${docRequerente}</CPF>`}
      <xNome>${escapeXml(nfae.requerente.nome)}</xNome>
      ${enderecoXml('enderReq', nfae.requerente.endereco)}
    </requerente>

    <!-- DESTINATARIO -->
    <dest>
      ${isCnpjDest ? `<CNPJ>${docDest}</CNPJ>` : `<CPF>${docDest}</CPF>`}
      <xNome>${escapeXml(nfae.destinatario.nome)}</xNome>
      ${nfae.destinatario.inscricaoEstadual ? `<IE>${escapeXml(nfae.destinatario.inscricaoEstadual)}</IE>` : ''}
      ${enderecoXml('enderDest', nfae.destinatario.endereco)}
    </dest>

    <!-- ITENS -->
    ${nfae.itens.map((item, idx) => `
    <det nItem="${idx + 1}">
      <prod>
        <cProd>${escapeXml(item.codigo)}</cProd>
        ${item.codigoBarrasEAN ? `<cEAN>${escapeXml(item.codigoBarrasEAN)}</cEAN>` : ''}
        <xProd>${escapeXml(item.descricao)}</xProd>
        <NCM>${limparDocumento(item.ncm)}</NCM>
        <uCom>${escapeXml(item.unidade)}</uCom>
        <qCom>${formatarNumero(item.quantidade, 4)}</qCom>
        <vUnCom>${formatarNumero(item.valorUnitario, 4)}</vUnCom>
        <vProd>${formatarNumero(item.valorTotal, 2)}</vProd>
      </prod>
      <imposto>
        <ICMS>
          <pICMS>${formatarNumero(item.aliquotaICMS, 2)}</pICMS>
          <vICMS>${formatarNumero(item.valorICMS, 2)}</vICMS>
        </ICMS>
      </imposto>
    </det>`).join('')}

    <!-- TOTAIS -->
    <total>
      <ICMSTot>
        <vBC>${formatarNumero(nfae.baseCalculoICMS, 2)}</vBC>
        <pICMSMed>${formatarNumero(nfae.aliquotaICMSMediana, 2)}</pICMSMed>
        <vICMS>${formatarNumero(nfae.valorTotalICMS, 2)}</vICMS>
        <vProd>${formatarNumero(nfae.valorTotalProdutos, 2)}</vProd>
        <vNF>${formatarNumero(nfae.valorTotalNota, 2)}</vNF>
      </ICMSTot>
    </total>

    ${nfae.guiaDAE ? `
    <!-- GUIA DAE (documento de arrecadação estadual) -->
    <guiaDAE>
      ${nfae.guiaDAE.numero ? `<nDAE>${escapeXml(nfae.guiaDAE.numero)}</nDAE>` : ''}
      ${nfae.guiaDAE.codigoBarras ? `<codBarras>${escapeXml(nfae.guiaDAE.codigoBarras)}</codBarras>` : ''}
      ${nfae.guiaDAE.vencimento ? `<dVenc>${escapeXml(nfae.guiaDAE.vencimento)}</dVenc>` : ''}
      ${nfae.guiaDAE.valor !== undefined ? `<vDAE>${formatarNumero(nfae.guiaDAE.valor, 2)}</vDAE>` : ''}
    </guiaDAE>` : ''}

    <!-- INFORMACOES COMPLEMENTARES -->
    <infAdic>
      <infCpl>${escapeXml(nfae.informacoesComplementares || 'NFA-e emitida via SUP TECNOLOGIA - Sistema Emissor Fiscal Integrado.')}</infCpl>
    </infAdic>
  </infNFAe>
</NFAe>`;

  // ⚠️ XML sem assinatura digital; a assinatura real é aplicada por assinarXmlEnvelopado()
  // (elemento assinado: infNFAe). Layout específico da UF ainda precisa ser conferido
  // contra o manual da SEFAZ do estado do emitente antes da transmissão em produção.
  return xml.trim();
}
