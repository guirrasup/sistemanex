import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function rateLimiter(maxRequests: number = 100, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] as string || "127.0.0.1";
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = { count: 1, resetTime: now + windowMs };
    } else if (now > store[ip].resetTime) {
      store[ip] = { count: 1, resetTime: now + windowMs };
    } else {
      store[ip].count += 1;
    }

    if (store[ip].count > maxRequests) {
      return res.status(429).json({
        error: "Muitas requisições. Limite de segurança excedido. Tente novamente em instantes.",
        retryAfterSeconds: Math.ceil((store[ip].resetTime - now) / 1000)
      });
    }

    next();
  };
}
