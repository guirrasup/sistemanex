// backend/src/routes/nfse.routes.ts
import { Router } from 'express';
import { NfseController } from '../controllers/nfse.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

// ============================================================
// RATE LIMITING ESPECÍFICO PARA NFS-e
// ============================================================

const emitirLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisições
  message: {
    sucesso: false,
    erro: 'Limite de emissão de NFS-e excedido. Aguarde um momento e tente novamente.'
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
const controller = new NfseController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS DE CONSULTA
// ============================================================

router.get('/', consultarLimiter, controller.listar.bind(controller));

router.get('/estatisticas', consultarLimiter, controller.getEstatisticas.bind(controller));

router.get('/total-faturado', consultarLimiter, controller.getTotalFaturado.bind(controller));

router.get('/resumo-mensal', consultarLimiter, controller.getResumoMensal.bind(controller));

router.get('/servicos-mais-prestados', consultarLimiter, controller.getServicosMaisPrestados.bind(controller));

router.get('/tomador/:tomadorId', consultarLimiter, controller.findByTomador.bind(controller));

router.get('/servico/:servicoId', consultarLimiter, controller.findByServico.bind(controller));

router.get('/protocolo/:protocolo', consultarLimiter, controller.buscarPorProtocolo.bind(controller));

router.get('/chave/:chave', consultarLimiter, controller.buscarPorChave.bind(controller));

router.get('/xml/:id', consultarLimiter, controller.baixarXml.bind(controller));

router.get('/danfse/:id', consultarLimiter, controller.gerarDanfse.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

router.post('/emitir', emitirLimiter, controller.emitir.bind(controller));

router.post('/cancelar/:id', emitirLimiter, controller.cancelar.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

router.get('/:id', consultarLimiter, controller.buscarPorId.bind(controller));

export default router;