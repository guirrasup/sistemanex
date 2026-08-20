import { Router } from "express";
import bcrypt from "bcryptjs";
import { LoginSchema, RegisterUserSchema } from "../validators";
import { generateToken, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { getPrismaClient } from "../config/database";
import { logger } from "../logger";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const validation = LoginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados de login inválidos", details: validation.error.format() });
  }

  const { email, password } = validation.data;

  try {
    const prisma = getPrismaClient();
    if (!prisma) {
      logger.error("Prisma client indisponível durante tentativa de login");
      return res.status(503).json({ error: "Serviço de autenticação indisponível. Tente novamente em instantes." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      // Mesma mensagem genérica tanto para e-mail inexistente quanto senha errada,
      // pra não dar dica de quais e-mails existem no sistema.
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      logger.warn("Tentativa de login com senha incorreta", { email });
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "financial_manager" | "operator" | "auditor",
      companyId: user.companyId
    };

    const token = generateToken(userPayload);
    logger.info("Auth successful via JWT", { email, userId: user.id });
    return res.json({
      success: true,
      token,
      user: userPayload
    });
  } catch (err: any) {
    logger.error("Erro ao autenticar usuário", { error: err.message });
    return res.status(500).json({ error: "Erro interno ao tentar autenticar." });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const validation = RegisterUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados de usuário inválidos", details: validation.error.format() });
  }

  try {
    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(503).json({ error: "Serviço indisponível. Tente novamente em instantes." });
    }

    const existing = await prisma.user.findUnique({ where: { email: validation.data.email } });
    if (existing) {
      return res.status(409).json({ error: "Já existe um usuário cadastrado com esse e-mail." });
    }

    // Enquanto o sistema for single-tenant, novos usuários entram na primeira empresa cadastrada
    // (criada pelo "npm run db:seed"). Ajuste aqui quando o cadastro de múltiplas empresas existir.
    const company = await prisma.company.findFirst();
    if (!company) {
      return res.status(400).json({
        error: "Nenhuma empresa cadastrada ainda. Rode o seed inicial (npm run db:seed) antes de criar usuários."
      });
    }

    const passwordHash = await bcrypt.hash(validation.data.password, 12);

    const user = await prisma.user.create({
      data: {
        companyId: company.id,
        name: validation.data.name,
        email: validation.data.email,
        passwordHash,
        role: validation.data.role
      }
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "financial_manager" | "operator" | "auditor",
      companyId: user.companyId
    };

    const token = generateToken(userPayload);
    logger.info("Novo usuário registrado", { email: user.email, userId: user.id });
    return res.status(201).json({
      success: true,
      token,
      user: userPayload
    });
  } catch (err: any) {
    logger.error("Erro ao registrar usuário", { error: err.message });
    return res.status(500).json({ error: "Erro interno ao registrar usuário." });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

export default router;
