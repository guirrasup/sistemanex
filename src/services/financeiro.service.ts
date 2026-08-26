// C:\emissornfe\src\services\financeiro.service.ts

import api from './api';
import { TituloFinanceiro } from '../types/erp';

export interface ListaTitulosResponse {
  data: TituloFinanceiro[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResumoFinanceiro {
  totalAReceber: number;
  totalAPagar: number;
  totalRecebido: number;
  totalPago: number;
}

export interface FiltroTitulos {
  tipo?: 'RECEBER' | 'PAGAR';
  status?: 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
  dataInicio?: string;
  dataFim?: string;
  pessoaId?: string;
}

// 🔥 EXPORTAÇÃO NOMEADA (correta)
export const financeiroService = {
  async listar(page: number = 1, limit: number = 50, filtros: FiltroTitulos = {}): Promise<ListaTitulosResponse> {
    const response = await api.get('/financeiro/titulos', {
      params: { page, limit, ...filtros }
    });
    if (response.data && response.data.sucesso && response.data.dados) {
      return response.data.dados;
    }
    if (response.data && response.data.data) {
      return response.data;
    }
    return { data: [], total: 0, page, limit, totalPages: 0 };
  },

  async buscarPorId(id: string): Promise<TituloFinanceiro> {
    const response = await api.get(`/financeiro/titulos/${id}`);
    return response.data.dados || response.data;
  },

  async listarPendentes(): Promise<TituloFinanceiro[]> {
    const response = await api.get('/financeiro/titulos/pendentes');
    return response.data.dados || response.data || [];
  },

  async criar(titulo: Omit<TituloFinanceiro, 'id'>): Promise<TituloFinanceiro> {
    const response = await api.post('/financeiro/titulos', titulo);
    return response.data.dados || response.data;
  },

  async atualizar(id: string, titulo: Partial<TituloFinanceiro>): Promise<TituloFinanceiro> {
    const response = await api.put(`/financeiro/titulos/${id}`, titulo);
    return response.data.dados || response.data;
  },

  async baixarTitulo(id: string, valorPago?: number, dataPagamento?: string): Promise<TituloFinanceiro> {
    const response = await api.post(`/financeiro/titulos/baixar/${id}`, {
      valorPago,
      dataPagamento
    });
    return response.data.dados || response.data;
  },

  async cancelar(id: string): Promise<void> {
    await api.post(`/financeiro/titulos/cancelar/${id}`);
  },

  async obterResumo(): Promise<ResumoFinanceiro> {
    const response = await api.get('/financeiro/resumo');
    return response.data.dados || response.data || {
      totalAReceber: 0,
      totalAPagar: 0,
      totalRecebido: 0,
      totalPago: 0
    };
  },

  async gerarPix(id: string): Promise<{
    qrCode: string;
    copiaCola: string;
    chavePix: string;
  }> {
    const response = await api.get(`/financeiro/titulos/${id}/pix`);
    return response.data.dados || response.data;
  }
};