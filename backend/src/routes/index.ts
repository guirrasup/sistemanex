// C:\emissornfe\backend\src\routes\cte.routes.ts

import { Router } from 'express';
import { CteController } from '../controllers/cte.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const cteController = new CteController();

// ✅ TODAS AS ROTAS CT-e
router.use(authMiddleware);

// 📋 LISTAGEM E CONSULTA
router.get('/', cteController.listar.bind(cteController));
router.get('/estatisticas', cteController.getEstatisticas.bind(cteController));
router.get('/total-frete', cteController.getTotalFrete.bind(cteController));
router.get('/resumo-mensal', cteController.getResumoMensal.bind(cteController));

// 🔍 BUSCAS POR PARÂMETROS ESPECÍFICOS
router.get('/chave/:chave', cteController.buscarPorChave.bind(cteController));
router.get('/protocolo/:protocolo', cteController.buscarPorProtocolo.bind(cteController));
router.get('/status/:status', cteController.findByStatus.bind(cteController));
router.get('/modal/:modal', cteController.findByModal.bind(cteController));

// 🔍 BUSCAS POR RELACIONAMENTOS
router.get('/cliente/:clienteId', cteController.findByCliente.bind(cteController));
router.get('/transportadora/:transportadoraId', cteController.findByTransportadora.bind(cteController));

// 🔍 CT-e DE SUBSTITUIÇÃO E COMPLEMENTO
router.get('/substituicao/:chave', cteController.buscarCteSubstituido.bind(cteController));
router.get('/complemento/:chave', cteController.buscarCteComplementado.bind(cteController));

// 📝 CRUD PRINCIPAL
router.get('/:id', cteController.buscarPorId.bind(cteController));
router.post('/emitir', cteController.emitir.bind(cteController));
router.post('/cancelar/:id', cteController.cancelar.bind(cteController));

// 📄 DOWNLOADS
router.get('/xml/:id', cteController.baixarXml.bind(cteController));
router.get('/dacte/:id', cteController.gerarDacte.bind(cteController));

export default router;