import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../logger";

const JWT_SECRET = process.env.JWT_SECRET || "nex-erp-secure-jwt-secret-key-2026";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "financial_manager" | "operator" | "auditor";
  companyId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Generate JWT token
export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

// JWT Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    // Antes, quando não havia token nenhum, um usuário admin fictício era anexado
    // automaticamente aqui — ou seja, qualquer requisição sem login virava admin.
    // Isso foi removido: sem token válido, o acesso é negado.
    return res.status(401).json({ error: "Não autenticado. Faça login para continuar." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      companyId: decoded.companyId
    };
    next();
  } catch (err: any) {
    logger.warn("Invalid JWT token attempt", { error: err.message });
    return res.status(401).json({ error: "Sessão inválida ou token expirado. Por favor faça login novamente." });
  }
}

// RBAC Middleware
export function requireRole(allowedRoles: Array<"admin" | "financial_manager" | "operator" | "auditor">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Unauthorized RBAC access attempt", { user: req.user.email, role: req.user.role, required: allowedRoles });
      return res.status(403).json({ error: "Acesso negado. Permissão insuficiente para esta operação." });
    }

    next();
  };
}
