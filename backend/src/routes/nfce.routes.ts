// C:\emissornfe\backend\src\routes\nfce.routes.ts

import { Router } from 'express';
import { NfceController } from '../controllers/nfce.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

// ============================================================
// RATE LIMITING ESPECÍFICO PARA NFC-e
// ============================================================

/**
 * Limite de requisições para emissão de NFC-e (evita spam)
 * 10 emissões por minuto
 */
const emitirLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisições
  message: {
    sucesso: false,
    erro: 'Limite de emissão de NFC-e excedido. Aguarde um momento e tente novamente.'
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
const controller = new NfceController();

// 🔒 TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO
router.use(authMiddleware);

// ============================================================
// ROTAS DE CONSULTA
// ============================================================

/**
 * 📋 LISTAR NFC-e COM FILTROS
 * GET /api/nfce
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 50)
 * - status: string (ex: AUTORIZADA,CANCELADA)
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 * - consumidorId: string
 * - numero: number (TNF - 1-999999999)
 * - serie: number (TSerie - 0 ou 1-999)
 * - chave: string (TChNFe - 44 dígitos)
 */
router.get('/', consultarLimiter, controller.listar.bind(controller));

/**
 * 📊 ESTATÍSTICAS DE NFC-e
 * GET /api/nfce/estatisticas
 * 
 * Retorna contagem de NFC-e por status
 */
router.get('/estatisticas', consultarLimiter, controller.getEstatisticas.bind(controller));

/**
 * 💰 TOTAL DE VENDAS POR PERÍODO
 * GET /api/nfce/total-vendas
 * 
 * Query params:
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 */
router.get('/total-vendas', consultarLimiter, controller.getTotalVendas.bind(controller));

/**
 * 📊 RESUMO MENSAL
 * GET /api/nfce/resumo-mensal
 * 
 * Query params:
 * - ano: number
 * - mes: number (1-12)
 */
router.get('/resumo-mensal', consultarLimiter, controller.getResumoMensal.bind(controller));

/**
 * 📊 PRODUTOS MAIS VENDIDOS
 * GET /api/nfce/produtos-mais-vendidos
 * 
 * Query params:
 * - dataInicio: string (YYYY-MM-DD)
 * - dataFim: string (YYYY-MM-DD)
 * - limit: number (default: 10)
 */
router.get('/produtos-mais-vendidos', consultarLimiter, controller.getProdutosMaisVendidos.bind(controller));

/**
 * 🔍 BUSCAR NFC-e POR PROTOCOLO (TProt - 15 ou 17 dígitos)
 * GET /api/nfce/protocolo/:protocolo
 * 
 * ⚠️ DEVE VIR ANTES DE /chave/:chave E /:id
 */
router.get('/protocolo/:protocolo', consultarLimiter, controller.buscarPorProtocolo.bind(controller));

/**
 * 🔍 BUSCAR NFC-e POR CHAVE DE ACESSO (TChNFe - 44 dígitos)
 * GET /api/nfce/chave/:chave
 */
router.get('/chave/:chave', consultarLimiter, controller.buscarPorChave.bind(controller));

/**
 * 📄 BAIXAR XML DA NFC-e
 * GET /api/nfce/xml/:id
 */
router.get('/xml/:id', consultarLimiter, controller.baixarXml.bind(controller));

/**
 * 📄 GERAR DANFE NFC-e (Cupom)
 * GET /api/nfce/danfe/:id
 */
router.get('/danfe/:id', consultarLimiter, controller.gerarDanfce.bind(controller));

// ============================================================
// ROTAS DE ESCRITA (com rate limit mais restritivo)
// ============================================================

/**
 * 📝 EMITIR NFC-e
 * POST /api/nfce/emitir
 * 
 * Body:
 * - itens: ItemNfe[]
 * - naturezaOperacao: string
 * - consumidorIdentificado: boolean
 * - consumidorDoc: string (opcional)
 * - consumidorNome: string (opcional)
 * - consumidorEmail: string (opcional)
 * - consumidorTelefone: string (opcional)
 * - consumidorEndereco: EnderecoFiscal (opcional)
 * - formaPagamento: string (01-99)
 * - valorPago: number
 * - valorRecebido: number (para dinheiro)
 * - valorDesconto: number
 * - valorAcrescimo: number
 * - tpNF: 0|1 (opcional)
 * - idDest: 1|2|3 (opcional)
 * - finNFe: 1|2|3|4 (opcional)
 * - indFinal: 0|1 (opcional)
 * - indPres: 0|1|2|3|4|5|9 (opcional)
 * - procEmi: string (opcional)
 * - verProc: string (opcional)
 * - tpEmis: TipoEmissao (opcional)
 * - pagamentos: PagamentoNFCe[] (opcional)
 * - infAdFisco: string (opcional)
 * - infCpl: string (opcional)
 */
router.post('/emitir', emitirLimiter, controller.emitir.bind(controller));

/**
 * ❌ CANCELAR NFC-e
 * POST /api/nfce/cancelar/:id
 * 
 * Body:
 * - motivo: string (TJust - 15-255 caracteres)
 */
router.post('/cancelar/:id', emitirLimiter, controller.cancelar.bind(controller));

// ============================================================
// ROTA DE FALLBACK (DEVE SER A ÚLTIMA)
// ============================================================

/**
 * 🔍 BUSCAR NFC-e POR ID
 * GET /api/nfce/:id
 * 
 * ⚠️ DEVE SER A ÚLTIMA ROTA PARA NÃO CONFLITAR COM OUTRAS
 */
router.get('/:id', consultarLimiter, controller.buscarPorId.bind(controller));

export default router;