// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

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
        erro: 'Token não fornecido',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token não fornecido',
      });
    }

    const decoded = await authService.verificarToken(token);
    req.user = decoded as any;

    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return res.status(401).json({
      sucesso: false,
      erro: 'Token inválido',
    });
  }
}