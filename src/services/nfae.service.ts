// src/services/nfae.service.ts

import api from './api';
import { NFAeDocumento } from '../types/fiscal';

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
  /**
   * 📋 LISTAR NFA-e COM FILTROS
   * GET /api/nfae
   */
  async listar(filtros: FiltroNFAe = {}): Promise<ListaNfaeResponse> {
    const { page = 1, limit = 50, ...outrosFiltros } = filtros;
    
    try {
      const response = await api.get('/nfae', {
        params: { page, limit, ...outrosFiltros }
      });
      
      console.log('📡 NFA-e response:', response.data);
      
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

  /**
   * 🔍 BUSCAR NFA-e POR ID
   * GET /api/nfae/:id
   */
  async buscarPorId(id: string): Promise<NFAeDocumento | null> {
    try {
      const response = await api.get(`/nfae/${id}`);
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e buscarPorId erro:', error);
      return null;
    }
  },

  /**
   * 🔍 BUSCAR NFA-e POR CHAVE DE ACESSO
   * GET /api/nfae/chave/:chave
   */
  async buscarPorChave(chave: string): Promise<NFAeDocumento | null> {
    try {
      const response = await api.get(`/nfae/chave/${chave}`);
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e buscarPorChave erro:', error);
      return null;
    }
  },

  /**
   * 📝 EMITIR NFA-e
   * POST /api/nfae/emitir
   */
  async emitir(nfae: any): Promise<NFAeDocumento | null> {
    try {
      const response = await api.post('/nfae/emitir', nfae);
      return response.data.dados || response.data || null;
    } catch (error: any) {
      console.error('❌ NFA-e emitir erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao emitir NFA-e');
    }
  },

  /**
   * ❌ CANCELAR NFA-e
   * POST /api/nfae/cancelar/:id
   */
  async cancelar(id: string, justificativa: string): Promise<void> {
    try {
      await api.post(`/nfae/cancelar/${id}`, { motivo: justificativa });
    } catch (error: any) {
      console.error('❌ NFA-e cancelar erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao cancelar NFA-e');
    }
  },

  /**
   * ❌ EXCLUIR NFA-e (RASCUNHO)
   * DELETE /api/nfae/:id
   */
  async excluir(id: string): Promise<void> {
    try {
      await api.delete(`/nfae/${id}`);
    } catch (error: any) {
      console.error('❌ NFA-e excluir erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao excluir NFA-e');
    }
  },

  /**
   * 📄 BAIXAR XML DA NFA-e
   * GET /api/nfae/xml/:id
   */
  async baixarXml(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/nfae/xml/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ NFA-e baixarXml erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao baixar XML');
    }
  },

  /**
   * 📊 ESTATÍSTICAS DE NFA-e
   * GET /api/nfae/estatisticas
   */
  async getEstatisticas(): Promise<any> {
    try {
      const response = await api.get('/nfae/estatisticas');
      return response.data.dados || response.data || null;
    } catch (error) {
      console.error('❌ NFA-e getEstatisticas erro:', error);
      return null;
    }
  },

  /**
   * 💰 TOTAL POR PERÍODO
   * GET /api/nfae/total-periodo
   */
  async getTotalPeriodo(dataInicio?: string, dataFim?: string): Promise<any> {
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

  /**
   * 📊 RESUMO MENSAL
   * GET /api/nfae/resumo-mensal
   */
  async getResumoMensal(ano: number, mes: number): Promise<any> {
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

  /**
   * 📊 NFA-e POR DESTINATÁRIO
   * GET /api/nfae/destinatario/:destinatarioId
   */
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