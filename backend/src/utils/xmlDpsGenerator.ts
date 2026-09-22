// backend/src/utils/xmlDpsGenerator.ts
// Gerador da DPS (Declaração de Prestação de Serviços) — o documento que o prestador
// assina e envia ao Sistema Nacional NFS-e (API SefinNacional/ADN); o próprio ambiente
// nacional gera e devolve a NFS-e autorizada a partir da DPS aceita.
//
// ⚠️ Estrutura baseada na documentação técnica oficial (gov.br/nfse) e em referências
// de mercado (ex.: documentação de desenvolvedores da Focus NFe) — como o XSD completo
// não foi encontrado publicamente nesta pesquisa, valide a estrutura exata contra o
// ambiente de Produção Restrita (homologação) antes de transmitir em produção.
import { NFSeDocumento } from '../types/fiscal.js';
import { limparDocumento } from './cpfCnpjValidator.js';

function escapeXml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatarNumero(val: number | undefined | null, decimais = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return val.toFixed(decimais);
}

/**
 * Gera a DPS (XML) a partir do mesmo DTO já usado para montar a NFS-e local
 * (NFSeDocumento). O elemento assinado é "infDPS".
 */
export function gerarXmlDps(nfse: NFSeDocumento): string {
  const cnpjEmit = limparDocumento(nfse.emitente.cnpj);
  const docToma = limparDocumento(nfse.tomador.documento);
  const isCnpjToma = docToma.length === 14;
  const tpAmb = nfse.ambiente === 1 ? '1' : '2';
  const idDps = `DPS${nfse.chaveAcesso}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse">
  <infDPS Id="${escapeXml(idDps)}" versao="1.00">
    <tpAmb>${tpAmb}</tpAmb>
    <dhEmi>${nfse.dataHoraEmissao}</dhEmi>
    <verAplic>SUP-TECNOLOGIA-1.00</verAplic>
    <serie>${String(nfse.serieDPS).padStart(5, '0')}</serie>
    <nDPS>${nfse.numeroDPS}</nDPS>
    <dCompet>${nfse.dataCompetencia}</dCompet>
    <tpEmit>1</tpEmit>
    <cLocEmi>${escapeXml(nfse.emitente.endereco.codigoMunicipio)}</cLocEmi>

    <!-- PRESTADOR -->
    <prest>
      <CNPJ>${cnpjEmit}</CNPJ>
      <IM>${escapeXml(nfse.emitente.inscricaoMunicipal)}</IM>
      <xNome>${escapeXml(nfse.emitente.razaoSocial)}</xNome>
      ${nfse.emitente.endereco.telefone ? `<fone>${limparDocumento(nfse.emitente.endereco.telefone)}</fone>` : ''}
      ${nfse.emitente.endereco.email ? `<email>${escapeXml(nfse.emitente.endereco.email)}</email>` : ''}
    </prest>

    <!-- TOMADOR -->
    <toma>
      ${isCnpjToma ? `<CNPJ>${docToma}</CNPJ>` : `<CPF>${docToma}</CPF>`}
      ${nfse.tomador.inscricaoMunicipal ? `<IM>${escapeXml(nfse.tomador.inscricaoMunicipal)}</IM>` : ''}
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

    <!-- SERVIÇO -->
    <serv>
      <locPrest>
        <cLocPrestacao>${escapeXml(nfse.servico.localPrestacao.codigoMunicipio)}</cLocPrestacao>
      </locPrest>
      <cServ>
        <cTribNac>${escapeXml(nfse.servico.codigoTributacaoNacional)}</cTribNac>
        ${nfse.servico.codigoTributacaoMunicipal ? `<cTribMun>${escapeXml(nfse.servico.codigoTributacaoMunicipal)}</cTribMun>` : ''}
        ${nfse.servico.codigoNBS ? `<cNBS>${escapeXml(nfse.servico.codigoNBS)}</cNBS>` : ''}
        <xDescServ>${escapeXml(nfse.servico.descricao)}</xDescServ>
      </cServ>
    </serv>

    <!-- VALORES -->
    <valores>
      <vServPrest>
        <vServ>${formatarNumero(nfse.servico.valorServico)}</vServ>
      </vServPrest>
      ${nfse.servico.descontoIncondicionado || nfse.servico.descontoCondicionado ? `
      <vDescCondIncond>
        ${nfse.servico.descontoIncondicionado ? `<vDescIncond>${formatarNumero(nfse.servico.descontoIncondicionado)}</vDescIncond>` : ''}
        ${nfse.servico.descontoCondicionado ? `<vDescCond>${formatarNumero(nfse.servico.descontoCondicionado)}</vDescCond>` : ''}
      </vDescCondIncond>` : ''}
      <trib>
        <tribMun>
          <tribISSQN>${nfse.servico.tributacaoISSQN}</tribISSQN>
          <cLocIncid>${escapeXml(nfse.servico.localPrestacao.codigoMunicipio)}</cLocIncid>
          <pAliq>${formatarNumero(nfse.servico.aliquotaISS)}</pAliq>
        </tribMun>
        ${nfse.servico.aliquotaPIS || nfse.servico.aliquotaCOFINS ? `
        <totTrib>
          ${nfse.servico.aliquotaPIS ? `<pAliqPIS>${formatarNumero(nfse.servico.aliquotaPIS, 4)}</pAliqPIS>` : ''}
          ${nfse.servico.aliquotaCOFINS ? `<pAliqCOFINS>${formatarNumero(nfse.servico.aliquotaCOFINS, 4)}</pAliqCOFINS>` : ''}
        </totTrib>` : ''}
      </trib>
    </valores>
  </infDPS>
</DPS>`;

  // ⚠️ XML sem assinatura digital; a assinatura real é aplicada por assinarXmlEnvelopado()
  // com elementoAssinado="infDPS", conforme o padrão XML-DSig exigido pela API SefinNacional.
  return xml.trim();
}
