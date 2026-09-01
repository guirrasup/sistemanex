// src/services/mdfe.service.ts

import api from './api';
import { MDFeDocumento } from '../types/mdfe';

export interface ListaMdfeResponse {
  data: MDFeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroMDFe {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  modal?: string;
  numero?: number;
  serie?: number;
  chave?: string;
}

export const mdfeService = {
  /**
   * 📋 LISTAR MDF-e COM FILTROS
   */
  async listar(filtros: FiltroMDFe = {}): Promise<ListaMdfeResponse> {
    try {
      const { page = 1, limit = 50, ...outrosFiltros } = filtros;
      
      const response = await api.get('/mdfe', {
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
      console.error('❌ MDF-e listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  /**
   * 🔍 BUSCAR MDF-e POR ID
   */
  async buscarPorId(id: string): Promise<MDFeDocumento | null> {
    try {
      const response = await api.get(`/mdfe/${id}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * 🔍 BUSCAR MDF-e POR CHAVE DE ACESSO
   */
  async buscarPorChave(chave: string): Promise<MDFeDocumento | null> {
    try {
      const response = await api.get(`/mdfe/chave/${chave}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * 📝 EMITIR MDF-e
   */
  async emitir(data: Partial<MDFeDocumento>): Promise<MDFeDocumento | null> {
    try {
      const response = await api.post('/mdfe/emitir', data);
      return response.data.dados || response.data || null;
    } catch (error: any) {
      console.error('❌ MDF-e emitir erro:', error);
      throw error;
    }
  },

  /**
   * ❌ CANCELAR MDF-e
   */
  async cancelar(id: string, justificativa: string): Promise<void> {
    await api.post(`/mdfe/cancelar/${id}`, { motivo: justificativa });
  },

  /**
   * 🚩 ENCERRAR MDF-e
   */
  async encerrar(id: string, protocolo: string, municipioEncerramento: string): Promise<void> {
    await api.post(`/mdfe/encerrar/${id}`, { 
      protocolo, 
      municipioEncerramento 
    });
  },

  /**
   * 📊 ESTATÍSTICAS DE MDF-e
   */
  async getEstatisticas(): Promise<{ total: number; porStatus: Record<string, number> }> {
    try {
      const response = await api.get('/mdfe/estatisticas');
      return response.data.dados || response.data || { total: 0, porStatus: {} };
    } catch {
      return { total: 0, porStatus: {} };
    }
  },

  /**
   * 💰 TOTAL DE CARGA TRANSPORTADA
   */
  async getTotalCarga(dataInicio?: string, dataFim?: string): Promise<{
    valorTotal: number;
    pesoTotal: number;
    quantidade: number;
    qCTe: number;
    qNFe: number;
    qMDFe: number;
  }> {
    try {
      const response = await api.get('/mdfe/total-carga', {
        params: { dataInicio, dataFim }
      });
      return response.data.dados || response.data || {
        valorTotal: 0,
        pesoTotal: 0,
        quantidade: 0,
        qCTe: 0,
        qNFe: 0,
        qMDFe: 0
      };
    } catch {
      return {
        valorTotal: 0,
        pesoTotal: 0,
        quantidade: 0,
        qCTe: 0,
        qNFe: 0,
        qMDFe: 0
      };
    }
  },

  /**
   * 📄 BAIXAR XML DO MDF-e
   */
  async baixarXml(id: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/mdfe/xml/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch {
      return null;
    }
  }
};