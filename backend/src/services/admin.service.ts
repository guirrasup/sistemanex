// backend/src/services/admin.service.ts
// Regras da administração de usuários e perfis de acesso (área exclusiva do ADMIN).
import bcrypt from 'bcryptjs';
import { PerfilUsuario } from '@prisma/client';
import { AdminRepository, UsuarioAdmin } from '../repositories/admin.repository.js';
import {
  CATALOGO_PERMISSOES,
  PERMISSOES_PADRAO_POR_NIVEL,
  normalizarPermissoes,
} from '../config/permissoes.js';
import { calcularPermissoesEfetivas, invalidarAcesso } from './acesso.service.js';

/** Erro de regra de negócio: o controller devolve `status` + `message` ao cliente. */
export class ErroAdmin extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface ContextoAdmin {
  adminId: string;
  empresaId: string;
  ip?: string;
}

const NIVEIS: PerfilUsuario[] = ['ADMIN', 'FISCAL', 'OPERADOR'];
const CORES_PERFIL = ['slate', 'blue', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'orange'];
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SENHA_MINIMA = 6;

function texto(valor: unknown, campo: string, { obrigatorio = false, max = 255 } = {}): string | null {
  if (valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '')) {
    if (obrigatorio) throw new ErroAdmin(400, `${campo} é obrigatório`);
    return null;
  }
  if (typeof valor !== 'string') throw new ErroAdmin(400, `${campo} inválido`);
  const limpo = valor.trim();
  if (limpo.length > max) throw new ErroAdmin(400, `${campo} deve ter no máximo ${max} caracteres`);
  return limpo;
}

function validarSenha(senha: unknown): string {
  if (typeof senha !== 'string' || senha.length < SENHA_MINIMA) {
    throw new ErroAdmin(400, `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres`);
  }
  return senha;
}

/** Concedidas e negadas nunca se sobrepõem: se vier nas duas, negar vence. */
function normalizarExcecoes(concedidas: unknown, negadas: unknown) {
  const negadasOk = normalizarPermissoes(negadas);
  const bloqueadas = new Set(negadasOk);
  return {
    permissoesConcedidas: normalizarPermissoes(concedidas).filter((c) => !bloqueadas.has(c)),
    permissoesNegadas: negadasOk,
  };
}

function paraResposta(u: UsuarioAdmin) {
  const { perfilAcesso, ...resto } = u;
  return {
    ...resto,
    perfilAcesso: perfilAcesso ? { id: perfilAcesso.id, nome: perfilAcesso.nome, cor: perfilAcesso.cor } : null,
    permissoes: calcularPermissoesEfetivas({
      perfil: u.perfil,
      perfilAcessoPermissoes: perfilAcesso?.permissoes ?? null,
      permissoesConcedidas: u.permissoesConcedidas,
      permissoesNegadas: u.permissoesNegadas,
    }),
  };
}

// Snapshot enxuto para a auditoria (nunca inclui hash de senha).
function snapshotUsuario(u: UsuarioAdmin) {
  return {
    nome: u.nome,
    email: u.email,
    cargo: u.cargo,
    perfil: u.perfil,
    ativo: u.ativo,
    perfilAcesso: u.perfilAcesso?.nome ?? null,
    permissoesConcedidas: u.permissoesConcedidas,
    permissoesNegadas: u.permissoesNegadas,
  };
}

export class AdminService {
  private repo = new AdminRepository();

  catalogo() {
    return { modulos: CATALOGO_PERMISSOES, padraoPorNivel: PERMISSOES_PADRAO_POR_NIVEL };
  }

  // ── Usuários ──────────────────────────────────────────────

  async listarUsuarios(empresaId: string) {
    const usuarios = await this.repo.listarUsuarios(empresaId);
    return usuarios.map(paraResposta);
  }

  async obterUsuario(empresaId: string, id: string) {
    return paraResposta(await this.exigirUsuario(empresaId, id));
  }

  async criarUsuario(ctx: ContextoAdmin, body: Record<string, unknown>) {
    const nome = texto(body.nome, 'Nome', { obrigatorio: true, max: 120 })!;
    const email = this.validarEmail(body.email);
    const senha = validarSenha(body.senha);
    const perfil = this.validarNivel(body.perfil ?? 'OPERADOR');
    const perfilAcessoId = await this.validarPerfilAcesso(ctx.empresaId, body.perfilAcessoId);

    if (await this.repo.emailEmUso(email)) throw new ErroAdmin(409, 'E-mail já cadastrado');

    const criado = await this.repo.criarUsuario({
      nome,
      email,
      senhaHash: await bcrypt.hash(senha, 12),
      cargo: texto(body.cargo, 'Cargo', { max: 80 }),
      perfil,
      ativo: body.ativo === undefined ? true : body.ativo === true,
      empresaId: ctx.empresaId,
      perfilAcessoId,
      ...normalizarExcecoes(body.permissoesConcedidas, body.permissoesNegadas),
    });

    await this.auditar(ctx, 'CRIAR', 'Usuario', criado.id, null, snapshotUsuario(criado));
    return paraResposta(criado);
  }

  async atualizarUsuario(ctx: ContextoAdmin, id: string, body: Record<string, unknown>) {
    const atual = await this.exigirUsuario(ctx.empresaId, id);
    const proprio = id === ctx.adminId;

    const data: Record<string, unknown> = {};
    if (body.nome !== undefined) data.nome = texto(body.nome, 'Nome', { obrigatorio: true, max: 120 });
    if (body.cargo !== undefined) data.cargo = texto(body.cargo, 'Cargo', { max: 80 });

    if (body.email !== undefined) {
      const email = this.validarEmail(body.email);
      if (email !== atual.email && (await this.repo.emailEmUso(email, id))) {
        throw new ErroAdmin(409, 'E-mail já cadastrado');
      }
      data.email = email;
    }

    if (body.perfil !== undefined) {
      const perfil = this.validarNivel(body.perfil);
      if (perfil !== atual.perfil) {
        if (proprio) throw new ErroAdmin(400, 'Você não pode alterar o seu próprio nível de acesso');
        if (atual.perfil === 'ADMIN') await this.garantirOutroAdmin(ctx.empresaId, id);
        data.perfil = perfil;
      }
    }

    if (body.ativo !== undefined) {
      const ativo = body.ativo === true;
      if (!ativo && atual.ativo) await this.validarDesativacao(ctx, atual);
      data.ativo = ativo;
    }

    if (body.perfilAcessoId !== undefined) {
      data.perfilAcessoId = await this.validarPerfilAcesso(ctx.empresaId, body.perfilAcessoId);
    }

    if (body.permissoesConcedidas !== undefined || body.permissoesNegadas !== undefined) {
      Object.assign(
        data,
        normalizarExcecoes(
          body.permissoesConcedidas ?? atual.permissoesConcedidas,
          body.permissoesNegadas ?? atual.permissoesNegadas
        )
      );
    }

    const atualizado = await this.repo.atualizarUsuario(id, data);
    invalidarAcesso(id);
    await this.auditar(ctx, 'ALTERAR', 'Usuario', id, snapshotUsuario(atual), snapshotUsuario(atualizado));
    return paraResposta(atualizado);
  }

  async alterarStatus(ctx: ContextoAdmin, id: string, ativo: boolean) {
    return this.atualizarUsuario(ctx, id, { ativo });
  }

  async redefinirSenha(ctx: ContextoAdmin, id: string, novaSenha: unknown) {
    const usuario = await this.exigirUsuario(ctx.empresaId, id);
    const senha = validarSenha(novaSenha);

    await this.repo.atualizarUsuario(id, {
      senhaHash: await bcrypt.hash(senha, 12),
      // A senha antiga pode ter vazado: derruba as sessões abertas do usuário.
      sessaoVersao: { increment: 1 },
    });
    invalidarAcesso(id);
    await this.auditar(ctx, 'REDEFINIR_SENHA', 'Usuario', id, null, { email: usuario.email });
  }

  async encerrarSessoes(ctx: ContextoAdmin, id: string) {
    if (id === ctx.adminId) throw new ErroAdmin(400, 'Use "Sair" para encerrar a sua própria sessão');
    const usuario = await this.exigirUsuario(ctx.empresaId, id);

    await this.repo.atualizarUsuario(id, { sessaoVersao: { increment: 1 } });
    invalidarAcesso(id);
    await this.auditar(ctx, 'ENCERRAR_SESSOES', 'Usuario', id, null, { email: usuario.email });
  }

  async excluirUsuario(ctx: ContextoAdmin, id: string) {
    if (id === ctx.adminId) throw new ErroAdmin(400, 'Você não pode excluir o seu próprio usuário');
    const usuario = await this.exigirUsuario(ctx.empresaId, id);
    if (usuario.perfil === 'ADMIN' && usuario.ativo) await this.garantirOutroAdmin(ctx.empresaId, id);

    // Usuário com histórico não pode sumir (perderia a autoria das ações).
    if ((await this.repo.contarLogsDoUsuario(id)) > 0) {
      throw new ErroAdmin(409, 'Este usuário possui histórico de ações no sistema. Desative-o em vez de excluir.');
    }

    await this.repo.excluirUsuario(id);
    invalidarAcesso(id);
    await this.auditar(ctx, 'EXCLUIR', 'Usuario', id, snapshotUsuario(usuario), null);
  }

  // ── Perfis de acesso ──────────────────────────────────────

  async listarPerfis(empresaId: string) {
    return this.repo.listarPerfis(empresaId);
  }

  async criarPerfil(ctx: ContextoAdmin, body: Record<string, unknown>) {
    const dados = await this.validarPerfilBody(ctx.empresaId, body);
    const criado = await this.repo.criarPerfil({ ...dados, empresaId: ctx.empresaId });
    await this.auditar(ctx, 'CRIAR', 'PerfilAcesso', criado.id, null, dados);
    return criado;
  }

  async atualizarPerfil(ctx: ContextoAdmin, id: string, body: Record<string, unknown>) {
    const atual = await this.exigirPerfil(ctx.empresaId, id);
    const dados = await this.validarPerfilBody(ctx.empresaId, body, id);
    const atualizado = await this.repo.atualizarPerfil(id, dados);
    // Todos os usuários do perfil mudam de permissão.
    invalidarAcesso();
    await this.auditar(
      ctx, 'ALTERAR', 'PerfilAcesso', id,
      { nome: atual.nome, descricao: atual.descricao, cor: atual.cor, permissoes: atual.permissoes },
      dados
    );
    return atualizado;
  }

  async excluirPerfil(ctx: ContextoAdmin, id: string) {
    const perfil = await this.exigirPerfil(ctx.empresaId, id);
    if (perfil._count.usuarios > 0) {
      throw new ErroAdmin(
        409,
        `Este perfil está em uso por ${perfil._count.usuarios} usuário(s). Mova-os para outro perfil antes de excluir.`
      );
    }
    await this.repo.excluirPerfil(id);
    await this.auditar(ctx, 'EXCLUIR', 'PerfilAcesso', id, { nome: perfil.nome, permissoes: perfil.permissoes }, null);
  }

  // ── Auditoria ─────────────────────────────────────────────

  async listarAuditoria(empresaId: string, page: number, limit: number) {
    return this.repo.listarAuditoria(empresaId, Math.max(1, page), Math.min(Math.max(1, limit), 100));
  }

  // ── Helpers ───────────────────────────────────────────────

  private async exigirUsuario(empresaId: string, id: string) {
    const usuario = await this.repo.buscarUsuario(empresaId, id);
    if (!usuario) throw new ErroAdmin(404, 'Usuário não encontrado');
    return usuario;
  }

  private async exigirPerfil(empresaId: string, id: string) {
    const perfil = await this.repo.buscarPerfil(empresaId, id);
    if (!perfil) throw new ErroAdmin(404, 'Perfil de acesso não encontrado');
    return perfil;
  }

  private validarEmail(valor: unknown): string {
    const email = texto(valor, 'E-mail', { obrigatorio: true, max: 160 })!.toLowerCase();
    if (!EMAIL_REGEX.test(email)) throw new ErroAdmin(400, 'Formato de e-mail inválido');
    return email;
  }

  private validarNivel(valor: unknown): PerfilUsuario {
    if (!NIVEIS.includes(valor as PerfilUsuario)) {
      throw new ErroAdmin(400, `Nível inválido. Use um de: ${NIVEIS.join(', ')}`);
    }
    return valor as PerfilUsuario;
  }

  private async validarPerfilAcesso(empresaId: string, valor: unknown): Promise<string | null> {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor !== 'string') throw new ErroAdmin(400, 'Perfil de acesso inválido');
    await this.exigirPerfil(empresaId, valor);
    return valor;
  }

  private async validarDesativacao(ctx: ContextoAdmin, usuario: UsuarioAdmin) {
    if (usuario.id === ctx.adminId) throw new ErroAdmin(400, 'Você não pode desativar o seu próprio usuário');
    if (usuario.perfil === 'ADMIN') await this.garantirOutroAdmin(ctx.empresaId, usuario.id);
  }

  private async garantirOutroAdmin(empresaId: string, usuarioId: string) {
    if ((await this.repo.contarOutrosAdminsAtivos(empresaId, usuarioId)) === 0) {
      throw new ErroAdmin(400, 'A empresa precisa manter pelo menos um administrador ativo');
    }
  }

  private async validarPerfilBody(empresaId: string, body: Record<string, unknown>, excetoId?: string) {
    const nome = texto(body.nome, 'Nome do perfil', { obrigatorio: true, max: 60 })!;
    if (await this.repo.nomePerfilEmUso(empresaId, nome, excetoId)) {
      throw new ErroAdmin(409, 'Já existe um perfil com esse nome');
    }
    const cor = typeof body.cor === 'string' && CORES_PERFIL.includes(body.cor) ? body.cor : 'slate';
    return {
      nome,
      descricao: texto(body.descricao, 'Descrição', { max: 255 }),
      cor,
      permissoes: normalizarPermissoes(body.permissoes),
    };
  }

  private async auditar(
    ctx: ContextoAdmin,
    acao: string,
    entidade: 'Usuario' | 'PerfilAcesso',
    entidadeId: string,
    antes: unknown,
    depois: unknown
  ) {
    await this.repo.registrarLog({
      usuarioId: ctx.adminId,
      empresaId: ctx.empresaId,
      acao,
      entidade,
      entidadeId,
      dadosAntigos: antes ? JSON.stringify(antes) : null,
      dadosNovos: depois ? JSON.stringify(depois) : null,
      ipOrigem: ctx.ip?.slice(0, 45) ?? null,
    });
  }
}
