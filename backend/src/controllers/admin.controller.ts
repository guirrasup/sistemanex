// backend/src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import { logger } from '../lib/logger.js';
import { AdminService, ErroAdmin, ContextoAdmin } from '../services/admin.service.js';

function contexto(req: Request): ContextoAdmin {
  return { adminId: req.user!.id, empresaId: req.user!.empresaId, ip: req.ip };
}

/** Envolve o handler: ErroAdmin vira resposta com o status dele; o resto vira 500. */
function handler(acao: string, fn: (req: Request, res: Response) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: unknown) {
      if (error instanceof ErroAdmin) {
        return res.status(error.status).json({ sucesso: false, erro: error.message });
      }
      logger.error(`❌ Erro ao ${acao}:`, error);
      return res.status(500).json({ sucesso: false, erro: `Erro interno ao ${acao}` });
    }
  };
}

export class AdminController {
  private service = new AdminService();

  catalogo = handler('carregar o catálogo de permissões', async (_req, res) => {
    res.json({ sucesso: true, dados: this.service.catalogo() });
  });

  // ── Usuários ──────────────────────────────────────────────

  listarUsuarios = handler('listar usuários', async (req, res) => {
    res.json({ sucesso: true, dados: await this.service.listarUsuarios(req.user!.empresaId) });
  });

  obterUsuario = handler('buscar usuário', async (req, res) => {
    res.json({ sucesso: true, dados: await this.service.obterUsuario(req.user!.empresaId, req.params.id) });
  });

  criarUsuario = handler('criar usuário', async (req, res) => {
    res.status(201).json({ sucesso: true, dados: await this.service.criarUsuario(contexto(req), req.body ?? {}) });
  });

  atualizarUsuario = handler('atualizar usuário', async (req, res) => {
    res.json({ sucesso: true, dados: await this.service.atualizarUsuario(contexto(req), req.params.id, req.body ?? {}) });
  });

  alterarStatus = handler('alterar status do usuário', async (req, res) => {
    if (typeof req.body?.ativo !== 'boolean') {
      return res.status(400).json({ sucesso: false, erro: 'Informe "ativo" como true ou false' });
    }
    res.json({ sucesso: true, dados: await this.service.alterarStatus(contexto(req), req.params.id, req.body.ativo) });
  });

  redefinirSenha = handler('redefinir senha', async (req, res) => {
    await this.service.redefinirSenha(contexto(req), req.params.id, req.body?.novaSenha);
    res.json({ sucesso: true, mensagem: 'Senha redefinida. As sessões abertas do usuário foram encerradas.' });
  });

  encerrarSessoes = handler('encerrar sessões', async (req, res) => {
    await this.service.encerrarSessoes(contexto(req), req.params.id);
    res.json({ sucesso: true, mensagem: 'Sessões encerradas. O usuário precisará fazer login novamente.' });
  });

  excluirUsuario = handler('excluir usuário', async (req, res) => {
    await this.service.excluirUsuario(contexto(req), req.params.id);
    res.json({ sucesso: true, mensagem: 'Usuário excluído' });
  });

  // ── Perfis de acesso ──────────────────────────────────────

  listarPerfis = handler('listar perfis de acesso', async (req, res) => {
    res.json({ sucesso: true, dados: await this.service.listarPerfis(req.user!.empresaId) });
  });

  criarPerfil = handler('criar perfil de acesso', async (req, res) => {
    res.status(201).json({ sucesso: true, dados: await this.service.criarPerfil(contexto(req), req.body ?? {}) });
  });

  atualizarPerfil = handler('atualizar perfil de acesso', async (req, res) => {
    res.json({ sucesso: true, dados: await this.service.atualizarPerfil(contexto(req), req.params.id, req.body ?? {}) });
  });

  excluirPerfil = handler('excluir perfil de acesso', async (req, res) => {
    await this.service.excluirPerfil(contexto(req), req.params.id);
    res.json({ sucesso: true, mensagem: 'Perfil excluído' });
  });

  // ── Auditoria ─────────────────────────────────────────────

  auditoria = handler('listar auditoria', async (req, res) => {
    const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
    const limit = parseInt(String(req.query.limit ?? '30'), 10) || 30;
    res.json({ sucesso: true, dados: await this.service.listarAuditoria(req.user!.empresaId, page, limit) });
  });
}
