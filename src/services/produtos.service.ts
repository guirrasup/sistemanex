// C:\emissornfe\src\services\produtos.service.ts

import api from './api';
import { Produto } from '../types/erp';

export interface ListaProdutosResponse {
  data: Produto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const produtosService = {
  async listar(page: number = 1, limit: number = 50, busca: string = ''): Promise<ListaProdutosResponse> {
    const response = await api.get('/produtos', {
      params: { page, limit, busca }
    });
    if (response.data && response.data.sucesso && response.data.dados) {
      return response.data.dados;
    }
    if (response.data && response.data.data) {
      return response.data;
    }
    return { data: [], total: 0, page, limit, totalPages: 0 };
  },

  async buscarPorId(id: string): Promise<Produto> {
    const response = await api.get(`/produtos/${id}`);
    return response.data.dados || response.data;
  },

  async criar(produto: Omit<Produto, 'id' | 'dataCriacao' | 'createdAt' | 'updatedAt'>): Promise<Produto> {
    const response = await api.post('/produtos', produto);
    return response.data.dados || response.data;
  },

  async atualizar(id: string, produto: Partial<Produto>): Promise<Produto> {
    const response = await api.put(`/produtos/${id}`, produto);
    return response.data.dados || response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/produtos/${id}`);
  },

  // 🔥 ADICIONE ESTE MÉTODO - SÓ ISSO!
  async buscarEstoqueCritico(): Promise<Produto[]> {
    const response = await api.get('/produtos/estoque-critico');
    return response.data.dados || response.data || [];
  },

  async atualizarEstoque(id: string, quantidade: number, tipo: 'ENTRADA' | 'SAIDA'): Promise<Produto> {
    const response = await api.patch(`/produtos/${id}/estoque`, {
      quantidade,
      tipo
    });
    return response.data.dados || response.data;
  }
};