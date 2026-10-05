// backend/src/routes/empresa.routes.ts
import { Router } from 'express';
import { EmpresaController } from '../controllers/empresa.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new EmpresaController();

router.use(authMiddleware);

router.get('/me', controller.me.bind(controller));
router.put('/me', controller.atualizar.bind(controller));

export default router;
