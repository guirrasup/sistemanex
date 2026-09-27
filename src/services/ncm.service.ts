// src/services/ncm.service.ts
import api from './api';
import { getApiErrorMessage } from '../utils/apiError';

export interface Ncm {
  id: string;
  codigo: string;
  descricao: string;
}

export const ncmService = {
  // 🔥 Tabela tem ~10.400 linhas — nunca lista tudo, sempre busca por termo
  // (código ou descrição) direto no backend, que já limita o resultado.
  async buscar(termo: string): Promise<Ncm[]> {
    if (!termo.trim()) return [];
    try {
      const response = await api.get('/ncm', { params: { busca: termo } });
      return response.data?.dados || [];
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NCM:', getApiErrorMessage(error));
      return [];
    }
  },
};
