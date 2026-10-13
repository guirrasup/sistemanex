// backend/src/routes/ocorrencia.routes.ts
// Ocorrências do programa beta: qualquer usuário logado abre; só o ADMIN lista e trata.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { OcorrenciaController } from '../controllers/ocorrencia.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirAdmin } from '../middlewares/permissao.middleware.js';

const router = Router();
const controller = new OcorrenciaController();

// Evita enxurrada de tickets (e de capturas de tela) a partir de uma sessão.
const abrirLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { sucesso: false, erro: 'Muitas ocorrências em pouco tempo. Aguarde alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware);

router.post('/', abrirLimiter, controller.criar);
router.get('/', exigirAdmin, controller.listar);
router.get('/:id', exigirAdmin, controller.obter);
router.patch('/:id/status', exigirAdmin, controller.alterarStatus);

export default router;
