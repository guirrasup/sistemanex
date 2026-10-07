// backend/src/routes/nfe.routes.ts
import { Router } from 'express';
import { NfeController } from '../controllers/nfe.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';
import { rateLimit } from 'express-rate-limit';

// ============================================================
// RATE LIMITING ESPECÍFICO PARA NF-e
// ============================================================

const emitirLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisições
  message: {
    sucesso: false,
    erro: 'Limite de emissão de NF-e excedido. Aguarde um momento e tente novamente.'
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
const podeLer = exigirPermissao('nfe.ver', 'nfe.emitir');
const podeVerEstatisticas = exigirPermissao('relatorios.estatisticas');
const podeEmitir = exigirPermissao('nfe.emitir');
const podeCancelar = exigirPermissao('nfe.cancelar');
const podeBaixarXml = exigirPermissao('nfe.download');
const podeCartaCorrecao = exigirPermissao('nfe.cartaCorrecao');
const podeInutilizar = exigirPermissao('nfe.inutilizar');

const controller = new NfeController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS PRINCIPAIS (em ordem de especificidade)
// ============================================================

router.get('/', podeLer, consultarLimiter, controller.listar.bind(controller));

router.get('/estatisticas', podeVerEstatisticas, consultarLimiter, controller.getEstatisticas.bind(controller));

router.get('/resumo-mensal', podeVerEstatisticas, consultarLimiter, controller.getResumoMensal.bind(controller));

router.get('/protocolo/:protocolo', podeLer, consultarLimiter, controller.buscarPorProtocolo.bind(controller));

router.get('/chave/:chave', podeLer, consultarLimiter, controller.buscarPorChave.bind(controller));

router.get('/xml/:id', podeBaixarXml, consultarLimiter, controller.baixarXml.bind(controller));

router.get('/danfe/:id', podeLer, consultarLimiter, controller.gerarDanfe.bind(controller));

router.get('/consultar/:chave', podeLer, consultarLimiter, controller.consultarSituacao.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

router.post('/emitir', podeEmitir, emitirLimiter, controller.emitir.bind(controller));

router.post('/cancelar/:id', podeCancelar, emitirLimiter, controller.cancelar.bind(controller));

router.post('/carta-correcao', podeCartaCorrecao, emitirLimiter, controller.enviarCartaCorrecao.bind(controller));

router.post('/inutilizar', podeInutilizar, emitirLimiter, controller.inutilizar.bind(controller));
router.post('/:id/enviar-email', podeBaixarXml, emitirLimiter, controller.enviarXmlPorEmail.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

router.get('/:id', podeLer, consultarLimiter, controller.buscarPorId.bind(controller));

export default router;