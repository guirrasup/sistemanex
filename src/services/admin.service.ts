// src/services/admin.service.ts
// Área de administração (exclusiva do ADMIN): usuários, perfis de acesso e auditoria.
import api from './api';
import { PerfilUsuario } from '../types/erp';

export type NivelPermissao = 'ver' | 'operar' | 'total';

export interface DefinicaoPermissao {
  chave: string;
  label: string;
  descricao: string;
  nivel: NivelPermissao;
}

export interface ModuloPermissoes {
  id: string;
  titulo: string;
  grupo: string;
  permissoes: DefinicaoPermissao[];
}

export interface CatalogoPermissoes {
  modulos: ModuloPermissoes[];
  padraoPorNivel: Record<'FISCAL' | 'OPERADOR', string[]>;
}

export interface PerfilAcesso {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  permissoes: string[];
  createdAt: string;
  updatedAt: string;
  _count: { usuarios: number };
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  cargo: string | null;
  perfil: PerfilUsuario;
  ativo: boolean;
  ultimoLogin: string | null;
  createdAt: string;
  perfilAcessoId: string | null;
  perfilAcesso: { id: string; nome: string; cor: string } | null;
  permissoesConcedidas: string[];
  permissoesNegadas: string[];
  /** Permissões efetivas (já calculadas pelo backend). */
  permissoes: string[];
}

export interface UsuarioPayload {
  nome: string;
  email: string;
  cargo?: string | null;
  senha?: string;
  perfil: PerfilUsuario;
  ativo?: boolean;
  perfilAcessoId: string | null;
  permissoesConcedidas: string[];
  permissoesNegadas: string[];
}

export interface PerfilPayload {
  nome: string;
  descricao?: string | null;
  cor: string;
  permissoes: string[];
}

export interface RegistroAuditoria {
  id: string;
  acao: string;
  entidade: 'Usuario' | 'PerfilAcesso';
  entidadeId: string;
  dadosAntigos: string | null;
  dadosNovos: string | null;
  ipOrigem: string | null;
  dataHora: string;
  usuario: { nome: string; email: string };
}

export interface PaginaAuditoria {
  data: RegistroAuditoria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminService = {
  async catalogo(): Promise<CatalogoPermissoes> {
    return (await api.get('/admin/permissoes')).data.dados;
  },

  async listarUsuarios(): Promise<UsuarioAdmin[]> {
    return (await api.get('/admin/usuarios')).data.dados;
  },

  async criarUsuario(dados: UsuarioPayload): Promise<UsuarioAdmin> {
    return (await api.post('/admin/usuarios', dados)).data.dados;
  },

  async atualizarUsuario(id: string, dados: Partial<UsuarioPayload>): Promise<UsuarioAdmin> {
    return (await api.put(`/admin/usuarios/${id}`, dados)).data.dados;
  },

  async alterarStatus(id: string, ativo: boolean): Promise<UsuarioAdmin> {
    return (await api.patch(`/admin/usuarios/${id}/status`, { ativo })).data.dados;
  },

  async redefinirSenha(id: string, novaSenha: string): Promise<void> {
    await api.put(`/admin/usuarios/${id}/senha`, { novaSenha });
  },

  async encerrarSessoes(id: string): Promise<void> {
    await api.post(`/admin/usuarios/${id}/encerrar-sessoes`);
  },

  async excluirUsuario(id: string): Promise<void> {
    await api.delete(`/admin/usuarios/${id}`);
  },

  async listarPerfis(): Promise<PerfilAcesso[]> {
    return (await api.get('/admin/perfis')).data.dados;
  },

  async criarPerfil(dados: PerfilPayload): Promise<PerfilAcesso> {
    return (await api.post('/admin/perfis', dados)).data.dados;
  },

  async atualizarPerfil(id: string, dados: PerfilPayload): Promise<PerfilAcesso> {
    return (await api.put(`/admin/perfis/${id}`, dados)).data.dados;
  },

  async excluirPerfil(id: string): Promise<void> {
    await api.delete(`/admin/perfis/${id}`);
  },

  async auditoria(page = 1, limit = 30): Promise<PaginaAuditoria> {
    return (await api.get('/admin/auditoria', { params: { page, limit } })).data.dados;
  },
};
