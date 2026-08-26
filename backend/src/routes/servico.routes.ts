// C:\emissornfe\backend\src\routes\servico.routes.ts

import { Router } from 'express';
import { ServicoController } from '../controllers/servico.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ServicoController();

router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.get('/:id', controller.buscarPorId.bind(controller));
router.post('/', controller.criar.bind(controller));
router.put('/:id', controller.atualizar.bind(controller));
router.delete('/:id', controller.excluir.bind(controller));

export default router;