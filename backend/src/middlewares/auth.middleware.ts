// backend/src/middlewares/auth.middleware.ts
import { logger } from '../lib/logger.js';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { carregarAcesso } from '../services/acesso.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        empresaId: string;
        perfil?: string;
        permissoes?: Set<string>;
      };
    }
  }
}

// Instância única (evita new AuthService a cada request)
const authService = new AuthService();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        sucesso: false,
        codigo: 'SESSAO_INVALIDA',
        erro: 'Token não fornecido',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        codigo: 'SESSAO_INVALIDA',
        erro: 'Token não fornecido',
      });
    }

    const decoded = await authService.verificarToken(token);

    // Estado atual do banco, não o do token: um usuário desativado, com senha
    // redefinida pelo ADMIN ou com permissões alteradas é afetado na hora.
    const acesso = await carregarAcesso(decoded.id);
    if (!acesso || !acesso.ativo) {
      throw new Error(acesso ? 'Usuário desativado' : 'Usuário não existe mais');
    }
    if ((decoded.sv ?? 0) !== acesso.sessaoVersao) {
      throw new Error('Sessão revogada pelo administrador');
    }

    req.user = {
      id: acesso.id,
      email: decoded.email,
      empresaId: acesso.empresaId,
      perfil: acesso.perfil,
      permissoes: acesso.permissoes,
    };

    next();
  } catch (error) {
    logger.warn('⚠️ Sessão recusada em', req.method, req.originalUrl, '-', error instanceof Error ? error.message : error);
    // codigo SESSAO_INVALIDA: o frontend encerra a sessão e volta ao login.
    return res.status(401).json({
      sucesso: false,
      codigo: 'SESSAO_INVALIDA',
      erro: 'Sua sessão expirou ou é inválida. Faça login novamente.',
    });
  }
}