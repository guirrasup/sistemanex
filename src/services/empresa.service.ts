// src/services/empresa.service.ts
import api from './api';
import { ConfiguracaoEmpresa } from '../types/erp';

export const empresaService = {
  /** Lê os dados cadastrais reais da empresa (banco de dados do backend). */
  async obterMinhaEmpresa(): Promise<ConfiguracaoEmpresa | null> {
    try {
      const response = await api.get('/empresa/me');
      return response.data?.dados ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Persiste os dados cadastrais da empresa no backend (somente ADMIN).
   * Aceita atualizações parciais — envie apenas os campos alterados.
   */
  async atualizarMinhaEmpresa(dados: Partial<ConfiguracaoEmpresa>): Promise<ConfiguracaoEmpresa> {
    const response = await api.put('/empresa/me', dados);
    return response.data.dados;
  },
};
