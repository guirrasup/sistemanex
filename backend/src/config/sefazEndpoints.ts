// backend/src/config/sefazEndpoints.ts
// Endereços dos webservices SOAP da NF-e (modelo 55) e NFC-e (modelo 65) por UF
// autorizadora, ambientes de homologação e produção, layout 4.00.
//
// Gerado a partir das tabelas públicas do projeto sped-nfe (nfephp-org), que mantém
// esses endereços atualizados: https://github.com/nfephp-org/sped-nfe/tree/master/storage
// (arquivos wsnfe_4.00_mod55.xml, wsnfe_4.00_mod65.xml e autorizadores.json).
// Cobertura completa das 27 UFs + DF para NFe e NFCe.

export type AmbienteSefaz = 'homologacao' | 'producao';

export interface EnderecosServicoUf {
  autorizacao: string;
  retAutorizacao: string;
  statusServico: string;
  consultaProtocolo: string;
  inutilizacao: string;
  recepcaoEvento: string;
}

const NFE_POR_AUTORIZADOR: Record<string, { homologacao: EnderecosServicoUf; producao: EnderecosServicoUf }> = {
  AM: {
    homologacao: {
      autorizacao: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeAutorizacao4',
      retAutorizacao: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeRetAutorizacao4',
      statusServico: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeStatusServico4',
      consultaProtocolo: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeConsulta4',
      inutilizacao: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://homnfe.sefaz.am.gov.br/services2/services/RecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.am.gov.br/services2/services/NfeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.am.gov.br/services2/services/NfeRetAutorizacao4',
      statusServico: 'https://nfe.sefaz.am.gov.br/services2/services/NfeStatusServico4',
      consultaProtocolo: 'https://nfe.sefaz.am.gov.br/services2/services/NfeConsulta4',
      inutilizacao: 'https://nfe.sefaz.am.gov.br/services2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.am.gov.br/services2/services/RecepcaoEvento4',
    },
  },
  AN: {
    homologacao: {
      autorizacao: '',
      retAutorizacao: '',
      statusServico: '',
      consultaProtocolo: '',
      inutilizacao: '',
      recepcaoEvento: 'https://hom1.nfe.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    producao: {
      autorizacao: '',
      retAutorizacao: '',
      statusServico: '',
      consultaProtocolo: '',
      inutilizacao: '',
      recepcaoEvento: 'https://www.nfe.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  BA: {
    homologacao: {
      autorizacao: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      statusServico: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeStatusServico4/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.ba.gov.br/webservices/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.sefaz.ba.gov.br/webservices/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe.sefaz.ba.gov.br/webservices/NFeStatusServico4/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe.sefaz.ba.gov.br/webservices/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://nfe.sefaz.ba.gov.br/webservices/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.sefaz.ba.gov.br/webservices/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  GO: {
    homologacao: {
      autorizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeAutorizacao4',
      retAutorizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeRetAutorizacao4',
      statusServico: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeStatusServico4',
      consultaProtocolo: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeInutilizacao4',
      recepcaoEvento: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeRetAutorizacao4',
      statusServico: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeStatusServico4',
      consultaProtocolo: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeRecepcaoEvento4',
    },
  },
  MG: {
    homologacao: {
      autorizacao: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4',
      retAutorizacao: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4',
      statusServico: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4',
      consultaProtocolo: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4',
      recepcaoEvento: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4',
      statusServico: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4',
      consultaProtocolo: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4',
    },
  },
  MS: {
    homologacao: {
      autorizacao: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeAutorizacao4',
      retAutorizacao: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeRetAutorizacao4',
      statusServico: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeStatusServico4',
      consultaProtocolo: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4',
      inutilizacao: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeInutilizacao4',
      recepcaoEvento: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.ms.gov.br/ws/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.ms.gov.br/ws/NFeRetAutorizacao4',
      statusServico: 'https://nfe.sefaz.ms.gov.br/ws/NFeStatusServico4',
      consultaProtocolo: 'https://nfe.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.ms.gov.br/ws/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.ms.gov.br/ws/NFeRecepcaoEvento4',
    },
  },
  MT: {
    homologacao: {
      autorizacao: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeAutorizacao4',
      retAutorizacao: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeRetAutorizacao4',
      statusServico: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeStatusServico4',
      consultaProtocolo: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeConsulta4',
      inutilizacao: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/RecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeRetAutorizacao4',
      statusServico: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeStatusServico4',
      consultaProtocolo: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeConsulta4',
      inutilizacao: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/RecepcaoEvento4',
    },
  },
  PE: {
    homologacao: {
      autorizacao: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeRetAutorizacao4',
      statusServico: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeStatusServico4',
      consultaProtocolo: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeRetAutorizacao4',
      statusServico: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeStatusServico4',
      consultaProtocolo: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeRecepcaoEvento4',
    },
  },
  PR: {
    homologacao: {
      autorizacao: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeAutorizacao4',
      retAutorizacao: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeRetAutorizacao4',
      statusServico: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeStatusServico4',
      consultaProtocolo: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeConsultaProtocolo4',
      inutilizacao: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeInutilizacao4',
      recepcaoEvento: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefa.pr.gov.br/nfe/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefa.pr.gov.br/nfe/NFeRetAutorizacao4',
      statusServico: 'https://nfe.sefa.pr.gov.br/nfe/NFeStatusServico4',
      consultaProtocolo: 'https://nfe.sefa.pr.gov.br/nfe/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefa.pr.gov.br/nfe/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefa.pr.gov.br/nfe/NFeRecepcaoEvento4',
    },
  },
  RS: {
    homologacao: {
      autorizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfe.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
  SP: {
    homologacao: {
      autorizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
      retAutorizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx',
      statusServico: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
      consultaProtocolo: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
      inutilizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
      retAutorizacao: 'https://nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx',
      statusServico: 'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
      consultaProtocolo: 'https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
      inutilizacao: 'https://nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx',
    },
  },
  SVAN: {
    homologacao: {
      autorizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      statusServico: 'https://hom.sefazvirtual.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://hom.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://hom.sefazvirtual.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    producao: {
      autorizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      statusServico: 'https://www.sefazvirtual.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://www.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://www.sefazvirtual.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  SVRS: {
    homologacao: {
      autorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
  SVCAN: {
    homologacao: {
      autorizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      statusServico: 'https://hom.sefazvirtual.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://hom.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://hom.sefazvirtual.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    producao: {
      autorizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      statusServico: 'https://www.sefazvirtual.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://www.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://www.sefazvirtual.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  SVCRS: {
    homologacao: {
      autorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
};

const NFE_AUTORIZADOR_POR_UF: Record<string, string> = {
  "AC": "SVRS",
  "AL": "SVRS",
  "AM": "AM",
  "AN": "AN",
  "AP": "SVRS",
  "BA": "BA",
  "CE": "SVRS",
  "DF": "SVRS",
  "ES": "SVRS",
  "GO": "GO",
  "MA": "SVAN",
  "MG": "MG",
  "MS": "MS",
  "MT": "MT",
  "PA": "SVRS",
  "PB": "SVRS",
  "PE": "PE",
  "PI": "SVRS",
  "PR": "PR",
  "RJ": "SVRS",
  "RN": "SVRS",
  "RO": "SVRS",
  "RR": "SVRS",
  "RS": "RS",
  "SC": "SVRS",
  "SE": "SVRS",
  "SP": "SP",
  "TO": "SVRS",
  "SVAN": "SVAN",
  "SVRS": "SVRS",
  "SVCAN": "SVCAN",
  "SVCRS": "SVCRS"
};

export function obterEnderecosNfe(uf: string, ambiente: AmbienteSefaz): EnderecosServicoUf {
  const autorizador = NFE_AUTORIZADOR_POR_UF[uf.toUpperCase()] || 'SVRS';
  const config = NFE_POR_AUTORIZADOR[autorizador] || NFE_POR_AUTORIZADOR.SVRS;
  return config[ambiente];
}

const NFCE_POR_AUTORIZADOR: Record<string, { homologacao: EnderecosServicoUf; producao: EnderecosServicoUf }> = {
  AM: {
    homologacao: {
      autorizacao: 'https://homnfce.sefaz.am.gov.br/nfce-services/services/NfeAutorizacao4',
      retAutorizacao: 'https://homnfce.sefaz.am.gov.br/nfce-services/services/NfeRetAutorizacao4',
      statusServico: 'https://homnfce.sefaz.am.gov.br/nfce-services/services/NfeStatusServico4',
      consultaProtocolo: 'https://homnfce.sefaz.am.gov.br/nfce-services/services/NfeConsulta4',
      inutilizacao: 'https://homnfce.sefaz.am.gov.br/nfce-services/services/NfeInutilizacao4',
      recepcaoEvento: 'https://homnfce.sefaz.am.gov.br/nfce-services/services/RecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfce.sefaz.am.gov.br/nfce-services/services/NfeAutorizacao4',
      retAutorizacao: 'https://nfce.sefaz.am.gov.br/nfce-services/services/NfeRetAutorizacao4',
      statusServico: 'https://nfce.sefaz.am.gov.br/nfce-services/services/NfeStatusServico4',
      consultaProtocolo: 'https://nfce.sefaz.am.gov.br/nfce-services/services/NfeConsulta4',
      inutilizacao: 'https://nfce.sefaz.am.gov.br/nfce-services/services/NfeInutilizacao4',
      recepcaoEvento: 'https://nfce.sefaz.am.gov.br/nfce-services/services/RecepcaoEvento4',
    },
  },
  GO: {
    homologacao: {
      autorizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeAutorizacao4',
      retAutorizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeRetAutorizacao4',
      statusServico: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeStatusServico4',
      consultaProtocolo: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeInutilizacao4',
      recepcaoEvento: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeRetAutorizacao4',
      statusServico: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeStatusServico4',
      consultaProtocolo: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeRecepcaoEvento4',
    },
  },
  MG: {
    homologacao: {
      autorizacao: 'https://hnfce.fazenda.mg.gov.br/nfce/services/NFeAutorizacao4',
      retAutorizacao: 'https://hnfce.fazenda.mg.gov.br/nfce/services/NFeRetAutorizacao4',
      statusServico: 'https://hnfce.fazenda.mg.gov.br/nfce/services/NFeStatusServico4',
      consultaProtocolo: 'https://hnfce.fazenda.mg.gov.br/nfce/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://hnfce.fazenda.mg.gov.br/nfce/services/NFeInutilizacao4',
      recepcaoEvento: 'https://hnfce.fazenda.mg.gov.br/nfce/services/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfce.fazenda.mg.gov.br/nfce/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfce.fazenda.mg.gov.br/nfce/services/NFeRetAutorizacao4',
      statusServico: 'https://nfce.fazenda.mg.gov.br/nfce/services/NFeStatusServico4',
      consultaProtocolo: 'https://nfce.fazenda.mg.gov.br/nfce/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfce.fazenda.mg.gov.br/nfce/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfce.fazenda.mg.gov.br/nfce/services/NFeRecepcaoEvento4',
    },
  },
  MT: {
    homologacao: {
      autorizacao: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeAutorizacao4',
      retAutorizacao: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeRetAutorizacao4',
      statusServico: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeStatusServico4',
      consultaProtocolo: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeConsulta4',
      inutilizacao: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeInutilizacao4',
      recepcaoEvento: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/RecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeAutorizacao4',
      retAutorizacao: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeRetAutorizacao4',
      statusServico: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeStatusServico4',
      consultaProtocolo: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeConsulta4',
      inutilizacao: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeInutilizacao4',
      recepcaoEvento: 'https://nfce.sefaz.mt.gov.br/nfcews/services/RecepcaoEvento4',
    },
  },
  MS: {
    homologacao: {
      autorizacao: 'https://hom.nfce.sefaz.ms.gov.br/ws/NFeAutorizacao4',
      retAutorizacao: 'https://hom.nfce.sefaz.ms.gov.br/ws/NFeRetAutorizacao4',
      statusServico: 'https://hom.nfce.sefaz.ms.gov.br/ws/NFeStatusServico4',
      consultaProtocolo: 'https://hom.nfce.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4',
      inutilizacao: 'https://hom.nfce.sefaz.ms.gov.br/ws/NFeInutilizacao4',
      recepcaoEvento: 'https://hom.nfce.sefaz.ms.gov.br/ws/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfce.sefaz.ms.gov.br/ws/NFeAutorizacao4',
      retAutorizacao: 'https://nfce.sefaz.ms.gov.br/ws/NFeRetAutorizacao4',
      statusServico: 'https://nfce.sefaz.ms.gov.br/ws/NFeStatusServico4',
      consultaProtocolo: 'https://nfce.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfce.sefaz.ms.gov.br/ws/NFeInutilizacao4',
      recepcaoEvento: 'https://nfce.sefaz.ms.gov.br/ws/NFeRecepcaoEvento4',
    },
  },
  PR: {
    homologacao: {
      autorizacao: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/NFeAutorizacao4',
      retAutorizacao: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/NFeRetAutorizacao4',
      statusServico: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/NFeStatusServico4',
      consultaProtocolo: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/NFeConsultaProtocolo4',
      inutilizacao: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/NFeInutilizacao4',
      recepcaoEvento: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/NFeRecepcaoEvento4',
    },
    producao: {
      autorizacao: 'https://nfce.sefa.pr.gov.br/nfce/NFeAutorizacao4',
      retAutorizacao: 'https://nfce.sefa.pr.gov.br/nfce/NFeRetAutorizacao4',
      statusServico: 'https://nfce.sefa.pr.gov.br/nfce/NFeStatusServico4',
      consultaProtocolo: 'https://nfce.sefa.pr.gov.br/nfce/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfce.sefa.pr.gov.br/nfce/NFeInutilizacao4',
      recepcaoEvento: 'https://nfce.sefa.pr.gov.br/nfce/NFeRecepcaoEvento4',
    },
  },
  RS: {
    homologacao: {
      autorizacao: 'https://nfce-homologacao.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfce-homologacao.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfce-homologacao.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfce-homologacao.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfce-homologacao.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfce-homologacao.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfce.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfce.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfce.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfce.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfce.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfce.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
  SP: {
    homologacao: {
      autorizacao: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx',
      statusServico: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeRecepcaoEvento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx',
      consultaProtocolo: 'https://nfce.fazenda.sp.gov.br/ws/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://nfce.fazenda.sp.gov.br/ws/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://nfce.fazenda.sp.gov.br/ws/NFeRecepcaoEvento4.asmx',
    },
  },
  SVRS: {
    homologacao: {
      autorizacao: 'https://nfce-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfce-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfce-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfce-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfce-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfce-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    producao: {
      autorizacao: 'https://nfce.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfce.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      statusServico: 'https://nfce.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      consultaProtocolo: 'https://nfce.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfce.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfce.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
};

const NFCE_AUTORIZADOR_POR_UF: Record<string, string> = {
  "AC": "SVRS",
  "AL": "SVRS",
  "AM": "AM",
  "AP": "SVRS",
  "BA": "SVRS",
  "CE": "SVRS",
  "DF": "SVRS",
  "ES": "SVRS",
  "GO": "GO",
  "MA": "SVRS",
  "MG": "MG",
  "MS": "MS",
  "MT": "MT",
  "PA": "SVRS",
  "PB": "SVRS",
  "PE": "SVRS",
  "PI": "SVRS",
  "PR": "PR",
  "RJ": "SVRS",
  "RN": "SVRS",
  "RO": "SVRS",
  "RR": "SVRS",
  "RS": "RS",
  "SC": "SVRS",
  "SE": "SVRS",
  "SP": "SP",
  "TO": "SVRS",
  "SVRS": "SVRS"
};

export function obterEnderecosNfce(uf: string, ambiente: AmbienteSefaz): EnderecosServicoUf {
  const autorizador = NFCE_AUTORIZADOR_POR_UF[uf.toUpperCase()] || 'SVRS';
  const config = NFCE_POR_AUTORIZADOR[autorizador] || NFCE_POR_AUTORIZADOR.SVRS;
  return config[ambiente];
}

/** @deprecated use obterEnderecosNfe (NFe) ou obterEnderecosNfce (NFC-e) */
export function obterEnderecosSefaz(uf: string, ambiente: AmbienteSefaz): EnderecosServicoUf {
  return obterEnderecosNfe(uf, ambiente);
}
