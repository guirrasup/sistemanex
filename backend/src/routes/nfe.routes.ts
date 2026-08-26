// C:\emissornfe\backend\src\routes\nfe.routes.ts

import { Router } from 'express';
import { NfeController } from '../controllers/nfe.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new NfeController();

router.use(authMiddleware);

router.post('/emitir', controller.emitir.bind(controller));
router.post('/cancelar/:id', controller.cancelar.bind(controller));
router.get('/', controller.listar.bind(controller));
router.get('/:chave', controller.buscarPorChave.bind(controller));

export default router; // ✅ GARANTA QUE ESTÁ AQUI