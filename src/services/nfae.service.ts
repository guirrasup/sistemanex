// src/services/nfae.service.ts
import api from './api';
import { NFAeDocumento } from '../types/fiscal';
import { getApiErrorMessage } from '../utils/apiError';

export interface EstatisticasNFAe {
  total: number;
  porStatus: Record<string, number>;
}

export interface ResumoMensalNFAe {
  ano: number;
  mes: number;
  quantidade: number;
  valorTotal: number;
}

export interface ListaNfaeResponse {
  data: NFAeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroNFAe {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  numero?: number;
  serie?: number;
  chave?: string;
  destinatarioId?: string;
}

export const nfaeService = {
  async listar(filtros: FiltroNFAe = {}): Promise<ListaNfaeResponse> {
    const { page = 1, limit = 50, ...outrosFiltros } = filtros;
    
    try {
      const response = await api.get('/nfae', {
        params: { page, limit, ...outrosFiltros }
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
    } catch (error) {
      console.error('❌ NFA-e buscarPorId erro:', error);
      return null;
    }
  },

  async buscarPorChave(chave: string): Promise<NFAeDocumento | null> {
    try {
      const response = await api.get(`/nfae/chave/${chave}`);
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e buscarPorChave erro:', error);
      return null;
    }
  },

  async emitir(nfae: NFAeDocumento): Promise<NFAeDocumento | null> {
    try {
      const response = await api.post('/nfae/emitir', nfae);
      return response.data.dados || response.data || null;
    } catch (error: unknown) {
      console.error('❌ NFA-e emitir erro:', error);
      throw new Error(getApiErrorMessage(error, 'Erro ao emitir NFA-e'));
    }
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    try {
      await api.post(`/nfae/cancelar/${id}`, { motivo: justificativa });
    } catch (error: unknown) {
      console.error('❌ NFA-e cancelar erro:', error);
      throw new Error(getApiErrorMessage(error, 'Erro ao cancelar NFA-e'));
    }
  },

  async excluir(id: string): Promise<void> {
    try {
      await api.delete(`/nfae/${id}`);
    } catch (error: unknown) {
      console.error('❌ NFA-e excluir erro:', error);
      throw new Error(getApiErrorMessage(error, 'Erro ao excluir NFA-e'));
    }
  },

  async baixarXml(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/nfae/xml/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: unknown) {
      console.error('❌ NFA-e baixarXml erro:', error);
      throw new Error(getApiErrorMessage(error, 'Erro ao baixar XML'));
    }
  },

  async getEstatisticas(): Promise<EstatisticasNFAe | null> {
    try {
      const response = await api.get('/nfae/estatisticas');
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e getEstatisticas erro:', error);
      return null;
    }
  },

  async getTotalPeriodo(dataInicio?: string, dataFim?: string): Promise<{ total: number } | null> {
    try {
      const response = await api.get('/nfae/total-periodo', {
        params: { dataInicio, dataFim }
      });
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e getTotalPeriodo erro:', error);
      return null;
    }
  },

  async getResumoMensal(ano: number, mes: number): Promise<ResumoMensalNFAe | null> {
    try {
      const response = await api.get('/nfae/resumo-mensal', {
        params: { ano, mes }
      });
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e getResumoMensal erro:', error);
      return null;
    }
  },

  async findByDestinatario(destinatarioId: string): Promise<NFAeDocumento[]> {
    try {
      const response = await api.get(`/nfae/destinatario/${destinatarioId}`);
      return response.data.dados || response.data || [];
    } catch (error) {
      console.error('❌ NFA-e findByDestinatario erro:', error);
      return [];
    }
  }
};