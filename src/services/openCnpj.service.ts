// src/services/openCnpj.service.ts

import { limparDocumento } from '../utils/cpfCnpjValidator';

const API_BASE = 'https://api.opencnpj.org';

export interface OpenCnpjResponse {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  data_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_principal?: string;
  cnae_principal_descricao?: string;
  cnae_secundario?: string | string[];
  natureza_juridica?: string;
  natureza_juridica_codigo?: string;
  logradouro?: string;
  tipo_logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  municipio?: string;
  codigo_municipio?: string;
  uf?: string;
  pais?: string;
  codigo_pais?: string;
  telefone?: string | Array<{ ddd: string; numero: string }> | { numero: string };
  email?: string;
  capital_social?: number;
  porte_empresa?: string;
  opcao_pelo_simples?: string;
  optante_simples?: boolean;
  opcao_pelo_mei?: string;
  optante_mei?: boolean;
  socios?: Array<{
    nome: string;
    nome_socio?: string;
    cpf: string;
    cpf_socio?: string;
    qualificacao: string;
    qualificacao_socio?: string;
    data_inclusao?: string;
    data_entrada?: string;
  }>;
  rntrc?: {
    numero: string;
    situacao: string;
    data_validade: string;
    descricao?: string;
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
    rntrc?: {
      numero: string;
      situacao: string;
      dataValidade: string;
      descricao?: string;
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
export async function consultarCnpjOpen(
  cnpj: string, 
  datasets: string[] = ['receita']
): Promise<OpenCnpjConsultaResultado> {
  const cnpjLimpo = limparDocumento(cnpj);
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ inválido. Digite 14 dígitos.'
    };
  }

  try {
    const datasetsParam = datasets.length > 0 ? `?datasets=${datasets.join(',')}` : '';
    const url = `${API_BASE}/${cnpjLimpo}${datasetsParam}`;
    
    console.log(`🔍 Consultando OpenCNPJ: ${url}`);
    console.log(`📊 Datasets solicitados: ${datasets.join(', ')}`);
    
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

    if (data.rntrc) {
      console.log('✅ RNTRC encontrado:', data.rntrc);
    } else {
      console.log('ℹ️ RNTRC não encontrado para este CNPJ');
    }

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

  const cnaeSecundarios: string[] = [];
  if (data.cnae_secundario) {
    if (typeof data.cnae_secundario === 'string') {
      cnaeSecundarios.push(data.cnae_secundario);
    } else if (Array.isArray(data.cnae_secundario)) {
      cnaeSecundarios.push(...data.cnae_secundario);
    }
  }

  const qsa = (data.socios || []).map((socio: any) => ({
    nome: socio.nome || socio.nome_socio || '',
    cpf: socio.cpf || socio.cpf_socio || '',
    qualificacao: socio.qualificacao || socio.qualificacao_socio || '',
    dataInclusao: socio.data_inclusao || socio.data_entrada || ''
  }));

  const resultado = {
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
    rntrc: data.rntrc ? {
      numero: data.rntrc.numero || '',
      situacao: data.rntrc.situacao || '',
      dataValidade: data.rntrc.data_validade || '',
      descricao: data.rntrc.descricao || ''
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

  if (resultado.rntrc) {
    console.log('✅ RNTRC mapeado com sucesso:', resultado.rntrc);
  }

  return resultado;
}

/**
 * 🔥 BUSCA DADOS DA RECEITA + RNTRC (PARA TRANSPORTADORAS)
 */
export async function consultarCnpjComRntrc(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  console.log('🚚 Consultando CNPJ com RNTRC...');
  const resultado = await consultarCnpjOpen(cnpj, ['receita', 'rntrc']);
  
  if (resultado.sucesso && resultado.dados) {
    if (resultado.dados.rntrc) {
      console.log('✅ RNTRC encontrado:', resultado.dados.rntrc);
    } else {
      console.log('ℹ️ Nenhum RNTRC encontrado para este CNPJ');
    }
  }
  
  return resultado;
}

/**
 * Busca apenas dados da Receita Federal (mais rápido)
 */
export async function consultarCnpjReceita(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita']);
}

/**
 * Busca dados completos com todos os datasets disponíveis
 */
export async function consultarCnpjCompleto(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita', 'rntrc', 'cno', 'ceis', 'cnep']);
}