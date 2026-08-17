import { AmbienteSefaz } from "../types/sefaz.types";

export interface SefazEndpoints {
  autorizacao: string;
  retAutorizacao: string;
  consultaProtocolo: string;
  statusServico: string;
  recepcaoEvento: string;
  inutilizacao: string;
}

export const SEFAZ_URLS: Record<AmbienteSefaz, Record<string, SefazEndpoints>> = {
  1: { // Produção
    SP: {
      autorizacao: "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
      retAutorizacao: "https://nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx",
      consultaProtocolo: "https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx",
      statusServico: "https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx",
      recepcaoEvento: "https://nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx",
      inutilizacao: "https://nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx"
    },
    RJ: {
      autorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
      retAutorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
      consultaProtocolo: "https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
      statusServico: "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
      recepcaoEvento: "https://nfe.svrs.rs.gov.br/ws/NfeRecepcaoEvento/NfeRecepcaoEvento4.asmx",
      inutilizacao: "https://nfe.svrs.rs.gov.br/ws/NfeInutilizacao/NfeInutilizacao4.asmx"
    },
    MG: {
      autorizacao: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4",
      retAutorizacao: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4",
      consultaProtocolo: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
      statusServico: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4",
      recepcaoEvento: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4",
      inutilizacao: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4"
    },
    RS: {
      autorizacao: "https://nfe.sefaz.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
      retAutorizacao: "https://nfe.sefaz.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
      consultaProtocolo: "https://nfe.sefaz.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
      statusServico: "https://nfe.sefaz.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
      recepcaoEvento: "https://nfe.sefaz.rs.gov.br/ws/NfeRecepcaoEvento/NfeRecepcaoEvento4.asmx",
      inutilizacao: "https://nfe.sefaz.rs.gov.br/ws/NfeInutilizacao/NfeInutilizacao4.asmx"
    },
    SVRS: { // SEFAZ Virtual RS (Atende vários estados como SC, PR, DF, etc)
      autorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
      retAutorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
      consultaProtocolo: "https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
      statusServico: "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
      recepcaoEvento: "https://nfe.svrs.rs.gov.br/ws/NfeRecepcaoEvento/NfeRecepcaoEvento4.asmx",
      inutilizacao: "https://nfe.svrs.rs.gov.br/ws/NfeInutilizacao/NfeInutilizacao4.asmx"
    }
  },
  2: { // Homologação
    SP: {
      autorizacao: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
      retAutorizacao: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx",
      consultaProtocolo: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx",
      statusServico: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx",
      recepcaoEvento: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx",
      inutilizacao: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx"
    },
    RJ: {
      autorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
      retAutorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
      consultaProtocolo: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
      statusServico: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
      recepcaoEvento: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRecepcaoEvento/NfeRecepcaoEvento4.asmx",
      inutilizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeInutilizacao/NfeInutilizacao4.asmx"
    },
    MG: {
      autorizacao: "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4",
      retAutorizacao: "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4",
      consultaProtocolo: "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
      statusServico: "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4",
      recepcaoEvento: "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4",
      inutilizacao: "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4"
    },
    RS: {
      autorizacao: "https://nfe-homologacao.sefaz.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
      retAutorizacao: "https://nfe-homologacao.sefaz.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
      consultaProtocolo: "https://nfe-homologacao.sefaz.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
      statusServico: "https://nfe-homologacao.sefaz.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
      recepcaoEvento: "https://nfe-homologacao.sefaz.rs.gov.br/ws/NfeRecepcaoEvento/NfeRecepcaoEvento4.asmx",
      inutilizacao: "https://nfe-homologacao.sefaz.rs.gov.br/ws/NfeInutilizacao/NfeInutilizacao4.asmx"
    },
    SVRS: {
      autorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
      retAutorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
      consultaProtocolo: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
      statusServico: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
      recepcaoEvento: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRecepcaoEvento/NfeRecepcaoEvento4.asmx",
      inutilizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeInutilizacao/NfeInutilizacao4.asmx"
    }
  }
};

export function getSefazUrls(uf: string, ambiente: AmbienteSefaz): SefazEndpoints {
  const upperUf = uf.toUpperCase();
  const envMap = SEFAZ_URLS[ambiente];
  if (envMap[upperUf]) {
    return envMap[upperUf];
  }
  return envMap["SVRS"] || envMap["SP"];
}
