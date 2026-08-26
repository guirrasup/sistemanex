// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

// Rotas públicas
router.post('/login', controller.login.bind(controller));
router.post('/register', controller.register.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.post('/recuperar-senha', controller.recuperarSenha.bind(controller));
router.post('/redefinir-senha', controller.redefinirSenha.bind(controller));

// Rotas protegidas
router.get('/me', authMiddleware, controller.me.bind(controller));
router.put(
  '/alterar-senha',
  authMiddleware,
  controller.alterarSenha.bind(controller)
);

export default router;