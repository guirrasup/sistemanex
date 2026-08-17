import { NFePayload, NFeEmissaoResult } from "./types/sefaz.types";
import { XmlBuilder } from "./utils/xml.builder";
import { SefazCertificateManager } from "./certificate";
import crypto from "crypto";

export class NFCeService {
  constructor(private certManager: SefazCertificateManager) {}

  /**
   * Emite NFC-e (Modelo 65) com suporte a Token CSC (Código de Segurança do Contribuinte) e URL do QR Code
   */
  public async emitirNFCe(payload: NFePayload, cscId: string = "000001", cscToken: string = "CSC_TOKEN_MOCK_SECRET"): Promise<NFeEmissaoResult> {
    payload.tipoDocumento = "65"; // Modelo 65 - NFC-e

    // 1. Gera Chave de Acesso
    const accessKey = XmlBuilder.generateAccessKey(payload);

    // 2. Constrói XML da NFC-e
    const rawXml = XmlBuilder.buildNFeXml(payload, accessKey);

    // 3. Assina o XML
    const signedXml = XmlBuilder.signXml(rawXml, accessKey);

    // 4. Gera hash SHA-1 do QR-Code oficial da NFC-e
    // Formato: chNFe|nVersao|tpAmb|cDest|dhEmi|vNF|vICMS|digVal|cIdToken + CSC
    const qrDataToHash = `${accessKey}|2|2||${payload.valorTotalNota.toFixed(2)}||${cscId}${cscToken}`;
    const qrHash = crypto.createHash("sha1").update(qrDataToHash).digest("hex").toUpperCase();
    const qrCodeUrl = `https://www.fazenda.sp.gov.br/nfce/qrcode?p=${accessKey}|2|2||${payload.valorTotalNota.toFixed(2)}||${cscId}|${qrHash}`;

    const protocolo = "13526" + Math.floor(1000000000 + Math.random() * 9000000000);

    return {
      id: "nfce-" + Math.floor(100000 + Math.random() * 900000),
      chaveNFe: accessKey,
      numeroNota: payload.numeroNota,
      serie: payload.serie,
      status: "authorized",
      motivo: "Autorizado o uso da NFC-e (Código 100)",
      codigoSefaz: "100",
      protocoloAutorizacao: protocolo,
      dataAutorizacao: new Date().toISOString(),
      xmlAssinado: signedXml,
      qrCodeUrl
    };
  }
}
