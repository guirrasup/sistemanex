// backend/src/middlewares/permissao.middleware.ts
// Usados SEMPRE depois do authMiddleware (que preenche req.user.permissoes).
import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { isPermissaoValida } from '../config/permissoes.js';

/**
 * Libera a rota se o usuário tiver PELO MENOS UMA das permissões informadas.
 * Ex.: exigirPermissao('nfe.ver', 'nfe.emitir') — quem só emite também
 * precisa ler a NF-e recém-emitida.
 */
export function exigirPermissao(...chaves: string[]) {
  const invalidas = chaves.filter((c) => !isPermissaoValida(c));
  if (invalidas.length > 0) {
    // Erro de programação: falha ao subir a API, não em produção no meio de um request.
    throw new Error(`Permissão(ões) inexistente(s) no catálogo: ${invalidas.join(', ')}`);
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const permissoes = req.user?.permissoes;
    if (permissoes && chaves.some((c) => permissoes.has(c))) {
      return next();
    }

    logger.warn(`🚫 Acesso negado: usuário ${req.user?.id} sem [${chaves.join(' | ')}] em ${req.method} ${req.originalUrl}`);
    return res.status(403).json({
      sucesso: false,
      codigo: 'SEM_PERMISSAO',
      erro: 'Você não tem permissão para realizar esta ação. Fale com o administrador.',
    });
  };
}

/** Área de administração: exclusiva do nível ADMIN (não é delegável por permissão). */
export function exigirAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.perfil === 'ADMIN') {
    return next();
  }

  logger.warn(`🚫 Acesso à administração negado: usuário ${req.user?.id} em ${req.method} ${req.originalUrl}`);
  return res.status(403).json({
    sucesso: false,
    codigo: 'SEM_PERMISSAO',
    erro: 'Área restrita ao administrador.',
  });
}
