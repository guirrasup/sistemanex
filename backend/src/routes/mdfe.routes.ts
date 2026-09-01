// src/routes/mdfe.routes.ts

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

/**
 * 📋 LISTAR MDF-e COM FILTROS
 * GET /api/mdfe
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 50)
 * - status: string (ex: AUTORIZADA,CANCELADA)
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 * - modal: string
 * - numero: number
 * - serie: number
 * - chave: string (44 dígitos)
 */
router.get('/', consultarLimiter, controller.listar.bind(controller));

/**
 * 📊 ESTATÍSTICAS DE MDF-e
 * GET /api/mdfe/estatisticas
 */
router.get('/estatisticas', consultarLimiter, controller.getEstatisticas.bind(controller));

/**
 * 💰 TOTAL DE CARGA TRANSPORTADA
 * GET /api/mdfe/total-carga
 */
router.get('/total-carga', consultarLimiter, controller.getTotalCarga.bind(controller));

/**
 * 🔍 BUSCAR MDF-e POR CHAVE
 * GET /api/mdfe/chave/:chave
 */
router.get('/chave/:chave', consultarLimiter, controller.buscarPorChave.bind(controller));

/**
 * 📄 BAIXAR XML DO MDF-e
 * GET /api/mdfe/xml/:id
 */
router.get('/xml/:id', consultarLimiter, controller.baixarXml.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

/**
 * 📝 EMITIR MDF-e
 * POST /api/mdfe/emitir
 */
router.post('/emitir', emitirLimiter, controller.emitir.bind(controller));

/**
 * ❌ CANCELAR MDF-e
 * POST /api/mdfe/cancelar/:id
 */
router.post('/cancelar/:id', emitirLimiter, controller.cancelar.bind(controller));

/**
 * 🚩 ENCERRAR MDF-e
 * POST /api/mdfe/encerrar/:id
 */
router.post('/encerrar/:id', emitirLimiter, controller.encerrar.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

/**
 * 🔍 BUSCAR MDF-e POR ID
 * GET /api/mdfe/:id
 */
router.get('/:id', consultarLimiter, controller.buscarPorId.bind(controller));

export default router;