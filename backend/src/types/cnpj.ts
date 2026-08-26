// C:\emissornfe\backend\src\types\cnpj.ts

export interface ConectaGovTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
}

export interface ConectaGovEmpresaResponse {
  ni: string;
  tipoEstabelecimento: string;
  nomeEmpresarial: string;
  nomeFantasia: string;
  situacaoCadastral: {
    codigo: string;
    data: string;
    motivo: string;
  };
  naturezaJuridica: {
    codigo: string;
    descricao: string;
  };
  dataAbertura: string;
  cnaePrincipal: {
    codigo: string;
    descricao: string;
  };
  cnaeSecundarias: Array<{
    codigo: string;
    descricao: string;
  }>;
  endereco: {
    tipoLogradouro: string;
    logradouro: string;
    numero: string;
    complemento: string;
    cep: string;
    bairro: string;
    municipio: {
      codigo: string;
      descricao: string;
    };
    uf: string;
    pais: {
      codigo: string;
      descricao: string;
    };
  };
  municipioJurisdicao: {
    codigo: string;
    descricao: string;
  };
  telefone: Array<{
    ddd: string;
    numero: string;
  }>;
  correioEletronico: string;
  capitalSocial: string;
  porte: string;
  situacaoEspecial: string;
  dataSituacaoEspecial: string;
  informacoesAdicionais: {
    optanteSimples: string;
    optanteMei: string;
  };
  listaPeriodoSimples: Array<{
    dataInicio: string;
    dataFim: string;
  }>;
  socios: Array<{
    tipoSocio: string;
    cpf: string;
    nome: string;
    qualificacao: string;
    dataInclusao: string;
  }>;
}