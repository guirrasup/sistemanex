// backend/src/repositories/admin.repository.ts
// Consultas da área de administração de usuários e perfis de acesso.
// Toda consulta recebe empresaId: um ADMIN só enxerga a própria empresa.
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export const SELECT_USUARIO_ADMIN = {
  id: true,
  nome: true,
  email: true,
  cargo: true,
  perfil: true,
  ativo: true,
  ultimoLogin: true,
  createdAt: true,
  updatedAt: true,
  perfilAcessoId: true,
  permissoesConcedidas: true,
  permissoesNegadas: true,
  perfilAcesso: { select: { id: true, nome: true, cor: true, permissoes: true } },
} satisfies Prisma.UsuarioSelect;

export type UsuarioAdmin = Prisma.UsuarioGetPayload<{ select: typeof SELECT_USUARIO_ADMIN }>;

const SELECT_PERFIL = {
  id: true,
  nome: true,
  descricao: true,
  cor: true,
  permissoes: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { usuarios: true } },
} satisfies Prisma.PerfilAcessoSelect;

export class AdminRepository extends BaseRepository {
  // ── Usuários ──────────────────────────────────────────────

  listarUsuarios(empresaId: string) {
    return this.prisma.usuario.findMany({
      where: { empresaId },
      select: SELECT_USUARIO_ADMIN,
      orderBy: [{ ativo: 'desc' }, { nome: 'asc' }],
      take: 1000,
    });
  }

  buscarUsuario(empresaId: string, id: string) {
    return this.prisma.usuario.findFirst({ where: { id, empresaId }, select: SELECT_USUARIO_ADMIN });
  }

  emailEmUso(email: string, excetoId?: string) {
    return this.prisma.usuario
      .count({ where: { email, ...(excetoId ? { id: { not: excetoId } } : {}) } })
      .then((n) => n > 0);
  }

  contarOutrosAdminsAtivos(empresaId: string, excetoId: string) {
    return this.prisma.usuario.count({
      where: { empresaId, perfil: 'ADMIN', ativo: true, id: { not: excetoId } },
    });
  }

  criarUsuario(data: Prisma.UsuarioUncheckedCreateInput) {
    return this.prisma.usuario.create({ data, select: SELECT_USUARIO_ADMIN });
  }

  atualizarUsuario(id: string, data: Prisma.UsuarioUncheckedUpdateInput) {
    return this.prisma.usuario.update({ where: { id }, data, select: SELECT_USUARIO_ADMIN });
  }

  contarLogsDoUsuario(usuarioId: string) {
    return this.prisma.logAcao.count({ where: { usuarioId } });
  }

  excluirUsuario(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }

  // ── Perfis de acesso ──────────────────────────────────────

  listarPerfis(empresaId: string) {
    return this.prisma.perfilAcesso.findMany({
      where: { empresaId },
      select: SELECT_PERFIL,
      orderBy: { nome: 'asc' },
    });
  }

  buscarPerfil(empresaId: string, id: string) {
    return this.prisma.perfilAcesso.findFirst({ where: { id, empresaId }, select: SELECT_PERFIL });
  }

  nomePerfilEmUso(empresaId: string, nome: string, excetoId?: string) {
    return this.prisma.perfilAcesso
      .count({
        where: {
          empresaId,
          nome: { equals: nome, mode: 'insensitive' },
          ...(excetoId ? { id: { not: excetoId } } : {}),
        },
      })
      .then((n) => n > 0);
  }

  criarPerfil(data: Prisma.PerfilAcessoUncheckedCreateInput) {
    return this.prisma.perfilAcesso.create({ data, select: SELECT_PERFIL });
  }

  atualizarPerfil(id: string, data: Prisma.PerfilAcessoUncheckedUpdateInput) {
    return this.prisma.perfilAcesso.update({ where: { id }, data, select: SELECT_PERFIL });
  }

  excluirPerfil(id: string) {
    return this.prisma.perfilAcesso.delete({ where: { id } });
  }

  // ── Auditoria ─────────────────────────────────────────────

  registrarLog(data: Prisma.LogAcaoUncheckedCreateInput) {
    return this.prisma.logAcao.create({ data });
  }

  async listarAuditoria(empresaId: string, page: number, limit: number) {
    const where: Prisma.LogAcaoWhereInput = { empresaId, entidade: { in: ['Usuario', 'PerfilAcesso'] } };
    const [data, total] = await Promise.all([
      this.prisma.logAcao.findMany({
        where,
        include: { usuario: { select: { nome: true, email: true } } },
        orderBy: { dataHora: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.logAcao.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
