// C:\emissornfe\src\services\nfe.service.ts

import api from './api';
import { NFeDocumento, TChNFe, TJust, TProt, TCnpj, TSerie, TNF } from '../types/fiscal';

// ============================================================
// INTERFACES
// ============================================================

export interface ListaNfeResponse {
  data: NFeDocumento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroNFe {
  /** Número da página */
  page?: number;
  /** Itens por página */
  limit?: number;
  /** Status do documento */
  status?: string;
  /** Data inicial (YYYY-MM-DD) */
  dataInicio?: string;
  /** Data final (YYYY-MM-DD) */
  dataFim?: string;
  /** CNPJ/CPF do destinatário */
  destinatarioDocumento?: string;
  /** Nome do destinatário */
  destinatarioNome?: string;
  /** Número da NF-e */
  numero?: TNF;
  /** Série da NF-e */
  serie?: TSerie;
}

export interface CancelamentoNFeParams {
  /** TJust: 15-255 caracteres */
  justificativa: TJust;
}

export interface InutilizacaoNFeParams {
  /** TCnpj: 14 dígitos */
  cnpj: TCnpj;
  /** TSerie: 0 ou 1-999 */
  serie: TSerie;
  /** TNF: número inicial */
  numeroInicial: TNF;
  /** TNF: número final */
  numeroFinal: TNF;
  /** TJust: 15-255 caracteres */
  justificativa: TJust;
}

export interface CartaCorrecaoParams {
  /** TChNFe: 44 dígitos */
  chaveAcesso: TChNFe;
  /** TCnpj: 14 dígitos */
  cnpjAutor: TCnpj;
  /** TJust: 15-255 caracteres */
  textoCorrecao: TJust;
}

export interface BaixarDocumentoParams {
  /** ID da NF-e no sistema */
  id: string;
  /** TChNFe: 44 dígitos (opcional para validação) */
  chaveAcesso?: TChNFe;
}

// ============================================================
// VALIDAÇÕES DO PL_006h
// ============================================================

/**
 * ✅ Valida TChNFe (44 dígitos)
 */
function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

/**
 * ✅ Valida TJust (15-255 caracteres)
 */
function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

/**
 * ✅ Valida TCnpj (14 dígitos)
 */
function validarTCnpj(cnpj: string): boolean {
  return /^[0-9]{14}$/.test(cnpj.replace(/\D/g, ''));
}

/**
 * ✅ Valida TSerie (0 ou 1-999)
 */
function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

/**
 * ✅ Valida TNF (1-999999999)
 */
function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= 999999999;
}

// ============================================================
// SERVIÇO NF-e
// ============================================================

export const nfeService = {
  /**
   * 🔥 LISTAR NF-e COM FILTROS
   * GET /api/nfe
   */
  async listar(filtros: FiltroNFe = {}): Promise<ListaNfeResponse> {
    const { page = 1, limit = 50, ...outrosFiltros } = filtros;
    
    const response = await api.get('/nfe', {
      params: { page, limit, ...outrosFiltros }
    });
    
    if (response.data && response.data.sucesso && response.data.dados) {
      return response.data.dados;
    }
    if (response.data && response.data.data) {
      return response.data;
    }
    return { data: [], total: 0, page, limit, totalPages: 0 };
  },

  /**
   * 🔥 BUSCAR NF-e POR ID
   * GET /api/nfe/:id
   */
  async buscarPorId(id: string): Promise<NFeDocumento> {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }
    
    const response = await api.get(`/nfe/${id}`);
    return response.data.dados || response.data;
  },

  /**
   * 🔥 BUSCAR NF-e POR CHAVE DE ACESSO
   * GET /api/nfe/chave/:chave
   * 
   * ✅ Valida TChNFe (44 dígitos)
   */
  async buscarPorChave(chave: string): Promise<NFeDocumento> {
    // ✅ VALIDA TChNFe (44 dígitos)
    if (!validarChaveAcesso(chave)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }
    
    const response = await api.get(`/nfe/chave/${chave}`);
    return response.data.dados || response.data;
  },

  /**
   * 🔥 EMITIR NF-e
   * POST /api/nfe/emitir
   * 
   * ✅ Valida dados obrigatórios antes de enviar
   */
  async emitir(nfe: Partial<NFeDocumento>): Promise<NFeDocumento> {
    // ✅ VALIDA DADOS OBRIGATÓRIOS
    if (!nfe.emitente?.cnpj) {
      throw new Error('CNPJ do emitente é obrigatório');
    }
    if (!nfe.destinatario?.documento) {
      throw new Error('Documento do destinatário é obrigatório');
    }
    if (!nfe.itens || nfe.itens.length === 0) {
      throw new Error('NF-e deve ter pelo menos um item');
    }
    
    // ✅ VALIDA CADA ITEM
    for (const item of nfe.itens) {
      if (!item.ncm || item.ncm.length !== 8) {
        throw new Error('NCM deve ter 8 dígitos');
      }
      if (!item.cfop || item.cfop.length !== 4) {
        throw new Error('CFOP deve ter 4 dígitos');
      }
      if (!item.quantidade || item.quantidade <= 0) {
        throw new Error('Quantidade do item deve ser maior que zero');
      }
    }
    
    const response = await api.post('/nfe/emitir', nfe);
    return response.data.dados || response.data;
  },

  /**
   * 🔥 CANCELAR NF-e
   * POST /api/nfe/cancelar/:id
   * 
   * ✅ Valida TJust (15-255 caracteres)
   */
  async cancelar(id: string, justificativa: string): Promise<void> {
    // ✅ VALIDA TJust (15-255 caracteres)
    if (!validarTJust(justificativa)) {
      throw new Error('Justificativa deve ter entre 15 e 255 caracteres (TJust)');
    }
    
    await api.post(`/nfe/cancelar/${id}`, { justificativa });
  },

  /**
   * 🔥 INUTILIZAR NUMERAÇÃO
   * POST /api/nfe/inutilizar
   * 
   * ✅ Valida TCnpj, TSerie, TNF, TJust
   */
  async inutilizar(params: InutilizacaoNFeParams): Promise<void> {
    // ✅ VALIDA TCnpj (14 dígitos)
    if (!validarTCnpj(params.cnpj)) {
      throw new Error('CNPJ inválido: deve ter 14 dígitos (TCnpj)');
    }
    
    // ✅ VALIDA TSerie (0 ou 1-999)
    if (!validarTSerie(params.serie)) {
      throw new Error('Série inválida: deve ser 0 ou entre 1 e 999 (TSerie)');
    }
    
    // ✅ VALIDA TNF (1-999999999)
    if (!validarTNF(params.numeroInicial)) {
      throw new Error('Número inicial inválido: deve ser entre 1 e 999999999 (TNF)');
    }
    if (!validarTNF(params.numeroFinal)) {
      throw new Error('Número final inválido: deve ser entre 1 e 999999999 (TNF)');
    }
    
    // ✅ VALIDA SE NÚMERO INICIAL É MENOR QUE FINAL
    if (params.numeroInicial > params.numeroFinal) {
      throw new Error('Número inicial deve ser menor ou igual ao número final');
    }
    
    // ✅ VALIDA TJust (15-255 caracteres)
    if (!validarTJust(params.justificativa)) {
      throw new Error('Justificativa deve ter entre 15 e 255 caracteres (TJust)');
    }
    
    await api.post('/nfe/inutilizar', params);
  },

  /**
   * 🔥 GERAR DANFE (Documento Auxiliar)
   * GET /api/nfe/danfe/:id
   */
  async gerarDanfe(id: string): Promise<Blob> {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }
    
    const response = await api.get(`/nfe/danfe/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * 🔥 BAIXAR XML DA NF-e
   * GET /api/nfe/xml/:id
   * 
   * ✅ Validação opcional da chave
   */
  async baixarXml(params: BaixarDocumentoParams): Promise<Blob> {
    const { id, chaveAcesso } = params;
    
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }
    
    // ✅ VALIDA TChNFe (se fornecida)
    if (chaveAcesso && !validarChaveAcesso(chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }
    
    const response = await api.get(`/nfe/xml/${id}`, {
      responseType: 'blob',
      params: chaveAcesso ? { chave: chaveAcesso } : {}
    });
    return response.data;
  },

  /**
   * 🔥 ENVIAR CARTA DE CORREÇÃO (CC-e)
   * POST /api/nfe/carta-correcao
   * 
   * ✅ Valida TChNFe, TCnpj, TJust
   */
  async enviarCartaCorrecao(params: CartaCorrecaoParams): Promise<void> {
    // ✅ VALIDA TChNFe (44 dígitos)
    if (!validarChaveAcesso(params.chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }
    
    // ✅ VALIDA TCnpj (14 dígitos)
    if (!validarTCnpj(params.cnpjAutor)) {
      throw new Error('CNPJ do autor inválido: deve ter 14 dígitos (TCnpj)');
    }
    
    // ✅ VALIDA TJust (15-255 caracteres)
    if (!validarTJust(params.textoCorrecao)) {
      throw new Error('Texto de correção deve ter entre 15 e 255 caracteres (TJust)');
    }
    
    await api.post('/nfe/carta-correcao', params);
  },

  /**
   * 🔥 CONSULTAR SITUAÇÃO DA NF-e NA SEFAZ
   * GET /api/nfe/consultar/:chave
   */
  async consultarSituacao(chave: string): Promise<{
    status: string;
    protocolo?: string;
    motivo?: string;
  }> {
    // ✅ VALIDA TChNFe (44 dígitos)
    if (!validarChaveAcesso(chave)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }
    
    const response = await api.get(`/nfe/consultar/${chave}`);
    return response.data.dados || response.data;
  },

  /**
   * 🔥 ENVIAR LOTE DE NF-e
   * POST /api/nfe/lote
   */
  async enviarLote(nfes: Partial<NFeDocumento>[]): Promise<{
    idLote: string;
    status: string;
    recibo: string;
  }> {
    if (!nfes || nfes.length === 0) {
      throw new Error('Lote deve conter pelo menos uma NF-e');
    }
    
    if (nfes.length > 50) {
      throw new Error('Lote não pode ter mais de 50 NF-es');
    }
    
    const response = await api.post('/nfe/lote', { nfes });
    return response.data.dados || response.data;
  }
};