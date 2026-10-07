// backend/src/routes/servico.routes.ts
import { Router } from 'express';
import { ServicoController } from '../controllers/servico.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeCriar = exigirPermissao('servicos.criar');
const podeEditar = exigirPermissao('servicos.editar');
const podeExcluir = exigirPermissao('servicos.excluir');
const podeLer = exigirPermissao('servicos.ver', 'nfse.emitir');

const controller = new ServicoController();

router.use(authMiddleware);

router.get('/', podeLer, controller.listar.bind(controller));
router.get('/:id', podeLer, controller.buscarPorId.bind(controller));
router.post('/', podeCriar, controller.criar.bind(controller));
router.put('/:id', podeEditar, controller.atualizar.bind(controller));
router.delete('/:id', podeExcluir, controller.excluir.bind(controller));

export default router;