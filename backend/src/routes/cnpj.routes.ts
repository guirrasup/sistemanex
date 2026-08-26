// C:\emissornfe\backend\src\routes\cnpj.routes.ts

import { Router } from 'express';
import { CnpjController } from '../controllers/cnpj.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CnpjController();

router.use(authMiddleware);

router.get('/consultar/:cnpj', controller.consultar.bind(controller));

export default router; // ✅ GARANTA QUE ESTÁ AQUI