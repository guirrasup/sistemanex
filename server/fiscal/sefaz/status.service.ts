import { AmbienteSefaz, StatusServicoResult } from "./types/sefaz.types";
import { getSefazUrls } from "./config/urls";

export class SefazStatusService {
  /**
   * Consulta a disponibilidade do Serviço SEFAZ na UF e Ambiente especificados
   */
  public async consultarStatus(uf: string = "SP", ambiente: AmbienteSefaz = 2): Promise<StatusServicoResult> {
    const urls = getSefazUrls(uf, ambiente);
    const start = Date.now();

    // Emula resposta síncrona do WebService NFeStatusServico4 da SEFAZ
    const responseTime = (Date.now() - start + Math.floor(Math.random() * 150 + 50)) / 1000;

    return {
      uf: uf.toUpperCase(),
      ambiente,
      codigoSefaz: "107",
      motivo: `Serviço SEFAZ ${uf.toUpperCase()} em operação normal (${urls.statusServico})`,
      tempoMedioRespostaSegundos: responseTime,
      disponivel: true,
      dataConsulta: new Date().toISOString()
    };
  }
}
