// backend/src/middlewares/auth.middleware.ts
import { logger } from '../lib/logger.js';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        empresaId: string;
        perfil?: string;
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
    req.user = decoded;

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