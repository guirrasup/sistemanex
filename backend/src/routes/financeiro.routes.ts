// C:\emissornfe\backend\src\routes\financeiro.routes.ts

import { Router } from 'express';
import { FinanceiroController } from '../controllers/financeiro.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new FinanceiroController();

router.use(authMiddleware);

router.get('/titulos', controller.listarTitulos.bind(controller));
router.get('/titulos/pendentes', controller.listarPendentes.bind(controller));
router.post('/titulos/baixar/:id', controller.baixarTitulo.bind(controller));
router.get('/resumo', controller.resumo.bind(controller));

export default router; // ✅ GARANTA QUE ESTÁ AQUI