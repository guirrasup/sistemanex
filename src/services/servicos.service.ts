// C:\emissornfe\src\services\servicos.service.ts

import api from './api';
import { ServicoCatalogo } from '../types/erp';

export interface ListaServicosResponse {
  data: ServicoCatalogo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 🔥 EXPORTAÇÃO NOMEADA (correta)
export const servicosService = {
  async listar(page: number = 1, limit: number = 50, busca: string = ''): Promise<ListaServicosResponse> {
    const response = await api.get('/servicos', {
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

  async buscarPorId(id: string): Promise<ServicoCatalogo> {
    const response = await api.get(`/servicos/${id}`);
    return response.data.dados || response.data;
  },

  async criar(servico: Omit<ServicoCatalogo, 'id'>): Promise<ServicoCatalogo> {
    const response = await api.post('/servicos', servico);
    return response.data.dados || response.data;
  },

  async atualizar(id: string, servico: Partial<ServicoCatalogo>): Promise<ServicoCatalogo> {
    const response = await api.put(`/servicos/${id}`, servico);
    return response.data.dados || response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/servicos/${id}`);
  },

  async buscarPorCodigoTributacao(codigo: string): Promise<ServicoCatalogo[]> {
    const response = await api.get(`/servicos/tributacao/${codigo}`);
    return response.data.dados || response.data || [];
  }
};