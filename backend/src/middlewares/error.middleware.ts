// backend/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface ErroHttp {
  status?: number;
  message?: string;
  stack?: string;
}

function isErroHttp(value: unknown): value is ErroHttp {
  return typeof value === 'object' && value !== null;
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Erro:', err);

  const erro: ErroHttp = isErroHttp(err) ? err : {};
  const status = erro.status || 500;

  // Segurança (P5): em produção, erros 5xx não vazam mensagens internas
  // (detalhes de Prisma/Node/stack). Erros de negócio (4xx) preservam a mensagem.
  const isOperational = status < 500;
  const message =
    isOperational
      ? erro.message || 'Erro interno do servidor'
      : process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : erro.message || 'Erro interno do servidor';

  res.status(status).json({
    sucesso: false,
    erro: message,
    ...(process.env.NODE_ENV === 'development' && { stack: erro.stack })
  });
}