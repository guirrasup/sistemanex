// src/services/nfse.service.ts
import api from './api';
import { NFSeDocumento } from '../types/fiscal';

// ============================================================
// INTERFACES
// ============================================================

export interface ListaNfseResponse {
  data: NFSeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroNFSe {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  tomadorId?: string;
  numeroNfse?: number;
  serieDPS?: number;
  chave?: string;
}

// Contrato real aceito por POST /api/nfse/emitir — o backend calcula ISS/PIS/
// COFINS/etc. (calcularTributosNfse) a partir do que é enviado aqui; nada de
// valorISS/baseCalculoISS já calculados, ao contrário do ServicoItemNfse
// "cheio" usado para o documento já emitido.
export interface EmitirNfseServicoParams {
  valorServico: number;
  descontoIncondicionado?: number;
  deducoesMateriais?: number;
  aliquotaISS?: number;
  tipoRetencaoISS?: number;
  tributacaoISSQN?: number;
  codigoTributacaoNacional?: string;
  codigoTributacaoMunicipal?: string;
  codigoNBS?: string;
  descricao?: string;
  aliquotaPIS?: number;
  retidoPIS?: boolean;
  aliquotaCOFINS?: number;
  retidoCOFINS?: boolean;
  aliquotaIRRF?: number;
  aliquotaCSLL?: number;
  aliquotaINSS?: number;
}

export interface EmitirNfseParams {
  tomadorId: string;
  servicoId?: string;
  servico: EmitirNfseServicoParams;
  formaPagamento?: string;
  informacoesComplementares?: string;
  numeroPedido?: string;
}

export interface TotalFaturadoNFSe {
  totalServicos: number;
  totalISS: number;
  totalIBS: number;
  totalCBS: number;
  totalRetencoesFederais: number;
  quantidade: number;
}

export interface ResumoMensalNFSe {
  mes: number;
  ano: number;
  totalNotas: number;
  valorTotal: number;
  totalISS: number;
  totalIBS: number;
  totalCBS: number;
  totalRetencoes: number;
}

export interface ServicoMaisPrestado {
  descricao: string;
  codigo: string;
  quantidade: number;
  valor: number;
}

// ============================================================
// SERVIÇO NFS-e
// ============================================================

export const nfseService = {
  async listar(filtros: FiltroNFSe = {}): Promise<ListaNfseResponse> {
    const { page = 1, limit = 50, ...outrosFiltros } = filtros;
    try {
      const response = await api.get('/nfse', {
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
      console.error('❌ NFS-e listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async buscarPorId(id: string): Promise<NFSeDocumento | null> {
    try {
      const response = await api.get(`/nfse/${id}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  async buscarPorChave(chave: string): Promise<NFSeDocumento | null> {
    try {
      // ✅ VALIDA TChNFSe (53 dígitos)
      if (!/^[0-9]{53}$/.test(chave)) {
        throw new Error('Chave de acesso inválida: deve ter 53 dígitos');
      }
      
      const response = await api.get(`/nfse/chave/${chave}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  async buscarPorProtocolo(protocolo: string): Promise<NFSeDocumento | null> {
    try {
      const response = await api.get(`/nfse/protocolo/${protocolo}`);
      return response.data.dados || response.data || null;
    } catch {
      return null;
    }
  },

  async emitir(dados: EmitirNfseParams): Promise<NFSeDocumento> {
    try {
      // ✅ VALIDA DADOS OBRIGATÓRIOS
      if (!dados.tomadorId) {
        throw new Error('Tomador é obrigatório');
      }

      if (!dados.servico || dados.servico.valorServico <= 0) {
        throw new Error('Valor do serviço deve ser maior que zero');
      }

      if (!dados.servico.descricao && !dados.servicoId) {
        throw new Error('Descrição do serviço é obrigatória ou selecione um serviço do catálogo');
      }

      const response = await api.post('/nfse/emitir', dados);
      return response.data.dados || response.data;
    } catch (error: unknown) {
      console.error('❌ NFS-e emitir erro:', error);
      throw error;
    }
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    try {
      // ✅ VALIDA TJust (15-255 caracteres)
      if (justificativa.length < 15) {
        throw new Error('Justificativa deve ter no mínimo 15 caracteres');
      }
      if (justificativa.length > 255) {
        throw new Error('Justificativa deve ter no máximo 255 caracteres');
      }
      
      await api.post(`/nfse/cancelar/${id}`, { motivo: justificativa });
    } catch (error: unknown) {
      console.error('❌ NFS-e cancelar erro:', error);
      throw error;
    }
  },

  async gerarDanfse(id: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/nfse/danfse/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async baixarXml(id: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/nfse/xml/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async getEstatisticas(): Promise<{ total: number; porStatus: Record<string, number> }> {
    try {
      const response = await api.get('/nfse/estatisticas');
      return response.data.dados || response.data || { total: 0, porStatus: {} };
    } catch {
      return { total: 0, porStatus: {} };
    }
  },

  async getTotalFaturado(dataInicio?: string, dataFim?: string): Promise<TotalFaturadoNFSe> {
    try {
      const response = await api.get('/nfse/total-faturado', {
        params: { dataInicio, dataFim }
      });
      return response.data.dados || response.data || {
        totalServicos: 0,
        totalISS: 0,
        totalIBS: 0,
        totalCBS: 0,
        totalRetencoesFederais: 0,
        quantidade: 0
      };
    } catch {
      return {
        totalServicos: 0,
        totalISS: 0,
        totalIBS: 0,
        totalCBS: 0,
        totalRetencoesFederais: 0,
        quantidade: 0
      };
    }
  },

  async getResumoMensal(ano: number, mes: number): Promise<ResumoMensalNFSe> {
    try {
      const response = await api.get('/nfse/resumo-mensal', {
        params: { ano, mes }
      });
      return response.data.dados || response.data || {
        mes,
        ano,
        totalNotas: 0,
        valorTotal: 0,
        totalISS: 0,
        totalIBS: 0,
        totalCBS: 0,
        totalRetencoes: 0
      };
    } catch {
      return {
        mes,
        ano,
        totalNotas: 0,
        valorTotal: 0,
        totalISS: 0,
        totalIBS: 0,
        totalCBS: 0,
        totalRetencoes: 0
      };
    }
  },

  async getServicosMaisPrestados(dataInicio?: string, dataFim?: string, limit: number = 10): Promise<ServicoMaisPrestado[]> {
    try {
      const response = await api.get('/nfse/servicos-mais-prestados', {
        params: { dataInicio, dataFim, limit }
      });
      return response.data.dados || response.data || [];
    } catch {
      return [];
    }
  },

  async findByTomador(tomadorId: string, dataInicio?: string, dataFim?: string): Promise<NFSeDocumento[]> {
    try {
      const response = await api.get(`/nfse/tomador/${tomadorId}`, {
        params: { dataInicio, dataFim }
      });
      return response.data.dados || response.data || [];
    } catch {
      return [];
    }
  },

  async findByServico(servicoId: string, dataInicio?: string, dataFim?: string): Promise<NFSeDocumento[]> {
    try {
      const response = await api.get(`/nfse/servico/${servicoId}`, {
        params: { dataInicio, dataFim }
      });
      return response.data.dados || response.data || [];
    } catch {
      return [];
    }
  }
};