// backend/src/config/mdfeEndpoints.ts
// Endereços dos webservices SOAP do MDF-e por UF autorizadora, ambientes de
// homologação e produção, layout 3.00.
//
// O MDF-e é o mais simples dos 4 documentos com SOAP: TODAS as 27 UFs usam o
// mesmo autorizador — a SEFAZ Virtual do Rio Grande do Sul (SVRS/SEFAZ-RS) —
// não há tabela de autorizador por UF para consultar.
// Fonte: https://github.com/nfephp-org/sped-mdfe/tree/master/storage
// (wsmdfe_3.00.xml e autorizadores.json).

export type AmbienteSefaz = 'homologacao' | 'producao';

export interface EnderecosMdfe {
  recepcao: string;
  recepcaoSinc: string;
  retRecepcao: string;
  recepcaoEvento: string;
  consulta: string;
  statusServico: string;
}

const MDFE_RS: { homologacao: EnderecosMdfe; producao: EnderecosMdfe } = {
  homologacao: {
      recepcao: 'https://mdfe-homologacao.svrs.rs.gov.br/ws/MDFerecepcao/MDFeRecepcao.asmx',
      recepcaoSinc: 'https://mdfe-homologacao.svrs.rs.gov.br/ws/MDFeRecepcaoSinc/MDFeRecepcaoSinc.asmx',
      retRecepcao: 'https://mdfe-homologacao.svrs.rs.gov.br/ws/MDFeRetRecepcao/MDFeRetRecepcao.asmx',
      recepcaoEvento: 'https://mdfe-homologacao.svrs.rs.gov.br/ws/MDFeRecepcaoEvento/MDFeRecepcaoEvento.asmx',
      consulta: 'https://mdfe-homologacao.svrs.rs.gov.br/ws/MDFeConsulta/MDFeConsulta.asmx',
      statusServico: 'https://mdfe-homologacao.svrs.rs.gov.br/ws/MDFeStatusServico/MDFeStatusServico.asmx',
  },
  producao: {
      recepcao: 'https://mdfe.svrs.rs.gov.br/ws/MDFeRecepcao/MDFeRecepcao.asmx',
      recepcaoSinc: 'https://mdfe.svrs.rs.gov.br/ws/MDFeRecepcaoSinc/MDFeRecepcaoSinc.asmx',
      retRecepcao: 'https://mdfe.svrs.rs.gov.br/ws/MDFeRetRecepcao/MDFeRetRecepcao.asmx',
      recepcaoEvento: 'https://mdfe.svrs.rs.gov.br/ws/MDFeRecepcaoEvento/MDFeRecepcaoEvento.asmx',
      consulta: 'https://mdfe.svrs.rs.gov.br/ws/MDFeConsulta/MDFeConsulta.asmx',
      statusServico: 'https://mdfe.svrs.rs.gov.br/ws/MDFeStatusServico/MDFeStatusServico.asmx',
  },
};

/** O MDF-e usa o mesmo autorizador (SVRS) para todas as UFs — o parâmetro `uf` existe
 * apenas por simetria de API com obterEnderecosNfe/obterEnderecosCte. */
export function obterEnderecosMdfe(_uf: string, ambiente: AmbienteSefaz): EnderecosMdfe {
  return MDFE_RS[ambiente];
}
