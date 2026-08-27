// src/services/transportadora.service.ts

import api from './api';

export interface Transportadora {
  id: string;
  tipoPessoa: 'PJ' | 'PF' | 'EXTERIOR';
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnae?: string;
  email?: string;
  telefone?: string;
  celularWhatsApp?: string;
  contato?: string;
  site?: string;
  rntrc?: string;
  antt?: string;
  inscricaoSuframa?: string;
  regimeTributario?: 'SIMPLES_NACIONAL' | 'SIMPLES_EXCESSO' | 'NORMAL';
  tipoTransportador?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  chavePix?: string;
  ativo: boolean;
  observacoes?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone?: string;
    email?: string;
  };
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListaTransportadoraResponse {
  data: Transportadora[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const transportadoraService = {
  async listar(page: number = 1, limit: number = 50, busca: string = ''): Promise<ListaTransportadoraResponse> {
    try {
      const response = await api.get('/transportadoras', {
        params: { page, limit, busca }
      });
      
      if (response.data && response.data.sucesso && response.data.dados) {
        return response.data.dados;
      }
      return { data: [], total: 0, page, limit, totalPages: 0 };
    } catch (error) {
      console.error('❌ transportadora.listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async buscarPorId(id: string): Promise<Transportadora> {
    const response = await api.get(`/transportadoras/${id}`);
    return response.data.dados || response.data;
  },

  async buscarPorCnpj(cnpj: string): Promise<Transportadora> {
    const response = await api.get(`/transportadoras/cnpj/${cnpj}`);
    return response.data.dados || response.data;
  },

  async buscarAtivos(): Promise<Transportadora[]> {
    const response = await api.get('/transportadoras/ativos');
    return response.data.dados || response.data || [];
  },

  async buscarPorTipo(tipo: string): Promise<Transportadora[]> {
    const response = await api.get(`/transportadoras/tipo/${tipo}`);
    return response.data.dados || response.data || [];
  },

  async criar(transportadora: Omit<Transportadora, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transportadora> {
    const response = await api.post('/transportadoras', transportadora);
    return response.data.dados || response.data;
  },

  async atualizar(id: string, transportadora: Partial<Transportadora>): Promise<Transportadora> {
    const response = await api.put(`/transportadoras/${id}`, transportadora);
    return response.data.dados || response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/transportadoras/${id}`);
  }
};