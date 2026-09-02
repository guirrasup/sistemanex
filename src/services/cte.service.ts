// C:\emissornfe\src\services\cte.service.ts

import api from './api';
import { CTeDocumento } from '../types/fiscal';

export interface ListaCteResponse {
  data: CTeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroCTe {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  remetenteId?: string;
  destinatarioId?: string;
  numero?: number;
  serie?: number;
  chave?: string;
  modal?: string;
  tpCTe?: string;
}

export const cteService = {
  async listar(filtros: FiltroCTe = {}): Promise<ListaCteResponse> {
    const { page = 1, limit = 50, ...outrosFiltros } = filtros;
    try {
      const response = await api.get('/cte', {
        params: { page, limit, ...outrosFiltros }
      });
      if (response.data?.sucesso && response.data.dados) {
        return response.data.dados;
      }
      if (response.data?.data) {
        return response.data;
      }
      return { data: [], total: 0, page, limit, totalPages: 0 };
    } catch (error) {
      console.error('❌ CT-e listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async buscarPorId(id: string): Promise<CTeDocumento | null> {
    try {
      const response = await api.get(`/cte/${id}`);
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e buscarPorId erro:', error);
      return null;
    }
  },

  async buscarPorChave(chave: string): Promise<CTeDocumento | null> {
    try {
      const response = await api.get(`/cte/chave/${chave}`);
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e buscarPorChave erro:', error);
      return null;
    }
  },

  async buscarPorProtocolo(protocolo: string): Promise<CTeDocumento | null> {
    try {
      const response = await api.get(`/cte/protocolo/${protocolo}`);
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e buscarPorProtocolo erro:', error);
      return null;
    }
  },

  async emitir(cteData: any): Promise<CTeDocumento | null> {
    try {
      const response = await api.post('/cte/emitir', cteData);
      return response.data?.dados || response.data || null;
    } catch (error: any) {
      console.error('❌ CT-e emitir erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao emitir CT-e');
    }
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    try {
      await api.post(`/cte/cancelar/${id}`, { motivo: justificativa });
    } catch (error: any) {
      console.error('❌ CT-e cancelar erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao cancelar CT-e');
    }
  },

  async baixarXml(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/cte/xml/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ CT-e baixarXml erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao baixar XML');
    }
  },

  async gerarDacte(id: string): Promise<any> {
    try {
      const response = await api.get(`/cte/dacte/${id}`);
      return response.data?.dados || response.data || null;
    } catch (error: any) {
      console.error('❌ CT-e gerarDacte erro:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao gerar DACTE');
    }
  },

  async getEstatisticas(): Promise<any> {
    try {
      const response = await api.get('/cte/estatisticas');
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e getEstatisticas erro:', error);
      return null;
    }
  },

  async getTotalFrete(dataInicio?: string, dataFim?: string): Promise<any> {
    try {
      const response = await api.get('/cte/total-frete', {
        params: { dataInicio, dataFim }
      });
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e getTotalFrete erro:', error);
      return null;
    }
  },

  async getResumoMensal(ano: number, mes: number): Promise<any> {
    try {
      const response = await api.get('/cte/resumo-mensal', {
        params: { ano, mes }
      });
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e getResumoMensal erro:', error);
      return null;
    }
  },

  async findByCliente(clienteId: string, tipo?: string, dataInicio?: string, dataFim?: string): Promise<CTeDocumento[]> {
    try {
      const response = await api.get(`/cte/cliente/${clienteId}`, {
        params: { tipo, dataInicio, dataFim }
      });
      return response.data?.dados || response.data || [];
    } catch (error) {
      console.error('❌ CT-e findByCliente erro:', error);
      return [];
    }
  },

  async findByTransportadora(transportadoraId: string, dataInicio?: string, dataFim?: string): Promise<CTeDocumento[]> {
    try {
      const response = await api.get(`/cte/transportadora/${transportadoraId}`, {
        params: { dataInicio, dataFim }
      });
      return response.data?.dados || response.data || [];
    } catch (error) {
      console.error('❌ CT-e findByTransportadora erro:', error);
      return [];
    }
  },

  async findByModal(modal: string, dataInicio?: string, dataFim?: string): Promise<CTeDocumento[]> {
    try {
      const response = await api.get(`/cte/modal/${modal}`, {
        params: { dataInicio, dataFim }
      });
      return response.data?.dados || response.data || [];
    } catch (error) {
      console.error('❌ CT-e findByModal erro:', error);
      return [];
    }
  },

  async findByStatus(status: string, dataInicio?: string, dataFim?: string): Promise<CTeDocumento[]> {
    try {
      const response = await api.get(`/cte/status/${status}`, {
        params: { dataInicio, dataFim }
      });
      return response.data?.dados || response.data || [];
    } catch (error) {
      console.error('❌ CT-e findByStatus erro:', error);
      return [];
    }
  },

  async buscarCteSubstituido(chave: string): Promise<CTeDocumento | null> {
    try {
      const response = await api.get(`/cte/substituicao/${chave}`);
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e buscarCteSubstituido erro:', error);
      return null;
    }
  },

  async buscarCteComplementado(chave: string): Promise<CTeDocumento | null> {
    try {
      const response = await api.get(`/cte/complemento/${chave}`);
      return response.data?.dados || response.data || null;
    } catch (error) {
      console.error('❌ CT-e buscarCteComplementado erro:', error);
      return null;
    }
  }
};