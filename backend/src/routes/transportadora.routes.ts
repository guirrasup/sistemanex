// backend/src/routes/transportadora.routes.ts

import { Router } from 'express';
import { TransportadoraController } from '../controllers/transportadora.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TransportadoraController();

// 🔥 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

router.get('/', controller.listar.bind(controller));
router.get('/ativos', controller.buscarAtivos.bind(controller));
router.get('/tipo/:tipo', controller.buscarPorTipo.bind(controller));
router.get('/cnpj/:cnpj', controller.buscarPorCnpj.bind(controller));
router.get('/:id', controller.buscarPorId.bind(controller));
router.post('/', controller.criar.bind(controller));
router.put('/:id', controller.atualizar.bind(controller));
router.delete('/:id', controller.excluir.bind(controller));

export default router;