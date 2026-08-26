// C:\emissornfe\src\services\nfse.service.ts

import api from './api';
import { NFSeDocumento } from '../types/fiscal';

export interface ListaNfseResponse {
  data: NFSeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 🔥 EXPORTAÇÃO NOMEADA (correta)
export const nfseService = {
  async listar(page: number = 1, limit: number = 50): Promise<ListaNfseResponse> {
    const response = await api.get('/nfse', {
      params: { page, limit }
    });
    if (response.data && response.data.sucesso && response.data.dados) {
      return response.data.dados;
    }
    if (response.data && response.data.data) {
      return response.data;
    }
    return { data: [], total: 0, page, limit, totalPages: 0 };
  },

  async buscarPorId(id: string): Promise<NFSeDocumento> {
    const response = await api.get(`/nfse/${id}`);
    return response.data.dados || response.data;
  },

  async buscarPorChave(chave: string): Promise<NFSeDocumento> {
    const response = await api.get(`/nfse/chave/${chave}`);
    return response.data.dados || response.data;
  },

  async emitir(nfse: Partial<NFSeDocumento>): Promise<NFSeDocumento> {
    const response = await api.post('/nfse/emitir', nfse);
    return response.data.dados || response.data;
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    await api.post(`/nfse/cancelar/${id}`, { justificativa });
  },

  async gerarDanfse(id: string): Promise<Blob> {
    const response = await api.get(`/nfse/danfse/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async baixarXml(id: string): Promise<Blob> {
    const response = await api.get(`/nfse/xml/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};