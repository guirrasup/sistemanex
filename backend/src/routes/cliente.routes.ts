// backend/src/routes/cliente.routes.ts
import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeCriar = exigirPermissao('clientes.criar', 'fornecedores.criar');
const podeEditar = exigirPermissao('clientes.editar', 'fornecedores.editar');
const podeExcluir = exigirPermissao('clientes.excluir', 'fornecedores.excluir');
const podeLer = exigirPermissao('clientes.ver', 'fornecedores.ver', 'nfe.emitir', 'nfse.emitir', 'nfce.emitir', 'cte.emitir', 'nfae.emitir', 'mdfe.emitir');

const controller = new ClienteController();

router.use(authMiddleware);

router.get('/', podeLer, controller.listar.bind(controller));
router.get('/documento/:documento', podeLer, controller.buscarPorDocumento.bind(controller));
router.get('/tipo/:tipo', podeLer, controller.buscarPorTipo.bind(controller));
router.get('/:id', podeLer, controller.buscarPorId.bind(controller));
router.post('/', podeCriar, controller.criar.bind(controller));
router.put('/:id', podeEditar, controller.atualizar.bind(controller));
router.delete('/:id', podeExcluir, controller.excluir.bind(controller));

export default router;