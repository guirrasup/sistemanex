// src/types/index.ts
export interface ApiResponse<T = any> {
  sucesso: boolean
  dados?: T
  error?: string
  mensagem?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserPayload {
  id: string
  email: string
  perfil: string
  empresaId: string
}

export interface EmissaoNfseRequest {
  tomadorId: string
  servicoId: string
  valorServico: number
  descontoIncondicionado?: number
  deducoesMateriais?: number
  informacoesComplementares?: string
}

export interface CancelamentoRequest {
  motivo: string
}