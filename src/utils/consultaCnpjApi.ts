// C:\emissornfe\src\utils\consultaCnpjApi.ts

import { limparDocumento } from './cpfCnpjValidator';

export interface ConsultaCnpjResponse {
  sucesso: boolean;
  dados?: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    situacaoCadastral: string;
    situacaoCadastralDescricao?: string;
    dataSituacaoCadastral: string;
    naturezaJuridica: string;
    naturezaJuridicaCodigo?: string;
    dataAbertura: string;
    cnaePrincipal: string;
    cnaePrincipalDescricao?: string;
    cnaeSecundarios: Array<{
      codigo: string;
      descricao: string;
    }>;
    endereco: {
      tipoLogradouro: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
      municipio: string;
      codigoMunicipio: string;
      uf: string;
      pais: string;
      codigoPais: string;
    };
    telefone: Array<{
      ddd: string;
      numero: string;
    }>;
    email: string;
    capitalSocial: number;
    porte: string;
    situacaoEspecial: string;
    dataSituacaoEspecial: string;
    optanteSimples: boolean;
    optanteMEI: boolean;
    socios: Array<{
      tipo: string;
      cpf: string;
      nome: string;
      qualificacao: string;
      dataInclusao: string;
    }>;
    // 🔥 NOVO: RNTRC
    rntrc?: {
      numero: string;
      situacao: string;
      dataValidade: string;
    };
  };
  erro?: string;
}

/**
 * 🔥 CONSULTA CNPJ VIA OPENCNPJ (API PÚBLICA)
 */
export async function consultarCnpjConectaGov(cnpj: string): Promise<ConsultaCnpjResponse> {
  const cnpjLimpo = limparDocumento(cnpj);
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ inválido. Digite 14 dígitos.'
    };
  }

  try {
    // 🔥 CHAMA OPENCNPJ COM RNTRC
    const url = `https://api.opencnpj.org/${cnpjLimpo}?datasets=receita,rntrc`;
    
    console.log(`🔍 Consultando OpenCNPJ: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 404) {
      return {
        sucesso: false,
        erro: 'CNPJ não encontrado'
      };
    }

    if (!response.ok) {
      return {
        sucesso: false,
        erro: `Erro ${response.status} na consulta`
      };
    }

    const data = await response.json();
    
    // 🔥 MAPEIA OS DADOS
    const resultado = {
      cnpj: data.cnpj || '',
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      situacaoCadastral: data.situacao_cadastral || '',
      situacaoCadastralDescricao: '',
      dataSituacaoCadastral: data.data_situacao_cadastral || '',
      naturezaJuridica: data.natureza_juridica || '',
      naturezaJuridicaCodigo: data.natureza_juridica_codigo || '',
      dataAbertura: data.data_inicio_atividade || '',
      cnaePrincipal: data.cnae_principal || '',
      cnaePrincipalDescricao: data.cnae_principal_descricao || '',
      cnaeSecundarios: [],
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
      telefone: [],
      email: data.email || '',
      capitalSocial: data.capital_social || 0,
      porte: data.porte_empresa || '',
      situacaoEspecial: '',
      dataSituacaoEspecial: '',
      optanteSimples: data.opcao_pelo_simples === 'S' || data.optante_simples === true,
      optanteMEI: data.opcao_pelo_mei === 'S' || data.optante_mei === true,
      socios: (data.socios || []).map((s: any) => ({
        tipo: '',
        cpf: s.cpf || '',
        nome: s.nome || '',
        qualificacao: s.qualificacao || '',
        dataInclusao: s.data_inclusao || '',
      })),
      // 🔥 RNTRC
      rntrc: data.rntrc ? {
        numero: data.rntrc.numero || '',
        situacao: data.rntrc.situacao || '',
        dataValidade: data.rntrc.data_validade || '',
      } : undefined
    };

    return {
      sucesso: true,
      dados: resultado
    };

  } catch (error: any) {
    console.error('❌ Erro na consulta:', error);
    return {
      sucesso: false,
      erro: error.message || 'Erro ao consultar CNPJ'
    };
  }
}