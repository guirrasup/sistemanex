// backend/src/routes/cte.routes.ts
import { Router } from 'express';
import { CteController } from '../controllers/cte.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeLer = exigirPermissao('cte.ver', 'cte.emitir');
const podeVerEstatisticas = exigirPermissao('relatorios.estatisticas');
const podeEmitir = exigirPermissao('cte.emitir');
const podeCancelar = exigirPermissao('cte.cancelar');
const podeBaixarXml = exigirPermissao('cte.download');

const cteController = new CteController();

// ✅ TODAS AS ROTAS CT-e
router.use(authMiddleware);

// 📋 LISTAGEM E CONSULTA
router.get('/', podeLer, cteController.listar.bind(cteController));
router.get('/estatisticas', podeVerEstatisticas, cteController.getEstatisticas.bind(cteController));
router.get('/total-frete', podeVerEstatisticas, cteController.getTotalFrete.bind(cteController));
router.get('/resumo-mensal', podeVerEstatisticas, cteController.getResumoMensal.bind(cteController));

// 🔍 BUSCAS POR PARÂMETROS ESPECÍFICOS
router.get('/chave/:chave', podeLer, cteController.buscarPorChave.bind(cteController));
router.get('/protocolo/:protocolo', podeLer, cteController.buscarPorProtocolo.bind(cteController));
router.get('/status/:status', podeLer, cteController.findByStatus.bind(cteController));
router.get('/modal/:modal', podeLer, cteController.findByModal.bind(cteController));

// 🔍 BUSCAS POR RELACIONAMENTOS
router.get('/cliente/:clienteId', podeLer, cteController.findByCliente.bind(cteController));
router.get('/transportadora/:transportadoraId', podeLer, cteController.findByTransportadora.bind(cteController));

// 🔍 CT-e DE SUBSTITUIÇÃO E COMPLEMENTO
router.get('/substituicao/:chave', podeLer, cteController.buscarCteSubstituido.bind(cteController));
router.get('/complemento/:chave', podeLer, cteController.buscarCteComplementado.bind(cteController));

// 📝 CRUD PRINCIPAL
router.get('/:id', podeLer, cteController.buscarPorId.bind(cteController));
router.post('/emitir', podeEmitir, cteController.emitir.bind(cteController));
router.post('/cancelar/:id', podeCancelar, cteController.cancelar.bind(cteController));
router.post('/:id/enviar-email', podeBaixarXml, cteController.enviarXmlPorEmail.bind(cteController));

// 📄 DOWNLOADS
router.get('/xml/:id', podeBaixarXml, cteController.baixarXml.bind(cteController));
router.get('/dacte/:id', podeLer, cteController.gerarDacte.bind(cteController));

export default router;