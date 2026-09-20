// backend/src/routes/mdfe.routes.ts
import { Router } from 'express';
import { MdfeController } from '../controllers/mdfe.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rateLimit } from 'express-rate-limit';

// ============================================================
// RATE LIMITING
// ============================================================

const emitirLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 emissões por minuto
  message: {
    sucesso: false,
    erro: 'Limite de emissão de MDF-e excedido. Aguarde um momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const consultarLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    sucesso: false,
    erro: 'Limite de consultas excedido. Aguarde um momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// ROTAS
// ============================================================

const router = Router();
const controller = new MdfeController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS DE CONSULTA
// ============================================================

router.get('/', consultarLimiter, controller.listar.bind(controller));

router.get('/estatisticas', consultarLimiter, controller.getEstatisticas.bind(controller));

router.get('/total-carga', consultarLimiter, controller.getTotalCarga.bind(controller));

router.get('/chave/:chave', consultarLimiter, controller.buscarPorChave.bind(controller));

router.get('/xml/:id', consultarLimiter, controller.baixarXml.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

router.post('/emitir', emitirLimiter, controller.emitir.bind(controller));

router.post('/cancelar/:id', emitirLimiter, controller.cancelar.bind(controller));

router.post('/encerrar/:id', emitirLimiter, controller.encerrar.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

router.get('/:id', consultarLimiter, controller.buscarPorId.bind(controller));

export default router;