// backend/src/routes/empresa.routes.ts
import { Router } from 'express';
import { EmpresaController } from '../controllers/empresa.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeEditar = exigirPermissao('empresa.editar');

const controller = new EmpresaController();

router.use(authMiddleware);

router.get('/me', controller.me.bind(controller));
router.put('/me', podeEditar, controller.atualizar.bind(controller));

export default router;
