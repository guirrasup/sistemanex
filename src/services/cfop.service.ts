// src/services/cfop.service.ts
import api from './api';
import { getApiErrorMessage } from '../utils/apiError';

export interface Cfop {
  id: string;
  codigo: string;
  descricao: string;
  tipo: '0' | '1';
  ambito: 'INTERNA' | 'INTERESTADUAL' | 'EXTERIOR';
}

export const cfopService = {
  async listar(busca?: string): Promise<Cfop[]> {
    try {
      const response = await api.get('/cfop', { params: busca ? { busca } : undefined });
      return response.data?.dados || [];
    } catch (error: unknown) {
      console.error('❌ Erro ao listar CFOP:', getApiErrorMessage(error));
      return [];
    }
  },
};
