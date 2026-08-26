// C:\emissornfe\src\utils\consultaCnpjApi.ts

import { limparDocumento } from './cpfCnpjValidator'; 
import api from '../services/api';

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
  };
  erro?: string;
}

/**
 * 🔥 CONSULTA CNPJ VIA BACKEND (QUE CHAMA CONECTAGOV)
 * O backend lida com autenticação OAuth2, token e headers necessários
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
    console.log(`🔍 Consultando backend para CNPJ: ${cnpjLimpo}`);
    
    // 🔥 CHAMA O BACKEND (QUE CHAMA CONECTAGOV COM AUTENTICAÇÃO)
    const response = await api.get(`/cnpj/consultar/${cnpjLimpo}`);
    
    if (response.data.sucesso) {
      console.log('✅ Dados obtidos via backend');
      return response.data;
    } else {
      return {
        sucesso: false,
        erro: response.data.erro || 'Erro na consulta'
      };
    }
  } catch (error: any) {
    console.error('Erro ao consultar CNPJ:', error);
    
    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.erro || error.response.data?.message || `Erro ${status}`;
      
      if (status === 401) {
        return {
          sucesso: false,
          erro: 'Credenciais do ConectaGov inválidas. Verifique as configurações no backend.'
        };
      }
      if (status === 403) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Verifique as permissões do ConectaGov.'
        };
      }
      if (status === 404) {
        return {
          sucesso: false,
          erro: 'CNPJ não encontrado na base da Receita Federal'
        };
      }
      if (status === 429) {
        return {
          sucesso: false,
          erro: 'Muitas requisições. Aguarde alguns segundos e tente novamente.'
        };
      }
      if (status === 504) {
        return {
          sucesso: false,
          erro: 'Tempo limite excedido. O serviço da Receita Federal está lento.'
        };
      }
      
      return {
        sucesso: false,
        erro: mensagem
      };
    }
    
    if (error.request) {
      return {
        sucesso: false,
        erro: 'Servidor indisponível. Verifique se o backend está rodando.'
      };
    }
    
    return {
      sucesso: false,
      erro: error.message || 'Erro desconhecido'
    };
  }
}