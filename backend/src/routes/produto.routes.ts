// C:\emissornfe\backend\src\routes\produto.routes.ts

import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ProdutoController();

// 🔥 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.get('/estoque-critico', controller.buscarEstoqueCritico.bind(controller));
router.get('/:id', controller.buscarPorId.bind(controller));
router.post('/', controller.criar.bind(controller));
router.put('/:id', controller.atualizar.bind(controller));
router.delete('/:id', controller.excluir.bind(controller));

export default router;