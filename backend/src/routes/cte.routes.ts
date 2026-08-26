// C:\emissornfe\backend\src\routes\cte.routes.ts

import { Router } from 'express';
import { CteController } from '../controllers/cte.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CteController();

// 🔥 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.post('/emitir', controller.emitir.bind(controller));
router.post('/cancelar/:id', controller.cancelar.bind(controller));

export default router;