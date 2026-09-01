// C:\emissornfe\backend\src\routes\nfse.routes.ts

import { Router } from 'express';
import { NfseController } from '../controllers/nfse.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

// ============================================================
// RATE LIMITING ESPECÍFICO PARA NFS-e
// ============================================================

/**
 * Limite de requisições para emissão de NFS-e (evita spam)
 * 10 emissões por minuto
 */
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
const controller = new NfseController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS DE CONSULTA
// ============================================================

/**
 * 📋 LISTAR NFS-e COM FILTROS
 * GET /api/nfse
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 50)
 * - status: string (ex: AUTORIZADA,CANCELADA)
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 * - tomadorId: string
 * - numeroNfse: number
 * - serieDPS: number
 * - chave: string (TChNFSe - 53 dígitos)
 */
router.get('/', consultarLimiter, controller.listar.bind(controller));

/**
 * 📊 ESTATÍSTICAS DE NFS-e
 * GET /api/nfse/estatisticas
 * 
 * Retorna contagem de NFS-e por status
 */
router.get('/estatisticas', consultarLimiter, controller.getEstatisticas.bind(controller));

/**
 * 💰 TOTAL FATURADO POR PERÍODO
 * GET /api/nfse/total-faturado
 * 
 * Query params:
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 */
router.get('/total-faturado', consultarLimiter, controller.getTotalFaturado.bind(controller));

/**
 * 📊 RESUMO MENSAL
 * GET /api/nfse/resumo-mensal
 * 
 * Query params:
 * - ano: number
 * - mes: number (1-12)
 */
router.get('/resumo-mensal', consultarLimiter, controller.getResumoMensal.bind(controller));

/**
 * 📊 SERVIÇOS MAIS PRESTADOS
 * GET /api/nfse/servicos-mais-prestados
 * 
 * Query params:
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 * - limit: number (default: 10)
 */
router.get('/servicos-mais-prestados', consultarLimiter, controller.getServicosMaisPrestados.bind(controller));

/**
 * 📊 NFS-e POR TOMADOR
 * GET /api/nfse/tomador/:tomadorId
 * 
 * Query params:
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 */
router.get('/tomador/:tomadorId', consultarLimiter, controller.findByTomador.bind(controller));

/**
 * 📊 NFS-e POR SERVIÇO
 * GET /api/nfse/servico/:servicoId
 * 
 * Query params:
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 */
router.get('/servico/:servicoId', consultarLimiter, controller.findByServico.bind(controller));

/**
 * 🔍 BUSCAR NFS-e POR PROTOCOLO (TProt - 15 ou 17 dígitos)
 * GET /api/nfse/protocolo/:protocolo
 * 
 * ⚠️ DEVE VIR ANTES DE /chave/:chave E /:id
 */
router.get('/protocolo/:protocolo', consultarLimiter, controller.buscarPorProtocolo.bind(controller));

/**
 * 🔍 BUSCAR NFS-e POR CHAVE DE ACESSO (TChNFSe - 53 dígitos)
 * GET /api/nfse/chave/:chave
 */
router.get('/chave/:chave', consultarLimiter, controller.buscarPorChave.bind(controller));

/**
 * 📄 BAIXAR XML DA NFS-e
 * GET /api/nfse/xml/:id
 */
router.get('/xml/:id', consultarLimiter, controller.baixarXml.bind(controller));

/**
 * 📄 GERAR DANFSe
 * GET /api/nfse/danfse/:id
 */
router.get('/danfse/:id', consultarLimiter, controller.gerarDanfse.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

/**
 * 📝 EMITIR NFS-e
 * POST /api/nfse/emitir
 * 
 * Body:
 * - tomadorId: string (obrigatório)
 * - servicoId: string (opcional)
 * - servico: {
 *     valorServico: number
 *     descricao: string
 *     aliquotaISS: number
 *     codigoTributacaoNacional: string
 *     codigoTributacaoMunicipal: string
 *     codigoNBS: string
 *     descontoIncondicionado: number
 *     deducoesMateriais: number
 *     tributacaoISSQN: 1|2|3|4
 *     tipoRetencaoISS: 1|2|3
 *     aliquotaPIS: number
 *     retidoPIS: boolean
 *     aliquotaCOFINS: number
 *     retidoCOFINS: boolean
 *     aliquotaIRRF: number
 *     aliquotaCSLL: number
 *     aliquotaINSS: number
 *   }
 * - formaPagamento: string
 * - informacoesComplementares: string
 * - numeroPedido: string
 */
router.post('/emitir', emitirLimiter, controller.emitir.bind(controller));

/**
 * ❌ CANCELAR NFS-e
 * POST /api/nfse/cancelar/:id
 * 
 * Body:
 * - motivo: string (TJust - 15-255 caracteres)
 */
router.post('/cancelar/:id', emitirLimiter, controller.cancelar.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

/**
 * 🔍 BUSCAR NFS-e POR ID
 * GET /api/nfse/:id
 * 
 * ⚠️ DEVE SER A ÚLTIMA ROTA PARA NÃO CONFLITAR COM OUTRAS
 */
router.get('/:id', consultarLimiter, controller.buscarPorId.bind(controller));

export default router;