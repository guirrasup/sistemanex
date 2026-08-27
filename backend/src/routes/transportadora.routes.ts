// C:\emissornfe\backend\src\routes\transportadora.routes.ts


import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { TransportadoraController } from '../controllers/transportadora.controller';

// 🔥 PRIMEIRO CRIA O ROUTER
const router = Router();

// 🔥 DEPOIS INSTANCIA O CONTROLLER
const transportadoraController = new TransportadoraController();

// 🔥 AGORA USA O ROUTER
router.get('/', authMiddleware, transportadoraController.listar.bind(transportadoraController));
router.get('/:id', authMiddleware, transportadoraController.buscarPorId.bind(transportadoraController));
router.post('/', authMiddleware, transportadoraController.criar.bind(transportadoraController));
router.put('/:id', authMiddleware, transportadoraController.atualizar.bind(transportadoraController));
router.delete('/:id', authMiddleware, transportadoraController.excluir.bind(transportadoraController));

export default router;