// backend/src/routes/cfop.routes.ts
import { Router } from 'express';
import { CfopController } from '../controllers/cfop.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CfopController();

router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));

export default router;
