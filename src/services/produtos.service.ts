// C:\sistemanex\src\services\produtos.service.ts

import api from './api';

export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  categoria: string;
  unidade: string;
  ncm: string;
  cest?: string;
  cfopPadrao: string;
  precoCusto: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export const produtosService = {
  async listar(page: number = 1, limit: number = 20, busca: string = '') {
    const response = await api.get('/produtos', {
      params: { page, limit, busca },
    });
    return response.data;
  },

  async buscarPorId(id: string) {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  async criar(data: any) {
    const response = await api.post('/produtos', data);
    return response.data;
  },

  async atualizar(id: string, data: any) {
    const response = await api.put(`/produtos/${id}`, data);
    return response.data;
  },

  async excluir(id: string) {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },

  // 🔥 CORRIGIDO: SEMPRE RETORNA UM ARRAY
  async buscarEstoqueCritico(): Promise<any[]> {
    try {
      const response = await api.get('/produtos/estoque-critico');
      
      // 🔥 EXTRAI OS DADOS CORRETAMENTE
      // A API retorna { sucesso: true, dados: [...] }
      const data = response.data?.dados || response.data?.data || response.data;
      
      // 🔥 GARANTE QUE É UM ARRAY
      if (Array.isArray(data)) {
        return data;
      }
      
      // Se for um objeto, tenta encontrar uma propriedade que é array
      if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar estoque crítico:', error);
      return [];
    }
  },
};