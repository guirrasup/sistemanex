// C:\emissornfe\backend\src\routes\nfce.routes.ts

import { Router } from 'express';
import { NfceController } from '../controllers/nfce.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new NfceController();

router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.post('/emitir', controller.emitir.bind(controller));
router.post('/cancelar/:id', controller.cancelar.bind(controller));

export default router;