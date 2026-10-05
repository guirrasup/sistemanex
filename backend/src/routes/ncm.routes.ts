// backend/src/routes/ncm.routes.ts
import { Router } from 'express';
import { NcmController } from '../controllers/ncm.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new NcmController();

router.use(authMiddleware);

router.get('/', controller.buscar.bind(controller));

export default router;
