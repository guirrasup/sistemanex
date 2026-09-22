// backend/src/config/cteEndpoints.ts
// Endereços dos webservices SOAP do CT-e (modelo 57) por UF autorizadora,
// ambientes de homologação e produção, layout 4.00.
//
// Gerado a partir das tabelas públicas do projeto sped-cte (nfephp-org):
// https://github.com/nfephp-org/sped-cte/tree/master/storage
// (wscte_4.00_mod57.xml e autorizadores.json). Cobertura completa das 27 UFs + DF.
//
// Diferença importante em relação à NFe: o CT-e 4.00 usa recepção SÍNCRONA
// (CteRecepcao / operation CTeRecepcaoSincV4) em vez do modelo de lote+consulta
// da NFe — não existe um "CTeRetAutorizacao" separado no fluxo normal.

export type AmbienteSefaz = 'homologacao' | 'producao';

export interface EnderecosCte {
  recepcao: string;
  recepcaoSimp: string;
  statusServico: string;
  consultaProtocolo: string;
  recepcaoEvento: string;
}

const CTE_POR_AUTORIZADOR: Record<string, { homologacao: EnderecosCte; producao: EnderecosCte }> = {
  AN: {
    homologacao: {
      recepcao: '',
      recepcaoSimp: '',
      statusServico: '',
      consultaProtocolo: '',
      recepcaoEvento: '',
    },
    producao: {
      recepcao: '',
      recepcaoSimp: '',
      statusServico: '',
      consultaProtocolo: '',
      recepcaoEvento: '',
    },
  },
  MG: {
    homologacao: {
      recepcao: 'https://hcte.fazenda.mg.gov.br/cte/services/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://hcte.fazenda.mg.gov.br/cte/services/CTeRecepcaoSimpV4',
      statusServico: 'https://hcte.fazenda.mg.gov.br/cte/services/CTeStatusServicoV4',
      consultaProtocolo: 'https://hcte.fazenda.mg.gov.br/cte/services/CTeConsultaV4',
      recepcaoEvento: 'https://hcte.fazenda.mg.gov.br/cte/services/CTeRecepcaoEventoV4',
    },
    producao: {
      recepcao: 'https://cte.fazenda.mg.gov.br/cte/services/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://cte.fazenda.mg.gov.br/cte/services/CTeRecepcaoSimpV4',
      statusServico: 'https://cte.fazenda.mg.gov.br/cte/services/CTeStatusServicoV4',
      consultaProtocolo: 'https://cte.fazenda.mg.gov.br/cte/services/CTeConsultaV4',
      recepcaoEvento: 'https://cte.fazenda.mg.gov.br/cte/services/CTeRecepcaoEventoV4',
    },
  },
  MS: {
    homologacao: {
      recepcao: 'https://homologacao.cte.ms.gov.br/ws/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://homologacao.cte.ms.gov.br/ws/CTeRecepcaoSimpV4',
      statusServico: 'https://homologacao.cte.ms.gov.br/ws/CTeStatusServicoV4',
      consultaProtocolo: 'https://homologacao.cte.ms.gov.br/ws/CTeConsultaV4',
      recepcaoEvento: 'https://homologacao.cte.ms.gov.br/ws/CTeRecepcaoEventoV4',
    },
    producao: {
      recepcao: 'https://producao.cte.ms.gov.br/ws/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://producao.cte.ms.gov.br/ws/CTeRecepcaoSimpV4',
      statusServico: 'https://producao.cte.ms.gov.br/ws/CTeStatusServicoV4',
      consultaProtocolo: 'https://producao.cte.ms.gov.br/ws/CTeConsultaV4',
      recepcaoEvento: 'https://producao.cte.ms.gov.br/ws/CTeRecepcaoEventoV4',
    },
  },
  MT: {
    homologacao: {
      recepcao: 'https://homologacao.sefaz.mt.gov.br/ctews2/services/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://homologacao.sefaz.mt.gov.br/cte-ws/services/CTeRecepcaoSimpV4',
      statusServico: 'https://homologacao.sefaz.mt.gov.br/ctews2/services/CTeStatusServicoV4',
      consultaProtocolo: 'https://homologacao.sefaz.mt.gov.br/ctews2/services/CTeConsultaV4',
      recepcaoEvento: 'https://homologacao.sefaz.mt.gov.br/ctews2/services/CTeRecepcaoEventoV4',
    },
    producao: {
      recepcao: 'https://cte.sefaz.mt.gov.br/ctews2/services/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://cte.sefaz.mt.gov.br/cte-ws/services/CTeRecepcaoSimpV4',
      statusServico: 'https://cte.sefaz.mt.gov.br/ctews2/services/CTeStatusServicoV4',
      consultaProtocolo: 'https://cte.sefaz.mt.gov.br/ctews2/services/CTeConsultaV4',
      recepcaoEvento: 'https://cte.sefaz.mt.gov.br/ctews2/services/CTeRecepcaoEventoV4',
    },
  },
  PR: {
    homologacao: {
      recepcao: 'https://homologacao.cte.fazenda.pr.gov.br/cte4/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://homologacao.cte.fazenda.pr.gov.br/cte4/CTeRecepcaoSimpV4',
      statusServico: 'https://homologacao.cte.fazenda.pr.gov.br/cte4/CTeStatusServicoV4',
      consultaProtocolo: 'https://homologacao.cte.fazenda.pr.gov.br/cte4/CTeConsultaV4',
      recepcaoEvento: 'https://homologacao.cte.fazenda.pr.gov.br/cte4/CTeRecepcaoEventoV4',
    },
    producao: {
      recepcao: 'https://cte.fazenda.pr.gov.br/cte4/CTeRecepcaoSincV4',
      recepcaoSimp: 'https://cte.fazenda.pr.gov.br/cte4/CTeRecepcaoSimpV4',
      statusServico: 'https://cte.fazenda.pr.gov.br/cte4/CTeStatusServicoV4',
      consultaProtocolo: 'https://cte.fazenda.pr.gov.br/cte4/CTeConsultaV4',
      recepcaoEvento: 'https://cte.fazenda.pr.gov.br/cte4/CTeRecepcaoEventoV4',
    },
  },
  RS: {
    homologacao: {
      recepcao: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeRecepcaoSincV4/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeRecepcaoSimpV4/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeStatusServicoV4/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeConsultaV4/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeRecepcaoEventoV4/CTeRecepcaoEventoV4.asmx',
    },
    producao: {
      recepcao: 'https://cte.svrs.rs.gov.br/ws/CTeRecepcaoSincV4/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://cte.svrs.rs.gov.br/ws/CTeRecepcaoSimpV4/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://cte.svrs.rs.gov.br/ws/CTeStatusServicoV4/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://cte.svrs.rs.gov.br/ws/CTeConsultaV4/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://cte.svrs.rs.gov.br/ws/CTeRecepcaoEventoV4/CTeRecepcaoEventoV4.asmx',
    },
  },
  SP: {
    homologacao: {
      recepcao: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoEventoV4.asmx',
    },
    producao: {
      recepcao: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoEventoV4.asmx',
    },
  },
  SVRS: {
    homologacao: {
      recepcao: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeRecepcaoSincV4/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeRecepcaoSimpV4/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeStatusServicoV4/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeConsultaV4/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://cte-homologacao.svrs.rs.gov.br/ws/CTeRecepcaoEventoV4/CTeRecepcaoEventoV4.asmx',
    },
    producao: {
      recepcao: 'https://cte.svrs.rs.gov.br/ws/CTeRecepcaoSincV4/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://cte.svrs.rs.gov.br/ws/CTeRecepcaoSimpV4/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://cte.svrs.rs.gov.br/ws/CTeStatusServicoV4/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://cte.svrs.rs.gov.br/ws/CTeConsultaV4/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://cte.svrs.rs.gov.br/ws/CTeRecepcaoEventoV4/CTeRecepcaoEventoV4.asmx',
    },
  },
  SVSP: {
    homologacao: {
      recepcao: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSimpV4asmx',
      statusServico: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://homologacao.nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoEventoV4.asmx',
    },
    producao: {
      recepcao: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSincV4.asmx',
      recepcaoSimp: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoSimpV4.asmx',
      statusServico: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeStatusServicoV4.asmx',
      consultaProtocolo: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeConsultaV4.asmx',
      recepcaoEvento: 'https://nfe.fazenda.sp.gov.br/CTeWS/WS/CTeRecepcaoEventoV4.asmx',
    },
  },
};

const CTE_AUTORIZADOR_POR_UF: Record<string, string> = {
  "AC": "SVRS",
  "AL": "SVRS",
  "AM": "SVRS",
  "AN": "AN",
  "AP": "SVSP",
  "BA": "SVRS",
  "CE": "SVRS",
  "DF": "SVRS",
  "ES": "SVRS",
  "GO": "SVRS",
  "MA": "SVRS",
  "MG": "MG",
  "MS": "MS",
  "MT": "MT",
  "PA": "SVRS",
  "PB": "SVRS",
  "PE": "SVSP",
  "PI": "SVRS",
  "PR": "PR",
  "RJ": "SVRS",
  "RN": "SVRS",
  "RO": "SVRS",
  "RR": "SVSP",
  "RS": "RS",
  "SC": "SVRS",
  "SE": "SVRS",
  "SP": "SP",
  "TO": "SVRS",
  "SVRS": "SVRS",
  "SVSP": "SVSP"
};

export function obterEnderecosCte(uf: string, ambiente: AmbienteSefaz): EnderecosCte {
  const autorizador = CTE_AUTORIZADOR_POR_UF[uf.toUpperCase()] || 'SVRS';
  const config = CTE_POR_AUTORIZADOR[autorizador] || CTE_POR_AUTORIZADOR.SVRS;
  return config[ambiente];
}
