// src/services/transportadora.service.ts
// ✅ VERSÃO COMPLETA - COM LISTAR CORRETO

import api from './api';

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

export const transportadoraService = {
  /**
   * 🔥 LISTAR TRANSPORTADORAS
   */
  async listar(page: number = 1, limit: number = 50): Promise<any> {
    try {
      console.log(`📡 Buscando transportadoras: page=${page}, limit=${limit}`);
      const response = await api.get(`/transportadoras?page=${page}&limit=${limit}`);
      console.log('📦 Resposta bruta:', response.data);
      
      // 🔥 EXTRAI OS DADOS CORRETAMENTE
      // O backend retorna: { sucesso: true, dados: { data: [...], total: X, ... } }
      const dados = response.data?.dados?.data || response.data?.data || [];
      
      console.log(`✅ Transportadoras encontradas: ${dados.length}`);
      return { data: dados };
    } catch (error: any) {
      console.error('❌ Erro ao listar transportadoras:', error);
      return { data: [] };
    }
  },

  /**
   * 🔥 BUSCAR POR ID
   */
  async buscarPorId(id: string): Promise<any> {
    try {
      const response = await api.get(`/transportadoras/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar transportadora:', error);
      throw error;
    }
  },

  /**
   * 🔥 CRIAR TRANSPORTADORA
   */
  async criar(data: any): Promise<any> {
    try {
      const response = await api.post('/transportadoras', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar transportadora:', error);
      throw error;
    }
  },

  /**
   * 🔥 ATUALIZAR TRANSPORTADORA
   */
  async atualizar(id: string, data: any): Promise<any> {
    try {
      const response = await api.put(`/transportadoras/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar transportadora:', error);
      throw error;
    }
  },

  /**
   * 🔥 EXCLUIR TRANSPORTADORA
   */
  async excluir(id: string): Promise<{ sucesso: boolean; mensagem?: string; erro?: string }> {
    try {
      if (!id) {
        return { sucesso: false, erro: 'ID da transportadora não informado' };
      }

      console.log(`🗑️ Excluindo transportadora: ${id}`);

      const response = await api.delete(`/transportadoras/${id}`);
      
      console.log('📥 Resposta da exclusão:', response.data);

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

    } catch (error: any) {
      console.error('❌ Erro no serviço de exclusão:', error);

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

      return { 
        sucesso: false, 
        erro: error.message || 'Erro inesperado ao excluir transportadora' 
      };
    }
  }
};