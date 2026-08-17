import { AmbienteSefaz } from "../types/sefaz.types";

export interface SefazEnvironmentConfig {
  ambiente: AmbienteSefaz;
  defaultUf: string;
  versaoSchema: string;
  timeoutMs: number;
  xmlStoragePath: string;
  distribuicaoXmlPath: string;
  logsPath: string;
}

export const defaultSefazEnvConfig: SefazEnvironmentConfig = {
  ambiente: (process.env.SEFAZ_AMBIENTE === "1" ? 1 : 2) as AmbienteSefaz,
  defaultUf: process.env.SEFAZ_UF || "SP",
  versaoSchema: "4.00",
  timeoutMs: Number(process.env.SEFAZ_TIMEOUT) || 30000,
  xmlStoragePath: "tmp/sefaz/autorizadas",
  distribuicaoXmlPath: "tmp/sefaz/distribuicao",
  logsPath: "tmp/sefaz/logs"
};
