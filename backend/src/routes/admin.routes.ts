// backend/src/routes/admin.routes.ts
// Área de administração: usuários, perfis de acesso e auditoria.
// Exclusiva do nível ADMIN — verificado no banco a cada request (authMiddleware),
// não apenas pelo que veio no token.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirAdmin } from '../middlewares/permissao.middleware.js';

const router = Router();
const controller = new AdminController();

// Operações sensíveis (senha/sessões): limite próprio contra abuso de uma sessão roubada.
const sensivelLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { sucesso: false, erro: 'Muitas operações sensíveis em pouco tempo. Aguarde alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware, exigirAdmin);

router.get('/permissoes', controller.catalogo);

router.get('/usuarios', controller.listarUsuarios);
router.get('/usuarios/:id', controller.obterUsuario);
router.post('/usuarios', controller.criarUsuario);
router.put('/usuarios/:id', controller.atualizarUsuario);
router.patch('/usuarios/:id/status', controller.alterarStatus);
router.put('/usuarios/:id/senha', sensivelLimiter, controller.redefinirSenha);
router.post('/usuarios/:id/encerrar-sessoes', sensivelLimiter, controller.encerrarSessoes);
router.delete('/usuarios/:id', controller.excluirUsuario);

router.get('/perfis', controller.listarPerfis);
router.post('/perfis', controller.criarPerfil);
router.put('/perfis/:id', controller.atualizarPerfil);
router.delete('/perfis/:id', controller.excluirPerfil);

router.get('/auditoria', controller.auditoria);

export default router;
