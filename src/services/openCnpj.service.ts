// src/services/openCnpj.service.ts

import { formatarCpfCnpj, limparDocumento } from '../utils/cpfCnpjValidator';

const API_BASE = 'https://api.opencnpj.org';

export interface OpenCnpjResponse {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_principal?: string;
  cnae_secundario?: string;
  uf?: string;
  municipio?: string;
  porte_empresa?: string;
  natureza_juridica?: string;
  capital_social?: number;
  // Campos adicionais por dataset
  rntrc?: {
    numero: string;
    situacao: string;
    data_validade: string;
  };
  cno?: {
    numero: string;
    situacao: string;
  };
  ceis?: Array<{
    orgao: string;
    data_inicio: string;
    data_fim: string;
    tipo: string;
  }>;
  cnep?: Array<{
    orgao: string;
    data_inicio: string;
    data_fim: string;
    tipo: string;
  }>;
}

export interface OpenCnpjConsultaResultado {
  sucesso: boolean;
  dados?: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    situacaoCadastral: string;
    dataSituacaoCadastral?: string;
    dataAbertura: string;
    cnaePrincipal: string;
    cnaePrincipalDescricao?: string;
    cnaeSecundarios: string[];
    naturezaJuridica: string;
    naturezaJuridicaCodigo?: string;
    endereco: {
      tipoLogradouro?: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
      municipio: string;
      codigoMunicipio?: string;
      uf: string;
      pais: string;
      codigoPais?: string;
    };
    telefone?: string;
    email?: string;
    capitalSocial: number;
    porte: string;
    optanteSimples?: boolean;
    optanteMEI?: boolean;
    qsa: Array<{
      nome: string;
      cpf?: string;
      qualificacao: string;
      dataInclusao?: string;
    }>;
    // Campos específicos
    rntrc?: {
      numero: string;
      situacao: string;
      dataValidade: string;
    };
    cno?: {
      numero: string;
      situacao: string;
    };
    ceis?: Array<{
      orgao: string;
      dataInicio: string;
      dataFim: string;
      tipo: string;
    }>;
    cnep?: Array<{
      orgao: string;
      dataInicio: string;
      dataFim: string;
      tipo: string;
    }>;
  };
  erro?: string;
  datasets?: string[];
}

/**
 * 🔥 CONSULTA CNPJ VIA OPENCNPJ (API PÚBLICA SEM AUTENTICAÇÃO)
 */
export async function consultarCnpjOpen(cnpj: string, datasets: string[] = ['receita']): Promise<OpenCnpjConsultaResultado> {
  const cnpjLimpo = limparDocumento(cnpj);
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ inválido. Digite 14 dígitos.'
    };
  }

  try {
    // Construir URL com datasets
    const datasetsParam = datasets.length > 0 ? `?datasets=${datasets.join(',')}` : '';
    const url = `${API_BASE}/${cnpjLimpo}${datasetsParam}`;
    
    console.log(`🔍 Consultando OpenCNPJ: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 404) {
      return {
        sucesso: false,
        erro: 'CNPJ não encontrado na base da Receita Federal'
      };
    }

    if (response.status === 400) {
      return {
        sucesso: false,
        erro: 'CNPJ ou filtro de dataset inválido'
      };
    }

    if (response.status === 502) {
      return {
        sucesso: false,
        erro: 'Falha temporária no servidor. Tente novamente mais tarde.'
      };
    }

    if (!response.ok) {
      return {
        sucesso: false,
        erro: `Erro ${response.status} na consulta`
      };
    }

    const data: OpenCnpjResponse = await response.json();
    
    if (!data || !data.cnpj) {
      return {
        sucesso: false,
        erro: 'Dados não encontrados'
      };
    }

    // Mapear dados para o formato do sistema
    const resultado = mapearDadosOpenCnpj(data);

    return {
      sucesso: true,
      dados: resultado,
      datasets: datasets
    };

  } catch (error: any) {
    console.error('Erro ao consultar OpenCNPJ:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        sucesso: false,
        erro: 'Erro de rede. Verifique sua conexão com a internet.'
      };
    }
    
    return {
      sucesso: false,
      erro: error.message || 'Erro desconhecido ao consultar CNPJ'
    };
  }
}

/**
 * Mapeia os dados da OpenCNPJ para o formato do sistema
 */
function mapearDadosOpenCnpj(data: OpenCnpjResponse) {
  // Extrair telefone do objeto ou array
  let telefone = '';
  if (data.telefone) {
    if (typeof data.telefone === 'string') {
      telefone = data.telefone;
    } else if (Array.isArray(data.telefone) && data.telefone.length > 0) {
      const tel = data.telefone[0];
      telefone = tel.ddd ? `(${tel.ddd}) ${tel.numero}` : tel.numero || '';
    } else if (typeof data.telefone === 'object') {
      telefone = data.telefone.numero || '';
    }
  }

  // Extrair CNAEs secundários
  const cnaeSecundarios: string[] = [];
  if (data.cnae_secundario) {
    if (typeof data.cnae_secundario === 'string') {
      cnaeSecundarios.push(data.cnae_secundario);
    } else if (Array.isArray(data.cnae_secundario)) {
      cnaeSecundarios.push(...data.cnae_secundario);
    }
  }

  // Mapear QSA
  const qsa = data.socios?.map((socio: any) => ({
    nome: socio.nome || socio.nome_socio || '',
    cpf: socio.cpf || socio.cpf_socio || '',
    qualificacao: socio.qualificacao || socio.qualificacao_socio || '',
    dataInclusao: socio.data_inclusao || socio.data_entrada || ''
  })) || [];

  return {
    cnpj: data.cnpj || '',
    razaoSocial: data.razao_social || '',
    nomeFantasia: data.nome_fantasia || '',
    situacaoCadastral: data.situacao_cadastral || '',
    dataSituacaoCadastral: data.data_situacao_cadastral || '',
    dataAbertura: data.data_inicio_atividade || '',
    cnaePrincipal: data.cnae_principal || '',
    cnaePrincipalDescricao: data.cnae_principal_descricao || '',
    cnaeSecundarios,
    naturezaJuridica: data.natureza_juridica || '',
    naturezaJuridicaCodigo: data.natureza_juridica_codigo || '',
    endereco: {
      tipoLogradouro: data.tipo_logradouro || '',
      logradouro: data.logradouro || '',
      numero: data.numero || 'S/N',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cep: data.cep || '',
      municipio: data.municipio || '',
      codigoMunicipio: data.codigo_municipio || '',
      uf: data.uf || '',
      pais: data.pais || 'BRASIL',
      codigoPais: data.codigo_pais || '1058',
    },
    telefone: telefone || '',
    email: data.email || '',
    capitalSocial: data.capital_social || 0,
    porte: data.porte_empresa || '',
    optanteSimples: data.opcao_pelo_simples === 'S' || data.optante_simples === true,
    optanteMEI: data.opcao_pelo_mei === 'S' || data.optante_mei === true,
    qsa,
    // Campos específicos por dataset
    rntrc: data.rntrc ? {
      numero: data.rntrc.numero || '',
      situacao: data.rntrc.situacao || '',
      dataValidade: data.rntrc.data_validade || ''
    } : undefined,
    cno: data.cno ? {
      numero: data.cno.numero || '',
      situacao: data.cno.situacao || ''
    } : undefined,
    ceis: data.ceis ? data.ceis.map((item: any) => ({
      orgao: item.orgao || '',
      dataInicio: item.data_inicio || '',
      dataFim: item.data_fim || '',
      tipo: item.tipo || ''
    })) : undefined,
    cnep: data.cnep ? data.cnep.map((item: any) => ({
      orgao: item.orgao || '',
      dataInicio: item.data_inicio || '',
      dataFim: item.data_fim || '',
      tipo: item.tipo || ''
    })) : undefined
  };
}

/**
 * Busca apenas dados da Receita Federal (mais rápido)
 */
export async function consultarCnpjReceita(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita']);
}

/**
 * Busca dados da Receita + RNTRC (para transportadoras)
 */
export async function consultarCnpjComRntrc(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita', 'rntrc']);
}

/**
 * Busca dados completos com todos os datasets disponíveis
 */
export async function consultarCnpjCompleto(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, [
    'receita', 
    'rntrc', 
    'cno', 
    'ceis', 
    'cnep'
  ]);
}