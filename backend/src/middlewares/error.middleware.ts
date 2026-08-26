// C:\emissornfe\backend\src\middlewares\error.middleware.ts

import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Erro:', err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    sucesso: false,
    erro: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}