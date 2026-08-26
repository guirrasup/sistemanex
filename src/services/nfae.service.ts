// C:\emissornfe\src\services\nfae.service.ts

import api from './api';
import { NFAeDocumento } from '../types/fiscal';

export interface ListaNfaeResponse {
  data: NFAeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const nfaeService = {
  async listar(page: number = 1, limit: number = 50): Promise<ListaNfaeResponse> {
    try {
      const response = await api.get('/nfae', {
        params: { page, limit }
      });
      
      if (response.data && response.data.sucesso && response.data.dados) {
        return response.data.dados;
      }
      if (response.data && response.data.data) {
        return response.data;
      }
      return { data: [], total: 0, page, limit, totalPages: 0 };
    } catch (error) {
      console.error('❌ NFA-e listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async buscarPorId(id: string): Promise<NFAeDocumento | null> {
    try {
      const response = await api.get(`/nfae/${id}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  async buscarPorChave(chave: string): Promise<NFAeDocumento | null> {
    try {
      const response = await api.get(`/nfae/chave/${chave}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  async emitir(nfae: Partial<NFAeDocumento>): Promise<NFAeDocumento | null> {
    try {
      const response = await api.post('/nfae/emitir', nfae);
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e emitir erro:', error);
      return null;
    }
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    await api.post(`/nfae/cancelar/${id}`, { justificativa });
  },

  async gerarDanfae(id: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/nfae/danfae/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async baixarXml(id: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/nfae/xml/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async gerarGuiaDae(id: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/nfae/guia-dae/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch {
      return null;
    }
  }
};