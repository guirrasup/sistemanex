// backend/src/routes/mdfe.routes.ts
import { Router } from 'express';
import { MdfeController } from '../controllers/mdfe.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';
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
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeLer = exigirPermissao('mdfe.ver', 'mdfe.emitir');
const podeVerEstatisticas = exigirPermissao('relatorios.estatisticas');
const podeEmitir = exigirPermissao('mdfe.emitir');
const podeCancelar = exigirPermissao('mdfe.cancelar');
const podeBaixarXml = exigirPermissao('mdfe.download');
const podeEncerrar = exigirPermissao('mdfe.encerrar');

const controller = new MdfeController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS DE CONSULTA
// ============================================================

router.get('/', podeLer, consultarLimiter, controller.listar.bind(controller));

router.get('/estatisticas', podeVerEstatisticas, consultarLimiter, controller.getEstatisticas.bind(controller));

router.get('/total-carga', podeVerEstatisticas, consultarLimiter, controller.getTotalCarga.bind(controller));

router.get('/chave/:chave', podeLer, consultarLimiter, controller.buscarPorChave.bind(controller));

router.get('/xml/:id', podeBaixarXml, consultarLimiter, controller.baixarXml.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

router.post('/emitir', podeEmitir, emitirLimiter, controller.emitir.bind(controller));

router.post('/cancelar/:id', podeCancelar, emitirLimiter, controller.cancelar.bind(controller));

router.post('/encerrar/:id', podeEncerrar, emitirLimiter, controller.encerrar.bind(controller));
router.post('/:id/enviar-email', podeBaixarXml, emitirLimiter, controller.enviarXmlPorEmail.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

router.get('/:id', podeLer, consultarLimiter, controller.buscarPorId.bind(controller));

export default router;