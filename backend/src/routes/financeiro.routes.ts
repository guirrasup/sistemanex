// backend/src/routes/financeiro.routes.ts
import { Router } from 'express';
import { FinanceiroController } from '../controllers/financeiro.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeVer = exigirPermissao('financeiro.ver');
const podeBaixarTitulo = exigirPermissao('financeiro.baixar');
const podeVerResumo = exigirPermissao('relatorios.financeiro');

const controller = new FinanceiroController();

router.use(authMiddleware);

router.get('/titulos', podeVer, controller.listarTitulos.bind(controller));
router.get('/titulos/pendentes', podeVer, controller.listarPendentes.bind(controller));
router.post('/titulos/baixar/:id', podeBaixarTitulo, controller.baixarTitulo.bind(controller));
router.get('/resumo', podeVerResumo, controller.resumo.bind(controller));

export default router; // ✅ GARANTA QUE ESTÁ AQUI