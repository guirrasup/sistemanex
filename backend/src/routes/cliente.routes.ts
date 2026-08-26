// C:\emissornfe\backend\src\routes\cliente.routes.ts

import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ClienteController();

router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.get('/documento/:documento', controller.buscarPorDocumento.bind(controller));
router.get('/tipo/:tipo', controller.buscarPorTipo.bind(controller));
router.get('/:id', controller.buscarPorId.bind(controller));
router.post('/', controller.criar.bind(controller));
router.put('/:id', controller.atualizar.bind(controller));
router.delete('/:id', controller.excluir.bind(controller));

export default router;