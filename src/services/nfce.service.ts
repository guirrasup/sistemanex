// src/services/nfce.service.ts
import api from './api';
import { NFCeDocumento } from '../types/fiscal';
import { getApiErrorMessage } from '../utils/apiError';

export interface ListaNfceResponse {
  data: NFCeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroNFCe {
  page?: number;
  limit?: number;
  status?: string;
}

// Contrato real aceito por POST /api/nfce/emitir — diferente da NF-e, o item
// aqui não é produto-driven (não recebe produtoId): o próprio chamador informa
// NCM/CFOP/tributos, porque a NFC-e comporta itens fora do catálogo cadastrado.
export interface EmitirNfceItemParams {
  codigoProduto?: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unidadeMedida?: string;
  quantidade: number;
  valorUnitario: number;
  cstICMS?: string;
  csosnICMS?: string;
  aliquotaICMS?: number;
  baseCalculoICMS?: number;
  valorICMS?: number;
  cstPIS?: string;
  aliquotaPIS?: number;
  valorPIS?: number;
  cstCOFINS?: string;
  aliquotaCOFINS?: number;
  valorCOFINS?: number;
  valorTributosAproximados?: number;
}

export interface EmitirNfceParams {
  itens: EmitirNfceItemParams[];
  consumidorIdentificado?: boolean;
  consumidorDoc?: string;
  consumidorNome?: string;
  naturezaOperacao?: string;
  valorDesconto?: number;
  valorAcrescimo?: number;
  formaPagamento?: string;
  valorPago?: number;
  valorRecebido?: number;
  valorTotalNota?: number;
  tokenCscId?: string;
  infAdFisco?: string;
  infCpl?: string;
  tpNF?: number;
  idDest?: number;
  finNFe?: number;
  indFinal?: number;
  indPres?: number;
  procEmi?: string;
  verProc?: string;
  tpEmis?: number;
}

export const nfceService = {
  async listar(filtros: FiltroNFCe = {}): Promise<ListaNfceResponse> {
    const { page = 1, limit = 50, ...outrosFiltros } = filtros;
    try {
      const response = await api.get('/nfce', {
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
      console.error('❌ NFC-e listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async emitir(dados: EmitirNfceParams): Promise<NFCeDocumento> {
    if (!dados.itens || dados.itens.length === 0) {
      throw new Error('NFC-e deve ter pelo menos um item');
    }
    for (const item of dados.itens) {
      if (!item.ncm || item.ncm.length !== 8) {
        throw new Error(`Item "${item.descricao}": NCM deve ter 8 dígitos`);
      }
      if (!item.cfop || item.cfop.length !== 4) {
        throw new Error(`Item "${item.descricao}": CFOP deve ter 4 dígitos`);
      }
      if (!item.quantidade || item.quantidade <= 0) {
        throw new Error(`Item "${item.descricao}": quantidade deve ser maior que zero`);
      }
      if (!item.valorUnitario || item.valorUnitario <= 0) {
        throw new Error(`Item "${item.descricao}": valor unitário deve ser maior que zero`);
      }
    }

    try {
      const response = await api.post('/nfce/emitir', dados);
      return response.data?.dados || response.data;
    } catch (error: unknown) {
      console.error('❌ NFC-e emitir erro:', error);
      throw new Error(getApiErrorMessage(error, 'Erro ao emitir NFC-e'));
    }
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    if (justificativa.length < 15 || justificativa.length > 255) {
      throw new Error('Justificativa deve ter entre 15 e 255 caracteres');
    }
    try {
      await api.post(`/nfce/cancelar/${id}`, { motivo: justificativa });
    } catch (error: unknown) {
      console.error('❌ NFC-e cancelar erro:', error);
      throw new Error(getApiErrorMessage(error, 'Erro ao cancelar NFC-e'));
    }
  },
};
