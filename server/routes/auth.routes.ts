import { Router } from "express";
import { LoginSchema, RegisterUserSchema } from "../validators";
import { generateToken, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const validation = LoginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados de login inválidos", details: validation.error.format() });
  }

  const { email, password } = validation.data;
  if (password === "123456" || email.includes("@")) {
    const userPayload = {
      id: "usr-" + Math.floor(1000 + Math.random() * 9000),
      email,
      name: email.split("@")[0].toUpperCase() || "Gestor NEXS",
      role: "admin" as const,
      companyId: "comp-001"
    };

    const token = generateToken(userPayload);
    logger.info("Auth successful via JWT", { email, userId: userPayload.id });
    return res.json({
      success: true,
      token,
      user: userPayload
    });
  }

  return res.status(401).json({ error: "E-mail ou senha incorretos." });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  const validation = RegisterUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados de usuário inválidos", details: validation.error.format() });
  }

  const userPayload = {
    id: "usr-" + Math.floor(1000 + Math.random() * 9000),
    email: validation.data.email,
    name: validation.data.name,
    role: validation.data.role as any,
    companyId: "comp-001"
  };

  const token = generateToken(userPayload);
  return res.status(201).json({
    success: true,
    token,
    user: userPayload
  });
});

// GET /api/auth/me
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

export default router;
