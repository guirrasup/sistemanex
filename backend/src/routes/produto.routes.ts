// backend/src/routes/produto.routes.ts
import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeCriar = exigirPermissao('produtos.criar');
const podeEditar = exigirPermissao('produtos.editar');
const podeExcluir = exigirPermissao('produtos.excluir');
const podeLer = exigirPermissao('produtos.ver', 'nfe.emitir', 'nfce.emitir', 'nfae.emitir');

const controller = new ProdutoController();

router.use(authMiddleware);

// 🔥 ORDEM CORRETA: rotas específicas ANTES de rotas com parâmetros
router.get('/estoque-critico', podeLer, controller.buscarEstoqueCritico);
router.get('/', podeLer, controller.listar);
router.get('/:id', podeLer, controller.buscarPorId);
router.post('/', podeCriar, controller.criar);
router.put('/:id', podeEditar, controller.atualizar);
router.delete('/:id', podeExcluir, controller.excluir);

export default router;