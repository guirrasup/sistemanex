// src/services/transportadora.service.ts
import axios from 'axios';
import api from './api';
import { getApiErrorMessage } from '../utils/apiError';

// 🔥 TIPO Transportadora
export interface Transportadora {
  id: string;
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnae?: string;
  email?: string;
  telefone?: string;
  celularWhatsApp?: string;
  contato?: string;
  site?: string;
  rntrc?: string;
  antt?: string;
  inscricaoSuframa?: string;
  regimeTributario: 'SIMPLES_NACIONAL' | 'SIMPLES_EXCESSO' | 'NORMAL';
  tipoTransportador?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  chavePix?: string;
  ativo: boolean;
  observacoes?: string;
  empresaId: string;
  enderecoId: string;
  endereco: {
    id: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type TransportadoraInput = Omit<Transportadora, 'id' | 'empresaId' | 'enderecoId' | 'createdAt' | 'updatedAt' | 'endereco'> & {
  endereco: Omit<Transportadora['endereco'], 'id'>;
};

export const transportadoraService = {
  async listar(page: number = 1, limit: number = 50): Promise<{ data: Transportadora[] }> {
    try {
            const response = await api.get(`/transportadoras?page=${page}&limit=${limit}`);

      // 🔥 EXTRAI OS DADOS CORRETAMENTE
      // O backend retorna: { sucesso: true, dados: { data: [...], total: X, ... } }
      const dados = response.data?.dados?.data || response.data?.data || [];

            return { data: dados };
    } catch (error: unknown) {
      console.error('❌ Erro ao listar transportadoras:', getApiErrorMessage(error));
      return { data: [] };
    }
  },

  async buscarPorId(id: string): Promise<Transportadora> {
    try {
      const response = await api.get(`/transportadoras/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar transportadora:', getApiErrorMessage(error));
      throw error;
    }
  },

  async criar(data: TransportadoraInput): Promise<Transportadora> {
    try {
      const response = await api.post('/transportadoras', data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Erro ao criar transportadora:', getApiErrorMessage(error));
      throw error;
    }
  },

  async atualizar(id: string, data: Partial<TransportadoraInput>): Promise<Transportadora> {
    try {
      const response = await api.put(`/transportadoras/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Erro ao atualizar transportadora:', getApiErrorMessage(error));
      throw error;
    }
  },

  async excluir(id: string): Promise<{ sucesso: boolean; mensagem?: string; erro?: string }> {
    try {
      if (!id) {
        return { sucesso: false, erro: 'ID da transportadora não informado' };
      }

      
      const response = await api.delete(`/transportadoras/${id}`);
      
      
      if (response.data && response.data.sucesso === true) {
        return { 
          sucesso: true, 
          mensagem: response.data.mensagem || 'Transportadora excluída com sucesso' 
        };
      }

      if (response.status === 200 || response.status === 204) {
        return { 
          sucesso: true, 
          mensagem: 'Transportadora excluída com sucesso' 
        };
      }

      if (response.data && response.data.erro) {
        return { 
          sucesso: false, 
          erro: response.data.erro 
        };
      }

      return { 
        sucesso: false, 
        erro: 'Erro desconhecido ao excluir transportadora' 
      };

    } catch (error: unknown) {
      console.error('❌ Erro no serviço de exclusão:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          if (status === 404) {
            return { sucesso: false, erro: 'Transportadora não encontrada' };
          }

          if (status === 409) {
            return {
              sucesso: false,
              erro: data?.erro || 'Não é possível excluir: transportadora possui vínculos com CT-e ou NFS-e'
            };
          }

          if (status === 403) {
            return { sucesso: false, erro: 'Você não tem permissão para excluir esta transportadora' };
          }

          return {
            sucesso: false,
            erro: data?.erro || data?.message || `Erro ${status} ao excluir transportadora`
          };
        }

        if (error.request) {
          return { sucesso: false, erro: 'Servidor não respondeu. Verifique sua conexão.' };
        }
      }

      return {
        sucesso: false,
        erro: getApiErrorMessage(error, 'Erro inesperado ao excluir transportadora')
      };
    }
  }
};