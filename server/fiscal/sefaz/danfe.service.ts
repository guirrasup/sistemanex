import { NFePayload, NFeEmissaoResult } from "./types/sefaz.types";

export class DanfeService {
  /**
   * Gera HTML estruturado e estilizado para exibição e impressão direta do DANFE (Documento Auxiliar da NF-e)
   */
  public generateDanfeHtml(nota: NFeEmissaoResult, payload?: NFePayload): string {
    const keyFormatted = nota.chaveNFe.replace(/(\d{4})/g, "$1 ").trim();
    const emitente = payload?.emitente;
    const destinatario = payload?.destinatario;

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>DANFE - Documento Auxiliar da Nota Fiscal Eletrônica</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #111; font-size: 11px; }
    .danfe-container { border: 2px solid #000; padding: 10px; max-w: 800px; margin: 0 auto; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .header-table td { border: 1px solid #000; padding: 4px; vertical-align: top; }
    .title { font-weight: bold; font-size: 14px; text-align: center; margin-bottom: 2px; }
    .subtitle { text-align: center; font-size: 9px; }
    .barcode-box { text-align: center; padding: 6px; font-family: monospace; font-size: 13px; font-weight: bold; background: #f0f0f0; }
    .field-label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #444; display: block; }
    .field-value { font-size: 11px; font-weight: bold; }
    .section-header { background: #333; color: #fff; font-weight: bold; padding: 3px 6px; font-size: 10px; text-transform: uppercase; margin-top: 8px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .data-table th, .data-table td { border: 1px solid #000; padding: 3px; text-align: left; font-size: 10px; }
    .data-table th { background: #e2e2e2; }
    .total-box { font-size: 14px; font-weight: bold; color: #000; text-align: right; }
  </style>
</head>
<body>
  <div class="danfe-container">
    <table class="header-table">
      <tr>
        <td style="width: 45%;">
          <div class="title">${emitente?.razaoSocial || "NEXS GESTOR TECNOLOGIA SA"}</div>
          <div class="subtitle">${emitente?.endereco.logradouro || "Av. Paulista"}, ${emitente?.endereco.numero || "1100"} - ${emitente?.endereco.nomeMunicipio || "São Paulo"}/${emitente?.endereco.uf || "SP"}</div>
          <div class="subtitle">CNPJ: ${emitente?.cnpj || "12.345.678/0001-90"} - IE: ${emitente?.inscricaoEstadual || "110.293.840.111"}</div>
        </td>
        <td style="width: 25%; text-align: center;">
          <div class="title">DANFE</div>
          <div class="subtitle">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</div>
          <div style="font-weight: bold; margin-top: 4px;">0 - ENTRADA<br>1 - SAÍDA [ 1 ]</div>
          <div style="font-size: 12px; margin-top: 4px; font-weight: bold;">Nº ${nota.numeroNota}</div>
          <div style="font-size: 10px;">SÉRIE: ${nota.serie}</div>
        </td>
        <td style="width: 30%;">
          <span class="field-label">CHAVE DE ACESSO DA NF-E</span>
          <div class="barcode-box">${keyFormatted}</div>
          <div style="font-size: 8px; margin-top: 4px; text-align: center;">
            Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal
          </div>
        </td>
      </tr>
    </table>

    <table class="header-table">
      <tr>
        <td>
          <span class="field-label">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
          <span class="field-value">${nota.protocoloAutorizacao || "135260009821034"} - ${nota.dataAutorizacao || new Date().toLocaleString("pt-BR")}</span>
        </td>
      </tr>
    </table>

    <div class="section-header">DESTINATÁRIO / REMETENTE</div>
    <table class="header-table">
      <tr>
        <td style="width: 60%;">
          <span class="field-label">NOME / RAZÃO SOCIAL</span>
          <span class="field-value">${destinatario?.razaoSocial || "CLIENTE CONSUMIDOR FINAL SA"}</span>
        </td>
        <td style="width: 40%;">
          <span class="field-label">CPF / CNPJ</span>
          <span class="field-value">${destinatario?.cpfCnpj || "98.765.432/0001-10"}</span>
        </td>
      </tr>
    </table>

    <div class="section-header">DADOS DOS PRODUTOS / SERVIÇOS</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>CÓDIGO</th>
          <th>DESCRIÇÃO DOS PRODUTOS</th>
          <th>NCM/SH</th>
          <th>CFOP</th>
          <th>UNID</th>
          <th>QTD</th>
          <th>V.UNIT</th>
          <th>V.TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${(payload?.itens || [
          { codigo: "PROD-001", descricao: "Licença Software ERP Enterprise", ncm: "84715010", cfop: "5102", unidade: "UN", quantidade: 1, valorUnitario: payload?.valorTotalNota || 12500, valorTotal: payload?.valorTotalNota || 12500 }
        ]).map(item => `
          <tr>
            <td>${item.codigo}</td>
            <td>${item.descricao}</td>
            <td>${item.ncm}</td>
            <td>${item.cfop}</td>
            <td>${item.unidade}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.valorUnitario.toFixed(2)}</td>
            <td>R$ ${item.valorTotal.toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div style="margin-top: 12px; border-top: 2px solid #000; padding-top: 6px;" class="total-box">
      VALOR TOTAL DA NOTA: R$ ${(payload?.valorTotalNota || 12500.00).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
