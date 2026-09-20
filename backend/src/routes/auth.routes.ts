// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

// Rotas públicas
router.post('/login', controller.login.bind(controller));

// Segurança (P4): registro de usuários exige sessão ADMIN — não é rota pública.
router.post('/register', authMiddleware, controller.register.bind(controller));

router.post('/recuperar-senha', controller.recuperarSenha.bind(controller));
router.post('/redefinir-senha', controller.redefinirSenha.bind(controller));

// Rotas protegidas (exigem sessão válida)
router.post('/logout', authMiddleware, controller.logout.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));
router.put('/alterar-senha', authMiddleware, controller.alterarSenha.bind(controller));

export default router;