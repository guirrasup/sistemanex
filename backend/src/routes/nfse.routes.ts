// C:\emissornfe\backend\src\routes\nfse.routes.ts

import { Router } from 'express';
import { NfseController } from '../controllers/nfse.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new NfseController();

router.use(authMiddleware);

router.post('/emitir', controller.emitir.bind(controller));
router.post('/cancelar/:id', controller.cancelar.bind(controller));
router.get('/', controller.listar.bind(controller));
router.get('/:chave', controller.buscarPorChave.bind(controller));

export default router; // ✅ GARANTA QUE ESTÁ AQUI