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
  const isCnpjEmit = cnpjEmit.length === 14;
  const docToma = limparDocumento(nfse.tomador.documento);
  const isCnpjToma = docToma.length === 14;
  const tpAmb = nfse.ambiente === 1 ? '1' : '2';
  // O Id da DPS (TSIdDPS) NÃO é "DPS"+chave de acesso da NFS-e (que é um
  // identificador diferente, gerado pelo próprio Sistema Nacional na resposta) —
  // é "DPS"+cMun(7)+tpInsc(1)+CNPJ/CPF(14)+série(5, zero-padded)+nDPS(15,
  // zero-padded) = 42 dígitos fixos (confirmado no XSD oficial: TSIdDPS =
  // "DPS[0-9]{42}", e num exemplo real de produção do SDK nfse-nacional/nfse-php).
  // tpInsc é "1" para CPF e "2" para CNPJ (confirmado no mesmo exemplo real —
  // usar "1" para CNPJ, como uma primeira tentativa assumiu, causa E0004
  // "identificador difere da concatenação dos campos correspondentes", pois o
  // ADN recalcula tpInsc a partir do CNPJ/CPF informado em <prest>). Os
  // elementos <serie>/<nDPS> permanecem SEM zero-padding (apenas o Id é padded).
  const idDps = `DPS${nfse.emitente.endereco.codigoMunicipio}${isCnpjEmit ? '2' : '1'}${cnpjEmit}${String(nfse.serieDPS).padStart(5, '0')}${String(nfse.numeroDPS).padStart(15, '0')}`;

  // 🔥 cTribMun (TCCodTribMun) é restrito pelo XSD do Sistema Nacional a
  // exatamente 3 dígitos — confirmado por rejeição real ("[E1235] Falha no
  // esquema XML... valor 'X' inválido para TCCodTribMun") e por um caso
  // idêntico documentado publicamente (TOTVS: "The value 'X' is not accepted
  // by the pattern '[0-9]{3}'"). É um código de 3 dígitos definido por cada
  // prefeitura — diferente do código nacional (cTribNac, 6 dígitos, item da
  // LC 116) — então não dá pra simplesmente truncar/preencher um valor de
  // tamanho errado; como o campo é opcional, omitimos quando não bate esse
  // formato, até o usuário configurar o código de 3 dígitos do seu município.
  // .trim() é essencial aqui: a coluna codigoTributacaoMunicipal é Char(4) no
  // Postgres, que preenche com espaço à direita valores menores que 4 — um
  // "000" salvo vira "000 " na leitura, o que quebraria o teste de 3 dígitos
  // abaixo mesmo já estando no formato certo.
  const codTribMunLimpo = (nfse.servico.codigoTributacaoMunicipal || '').trim();
  const cTribMunTag = /^\d{3}$/.test(codTribMunLimpo)
    ? `<cTribMun>${escapeXml(codTribMunLimpo)}</cTribMun>`
    : '';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infDPS Id="${escapeXml(idDps)}">
    <tpAmb>${tpAmb}</tpAmb>
    <dhEmi>${nfse.dataHoraEmissao}</dhEmi>
    <verAplic>SUP-TECNOLOGIA-1.00</verAplic>
    <serie>${nfse.serieDPS}</serie>
    <nDPS>${nfse.numeroDPS}</nDPS>
    <dCompet>${nfse.dataCompetencia}</dCompet>
    <tpEmit>1</tpEmit>
    <cLocEmi>${escapeXml(nfse.emitente.endereco.codigoMunicipio)}</cLocEmi>

    <!-- PRESTADOR -->
    <prest>
      <CNPJ>${cnpjEmit}</CNPJ>
      ${nfse.emitente.inscricaoMunicipal ? `<IM>${escapeXml(nfse.emitente.inscricaoMunicipal)}</IM>` : ''}
      <xNome>${escapeXml(nfse.emitente.razaoSocial)}</xNome>
      ${nfse.emitente.endereco.telefone ? `<fone>${limparDocumento(nfse.emitente.endereco.telefone)}</fone>` : ''}
      ${nfse.emitente.endereco.email ? `<email>${escapeXml(nfse.emitente.endereco.email)}</email>` : ''}
      <regTrib>
        <opSimpNac>${nfse.emitente.optanteMEI ? 2 : nfse.emitente.optanteSimplesNacional ? 3 : 1}</opSimpNac>
        <regEspTrib>0</regEspTrib>
      </regTrib>
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
      ${nfse.tomador.telefone ? `<fone>${limparDocumento(nfse.tomador.telefone)}</fone>` : ''}
      ${nfse.tomador.email ? `<email>${escapeXml(nfse.tomador.email)}</email>` : ''}
    </toma>

    <!-- SERVIÇO -->
    <serv>
      <locPrest>
        <cLocPrestacao>${escapeXml(nfse.servico.localPrestacao.codigoMunicipio)}</cLocPrestacao>
      </locPrest>
      <cServ>
        <cTribNac>${escapeXml(nfse.servico.codigoTributacaoNacional)}</cTribNac>
        ${cTribMunTag}
        <xDescServ>${escapeXml(nfse.servico.descricao)}</xDescServ>
        ${nfse.servico.codigoNBS ? `<cNBS>${limparDocumento(nfse.servico.codigoNBS)}</cNBS>` : ''}
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
          <!-- pAliq omitido: para municípios registrados no Sistema Nacional a
               alíquota é parametrizada pelo próprio sistema — confirmado via
               rejeição real do ADN (pAliq não aparece entre os elementos aceitos
               nessa posição quando o município de incidência está no Sistema Nacional). -->
          <tpRetISSQN>${nfse.servico.tipoRetencaoISS}</tpRetISSQN>
        </tribMun>
        <totTrib>
          <!-- Decreto 8.264/2014: quando não se informa valor estimado de tributos,
               usa-se indTotTrib=0 (confirmado contra o XSD oficial: totTrib é
               obrigatório e é uma choice entre vTotTrib/pTotTrib/indTotTrib/pTotTribSN). -->
          <indTotTrib>0</indTotTrib>
        </totTrib>
      </trib>
    </valores>
  </infDPS>
</DPS>`;

  // ⚠️ XML sem assinatura digital; a assinatura real é aplicada por assinarXmlEnvelopado()
  // com elementoAssinado="infDPS", conforme o padrão XML-DSig exigido pela API SefinNacional.
  return xml.trim();
}
