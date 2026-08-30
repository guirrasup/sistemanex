import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ProdutoController();

router.use(authMiddleware);

// 🔥 ORDEM CORRETA: rotas específicas ANTES de rotas com parâmetros
router.get('/estoque-critico', controller.buscarEstoqueCritico);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export default router;