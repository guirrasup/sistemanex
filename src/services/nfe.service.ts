// C:\emissornfe\src\services\nfe.service.ts

import api from './api';
import { NFeDocumento } from '../types/fiscal';

export interface ListaNfeResponse {
  data: NFeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 🔥 EXPORTAÇÃO NOMEADA (correta)
export const nfeService = {
  async listar(page: number = 1, limit: number = 50): Promise<ListaNfeResponse> {
    const response = await api.get('/nfe', {
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

  async buscarPorId(id: string): Promise<NFeDocumento> {
    const response = await api.get(`/nfe/${id}`);
    return response.data.dados || response.data;
  },

  async buscarPorChave(chave: string): Promise<NFeDocumento> {
    const response = await api.get(`/nfe/chave/${chave}`);
    return response.data.dados || response.data;
  },

  async emitir(nfe: Partial<NFeDocumento>): Promise<NFeDocumento> {
    const response = await api.post('/nfe/emitir', nfe);
    return response.data.dados || response.data;
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    await api.post(`/nfe/cancelar/${id}`, { justificativa });
  },

  async inutilizar(params: {
    cnpj: string;
    serie: number;
    numeroInicial: number;
    numeroFinal: number;
    justificativa: string;
  }): Promise<void> {
    await api.post('/nfe/inutilizar', params);
  },

  async gerarDanfe(id: string): Promise<Blob> {
    const response = await api.get(`/nfe/danfe/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async baixarXml(id: string): Promise<Blob> {
    const response = await api.get(`/nfe/xml/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async enviarCartaCorrecao(params: {
    chaveAcesso: string;
    cnpjAutor: string;
    textoCorrecao: string;
  }): Promise<void> {
    await api.post('/nfe/carta-correcao', params);
  }
};