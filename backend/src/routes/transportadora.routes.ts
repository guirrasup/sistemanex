// backend/src/routes/transportadora.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';
import { TransportadoraController } from '../controllers/transportadora.controller.js';

// 🔥 PRIMEIRO CRIA O ROUTER
const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeCriar = exigirPermissao('transportadoras.criar');
const podeEditar = exigirPermissao('transportadoras.editar');
const podeExcluir = exigirPermissao('transportadoras.excluir');
const podeLer = exigirPermissao('transportadoras.ver', 'nfe.emitir', 'cte.emitir', 'mdfe.emitir');


// 🔥 DEPOIS INSTANCIA O CONTROLLER
const transportadoraController = new TransportadoraController();

// 🔥 AGORA USA O ROUTER
router.get('/', authMiddleware, podeLer, transportadoraController.listar.bind(transportadoraController));
router.get('/:id', authMiddleware, podeLer, transportadoraController.buscarPorId.bind(transportadoraController));
router.post('/', authMiddleware, podeCriar, transportadoraController.criar.bind(transportadoraController));
router.put('/:id', authMiddleware, podeEditar, transportadoraController.atualizar.bind(transportadoraController));
router.delete('/:id', authMiddleware, podeExcluir, transportadoraController.excluir.bind(transportadoraController));

export default router;