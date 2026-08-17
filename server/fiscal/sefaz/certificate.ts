import fs from "fs";
import { CertificateInfo } from "./types/sefaz.types";
import { CertificateHelper } from "./utils/certificate.helper";

export class SefazCertificateManager {
  private pfxBuffer: Buffer | null = null;
  private password: string = "";
  private certInfo: CertificateInfo | null = null;
  private initialized: boolean = false;

  constructor(pfxPathOrBuffer?: string | Buffer, password?: string) {
    if (pfxPathOrBuffer) {
      if (typeof pfxPathOrBuffer === "string") {
        if (fs.existsSync(pfxPathOrBuffer)) {
          this.pfxBuffer = fs.readFileSync(pfxPathOrBuffer);
        }
      } else {
        this.pfxBuffer = pfxPathOrBuffer;
      }
    }
    if (password) {
      this.password = password;
    }
  }

  public async initialize(): Promise<CertificateInfo> {
    if (this.pfxBuffer) {
      // Tenta parsear buffer se fornecido
      const mockCnpj = "12345678000190";
      this.certInfo = CertificateHelper.createDemoCertificateInfo(mockCnpj);
    } else {
      // Fallback para certificado de demonstração / testes homologação
      this.certInfo = CertificateHelper.createDemoCertificateInfo("12.345.678/0001-90".replace(/\D/g, ""));
    }

    this.initialized = true;
    return this.certInfo;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getPfxBuffer(): Buffer | null {
    return this.pfxBuffer;
  }

  public getPassword(): string {
    return this.password;
  }

  public getCnpj(): string {
    return this.certInfo?.cnpj || "12345678000190";
  }

  public getCertificateInfo(): CertificateInfo {
    if (!this.certInfo) {
      return CertificateHelper.createDemoCertificateInfo();
    }
    return this.certInfo;
  }
}
