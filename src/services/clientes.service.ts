// src/services/clientes.service.ts
import api from './api';
import { ClienteFornecedor } from '../types/erp';

export interface ListaResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const clientesService = {
  async listar(page = 1, limit = 100, busca = ''): Promise<ListaResponse<ClienteFornecedor>> {
    try {
      const response = await api.get('/clientes', {
        params: { page, limit, busca },
      });
      const body = response.data;
      const dados = body?.dados ?? body;

      return {
        data: dados?.data ?? dados ?? [],
        total: dados?.total ?? 0,
        page: dados?.page ?? page,
        limit: dados?.limit ?? limit,
        totalPages: dados?.totalPages ?? 0,
      };
    } catch (error) {
      console.error('❌ clientes.listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // ✅ ADICIONE ESTES MÉTODOS QUE ESTÃO FALTANDO
  async buscarPorId(id: string): Promise<ClienteFornecedor> {
    const response = await api.get(`/clientes/${id}`);
    return response.data.dados || response.data;
  },

  async buscarPorDocumento(documento: string): Promise<ClienteFornecedor> {
    const response = await api.get(`/clientes/documento/${documento}`);
    return response.data.dados || response.data;
  },

  async criar(cliente: Omit<ClienteFornecedor, 'id' | 'dataCadastro'>): Promise<ClienteFornecedor> {
    const response = await api.post('/clientes', cliente);
    return response.data.dados || response.data;
  },

  async atualizar(id: string, cliente: Partial<ClienteFornecedor>): Promise<ClienteFornecedor> {
    const response = await api.put(`/clientes/${id}`, cliente);
    return response.data.dados || response.data;
  },

  // 🔥 MÉTODO QUE ESTÁ FALTANDO!
  async excluir(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  async buscarPorTipo(tipo: string): Promise<ClienteFornecedor[]> {
    const response = await api.get(`/clientes/tipo/${tipo}`);
    return response.data.dados || response.data || [];
  }
};