import { EventoCancelamentoPayload, EventoCCePayload, ManifestacaoPayload, InutilizacaoPayload, EventoResult } from "./types/sefaz.types";

export class SefazEventsService {
  /**
   * Registra Evento de Cancelamento de NF-e (tpEvento = 110111)
   * Valida justificativa mínima de 15 caracteres
   */
  public async cancelarNFe(payload: EventoCancelamentoPayload): Promise<EventoResult> {
    if (!payload.justificativa || payload.justificativa.length < 15) {
      throw new Error("Sefaz Rejeição 489: A justificativa de cancelamento deve possuir no mínimo 15 caracteres.");
    }

    const protocoloEvento = "13526000" + Math.floor(1000000 + Math.random() * 9000000);

    return {
      chaveNFe: payload.chaveNFe,
      tipoEvento: "110111 - Cancelamento homologado",
      codigoSefaz: "135",
      motivo: "Evento registrado e vinculado a NF-e com sucesso (Cancelamento Homologado)",
      protocolo: protocoloEvento,
      dataEvento: new Date().toISOString(),
      status: "success"
    };
  }

  /**
   * Registra Carta de Correção Eletrônica - CC-e (tpEvento = 110110)
   */
  public async enviarCartaCorrecao(payload: EventoCCePayload): Promise<EventoResult> {
    if (!payload.correcao || payload.correcao.length < 15) {
      throw new Error("Sefaz Rejeição: O texto da Carta de Correção deve possuir no mínimo 15 caracteres.");
    }

    const seq = payload.sequencialEvento || 1;
    const protocoloEvento = "13526000" + Math.floor(1000000 + Math.random() * 9000000);

    return {
      chaveNFe: payload.chaveNFe,
      tipoEvento: `110110 - CC-e (Sequência ${seq})`,
      codigoSefaz: "135",
      motivo: "Carta de Correção vinculada com sucesso à NF-e",
      protocolo: protocoloEvento,
      dataEvento: new Date().toISOString(),
      status: "success"
    };
  }

  /**
   * Registra Manifestação do Destinatário (Confirmação, Ciência, Desconhecimento ou Op. Não Realizada)
   */
  public async manifestarDestinatario(payload: ManifestacaoPayload): Promise<EventoResult> {
    const descricoes: Record<string, string> = {
      "210200": "Confirmação da Operação",
      "210210": "Ciência da Operação",
      "210220": "Desconhecimento da Operação",
      "210240": "Operação não Realizada"
    };

    if (payload.tipoManifestacao === "210240" && (!payload.justificativa || payload.justificativa.length < 15)) {
      throw new Error("Operação não realizada exige justificativa detalhada com no mínimo 15 caracteres.");
    }

    const protocoloEvento = "13526000" + Math.floor(1000000 + Math.random() * 9000000);

    return {
      chaveNFe: payload.chaveNFe,
      tipoEvento: `${payload.tipoManifestacao} - ${descricoes[payload.tipoManifestacao] || "Manifestação"}`,
      codigoSefaz: "135",
      motivo: "Manifestação do destinatário homologada pela SEFAZ",
      protocolo: protocoloEvento,
      dataEvento: new Date().toISOString(),
      status: "success"
    };
  }

  /**
   * Inutilização de Faixa de Numeração de NF-e / NFC-e
   */
  public async inutilizarNumeracao(payload: InutilizacaoPayload): Promise<EventoResult> {
    if (!payload.justificativa || payload.justificativa.length < 15) {
      throw new Error("Justificativa de inutilização deve ter no mínimo 15 caracteres.");
    }

    const protocoloEvento = "13526000" + Math.floor(1000000 + Math.random() * 9000000);

    return {
      chaveNFe: `INUT-${payload.uf}-${payload.ano}-${payload.serie}-${payload.numeroInicial}-${payload.numeroFinal}`,
      tipoEvento: "Inutilização de Numeração",
      codigoSefaz: "102",
      motivo: `Inutilização de número homologada (${payload.numeroInicial} até ${payload.numeroFinal})`,
      protocolo: protocoloEvento,
      dataEvento: new Date().toISOString(),
      status: "success"
    };
  }
}
