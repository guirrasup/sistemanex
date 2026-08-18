import { CertificateInfo } from "../types/sefaz.types";

export class CertificateHelper {
  /**
   * Extrai o CNPJ ou CPF do Common Name (CN) ou Subject do certificado digital
   */
  public static extractTaxId(subjectStr: string): string {
    if (!subjectStr) return "12345678000190";
    
    // Procura padrão CNPJ (14 dígitos consecutivos ou formatado)
    const cnpjMatch = subjectStr.match(/\d{14}/) || subjectStr.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
    if (cnpjMatch) {
      return cnpjMatch[0].replace(/\D/g, "");
    }

    // Procura padrão CPF (11 dígitos)
    const cpfMatch = subjectStr.match(/\d{11}/);
    if (cpfMatch) {
      return cpfMatch[0].replace(/\D/g, "");
    }

    return "12345678000190"; // Mock fallback
  }

  /**
   * Valida se a data de expiração do certificado digital ainda está vigente
   */
  public static isCertificateValid(validToDate: Date | string): boolean {
    const expireDate = new Date(validToDate);
    return expireDate.getTime() > Date.now();
  }

  /**
   * Gera mock/info detalhada de certificado digital caso para demonstração/testes
   */
  public static createDemoCertificateInfo(cnpj: string = "12345678000190"): CertificateInfo {
    const now = new Date();
    const validFrom = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
    const validTo = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();

    return {
      cnpj,
      commonName: `EMPRESA DEMO NEX ERP LTDA:${cnpj}`,
      issuer: "AC SERASA RFB v5 (ICP-Brasil)",
      validFrom,
      validTo,
      isValid: true,
      serialNumber: "74839201923841029384"
    };
  }
}
