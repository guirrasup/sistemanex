// src/services/nfe.service.ts
import api from './api';
import { NFeDocumento, TChNFe, TJust, TProt, TCnpj, TSerie, TNF } from '../types/fiscal';

// ============================================================
// INTERFACES
// ============================================================

// Forma real devolvida pelo backend (campos crus do Prisma — ex.: natOp, vNF,
// não naturezaOperacao/valorTotalNota). O tipo `NFeDocumento` do frontend é do
// protótipo antigo e não bate com o schema atual; usar esse tipo aqui seria
// mentir sobre o shape em runtime. Só os campos realmente usados no app estão
// listados — o restante do registro Prisma passa como está.
export interface NfeApiRecord {
  id: string;
  numero: number;
  serie: number;
  chaveAcesso: string;
  status: string;
  protocoloAutorizacao?: string | null;
  natOp?: string | null;
  vNF?: string | number | null;
  destinatarioId?: string;
  destinatario?: {
    id: string;
    razaoSocial: string;
    documento: string;
  };
  itens?: Array<{
    codigoProduto: string;
    quantidade: string | number;
  }>;
  [key: string]: unknown;
}

export interface ListaNfeResponse {
  data: NfeApiRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroNFe {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  destinatarioDocumento?: string;
  destinatarioNome?: string;
  numero?: TNF;
  serie?: TSerie;
}

export interface CancelamentoNFeParams {
  justificativa: TJust;
}

export interface InutilizacaoNFeParams {
  cnpj: TCnpj;
  modelo: '55' | '65';
  serie: TSerie;
  numeroInicial: TNF;
  numeroFinal: TNF;
  justificativa: TJust;
}

export interface CartaCorrecaoParams {
  chaveAcesso: TChNFe;
  cnpjAutor: TCnpj;
  textoCorrecao: TJust;
}

export interface BaixarDocumentoParams {
  id: string;
  chaveAcesso?: TChNFe;
}

// Contrato real aceito por POST /api/nfe/emitir — o backend resolve NCM/CFOP/
// preço/tributos a partir do produtoId; só o essencial é enviado pelo cliente.
export interface EmitirNfeItemParams {
  produtoId: string;
  quantidade?: number;
  valorUnitario?: number;
}

export interface EmitirNfeParams {
  destinatarioId: string;
  itens: EmitirNfeItemParams[];
  naturezaOperacao?: string;
  formaPagamento?: string;
  informacoesAdicionais?: string;
  consumidorFinal?: boolean;
}

// ============================================================
// VALIDAÇÕES DO PL_006h
// ============================================================

function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

function validarTCnpj(cnpj: string): boolean {
  return /^[0-9]{14}$/.test(cnpj.replace(/\D/g, ''));
}

function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= 999999999;
}

// ============================================================
// SERVIÇO NF-e
// ============================================================

export const nfeService = {
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

  async buscarPorId(id: string): Promise<NFeDocumento> {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }
    
    const response = await api.get(`/nfe/${id}`);
    return response.data.dados || response.data;
  },

  async buscarPorChave(chave: string): Promise<NFeDocumento> {
    // ✅ VALIDA TChNFe (44 dígitos)
    if (!validarChaveAcesso(chave)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }
    
    const response = await api.get(`/nfe/chave/${chave}`);
    return response.data.dados || response.data;
  },

  async emitir(dados: EmitirNfeParams): Promise<NfeApiRecord> {
    // ✅ VALIDA DADOS OBRIGATÓRIOS (o backend resolve NCM/CFOP/preço a partir do
    // produtoId de cada item — não faz sentido revalidar aqui o que o backend
    // já valida com a fonte de verdade, o cadastro de produtos).
    if (!dados.destinatarioId) {
      throw new Error('Destinatário é obrigatório');
    }
    if (!dados.itens || dados.itens.length === 0) {
      throw new Error('NF-e deve ter pelo menos um item');
    }
    for (const item of dados.itens) {
      if (!item.produtoId) {
        throw new Error('Cada item deve informar produtoId');
      }
    }

    const response = await api.post('/nfe/emitir', dados);
    return response.data.dados || response.data;
  },

  async cancelar(id: string, justificativa: string): Promise<void> {
    // ✅ VALIDA TJust (15-255 caracteres)
    if (!validarTJust(justificativa)) {
      throw new Error('Justificativa deve ter entre 15 e 255 caracteres (TJust)');
    }
    
    await api.post(`/nfe/cancelar/${id}`, { justificativa });
  },

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

  async gerarDanfe(id: string): Promise<Blob> {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }
    
    const response = await api.get(`/nfe/danfe/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

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