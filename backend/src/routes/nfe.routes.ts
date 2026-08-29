// C:\emissornfe\backend\src\routes\nfe.routes.ts

import { Router } from 'express';
import { NfeController } from '../controllers/nfe.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

// ============================================================
// RATE LIMITING ESPECÍFICO PARA NF-e
// ============================================================

/**
 * Limite de requisições para emissão de NF-e (evita spam)
 * 10 emissões por minuto
 */
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

/**
 * Limite para consultas (mais generoso)
 * 100 consultas por minuto
 */
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
const controller = new NfeController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS PRINCIPAIS (em ordem de especificidade)
// ============================================================

/**
 * 📋 LISTAR NF-e COM FILTROS
 * GET /api/nfe
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 50)
 * - status: string (ex: AUTORIZADA,CANCELADA)
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 * - destinatarioId: string
 * - numero: number (TNF - 1-999999999)
 * - serie: number (TSerie - 0 ou 1-999)
 * - chave: string (TChNFe - 44 dígitos)
 */
router.get('/', consultarLimiter, controller.listar.bind(controller));

/**
 * 📊 ESTATÍSTICAS DE NF-e
 * GET /api/nfe/estatisticas
 * 
 * Retorna contagem de NF-e por status
 */
router.get('/estatisticas', consultarLimiter, controller.getEstatisticas.bind(controller));

/**
 * 📊 RESUMO MENSAL DE NF-e
 * GET /api/nfe/resumo-mensal
 * 
 * Query params:
 * - ano: number (ex: 2026)
 * - mes: number (1-12)
 */
router.get('/resumo-mensal', consultarLimiter, controller.getResumoMensal.bind(controller));

/**
 * 🔍 BUSCAR NF-e POR PROTOCOLO (TProt - 15 ou 17 dígitos)
 * GET /api/nfe/protocolo/:protocolo
 * 
 * ⚠️ DEVE VIR ANTES DE /:chave PARA NÃO CONFLITAR
 */
router.get('/protocolo/:protocolo', consultarLimiter, controller.buscarPorProtocolo.bind(controller));

/**
 * 🔍 BUSCAR NF-e POR CHAVE DE ACESSO (TChNFe - 44 dígitos)
 * GET /api/nfe/chave/:chave
 */
router.get('/chave/:chave', consultarLimiter, controller.buscarPorChave.bind(controller));

/**
 * 📄 BAIXAR XML DA NF-e
 * GET /api/nfe/xml/:id
 */
router.get('/xml/:id', consultarLimiter, controller.baixarXml.bind(controller));

/**
 * 📄 GERAR DANFE
 * GET /api/nfe/danfe/:id
 */
router.get('/danfe/:id', consultarLimiter, controller.gerarDanfe.bind(controller));

/**
 * 🔍 CONSULTAR SITUAÇÃO NA SEFAZ
 * GET /api/nfe/consultar/:chave
 */
router.get('/consultar/:chave', consultarLimiter, controller.consultarSituacao.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

/**
 * 📝 EMITIR NF-e
 * POST /api/nfe/emitir
 * 
 * Body:
 * - destinatarioId: string
 * - itens: ItemNfe[]
 * - naturezaOperacao: string
 * - formaPagamento: string (01-99)
 * - ... outros campos da NF-e
 */
router.post('/emitir', emitirLimiter, controller.emitir.bind(controller));

/**
 * ❌ CANCELAR NF-e
 * POST /api/nfe/cancelar/:id
 * 
 * Body:
 * - motivo: string (TJust - 15-255 caracteres)
 */
router.post('/cancelar/:id', emitirLimiter, controller.cancelar.bind(controller));

/**
 * 📝 ENVIAR CARTA DE CORREÇÃO (CC-e)
 * POST /api/nfe/carta-correcao
 * 
 * Body:
 * - chaveAcesso: string (TChNFe - 44 dígitos)
 * - cnpjAutor: string (TCnpj - 14 dígitos)
 * - textoCorrecao: string (TJust - 15-255 caracteres)
 */
router.post('/carta-correcao', emitirLimiter, controller.enviarCartaCorrecao.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

/**
 * 🔍 BUSCAR NF-e POR ID
 * GET /api/nfe/:id
 * 
 * ⚠️ DEVE SER A ÚLTIMA ROTA PARA NÃO CONFLITAR COM OUTRAS
 */
router.get('/:id', consultarLimiter, controller.buscarPorId.bind(controller));

export default router;