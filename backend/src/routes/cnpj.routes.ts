// C:\emissornfe\backend\src\routes\cnpj.routes.ts

import { Router } from 'express';
import { CnpjController } from '../controllers/cnpj.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CnpjController();

// 🔥 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// Rota principal com suporte a datasets
router.get('/consultar/:cnpj', controller.consultar.bind(controller));

// Rota completa com todos os datasets
router.get('/consultar-completo/:cnpj', controller.consultarCompleto.bind(controller));

export default router;