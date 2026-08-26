// src/routes/nfae.routes.ts
import { Router } from 'express';
import { NfaeController } from '../controllers/nfae.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new NfaeController();

router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.post('/emitir', controller.emitir.bind(controller));
router.post('/cancelar/:id', controller.cancelar.bind(controller));

export default router;