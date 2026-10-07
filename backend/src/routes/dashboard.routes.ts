// backend/src/routes/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeVerDashboard = exigirPermissao('relatorios.dashboard');

const controller = new DashboardController();

router.use(authMiddleware);
router.get('/', podeVerDashboard, controller.getDashboard.bind(controller));

export default router;