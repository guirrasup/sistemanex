// backend/src/routes/nfae.routes.ts

import { Router } from 'express';
import { NFAeController } from '../controllers/nfae.controller';

const router = Router();
const nfaeController = new NFAeController();

// 📋 LISTAGEM E CONSULTA
router.get('/', nfaeController.listar.bind(nfaeController));
router.get('/estatisticas', nfaeController.getEstatisticas.bind(nfaeController));
router.get('/total-periodo', nfaeController.getTotalPeriodo.bind(nfaeController));
router.get('/resumo-mensal', nfaeController.getResumoMensal.bind(nfaeController));

// 🔍 BUSCAS
router.get('/chave/:chave', nfaeController.buscarPorChave.bind(nfaeController));
router.get('/destinatario/:destinatarioId', nfaeController.findByDestinatario.bind(nfaeController));

// 📝 CRUD
router.post('/emitir', nfaeController.emitir.bind(nfaeController));
router.post('/cancelar/:id', nfaeController.cancelar.bind(nfaeController));
router.delete('/:id', nfaeController.excluir.bind(nfaeController));

// 📄 DOWNLOADS
router.get('/xml/:id', nfaeController.baixarXml.bind(nfaeController));

// 🔍 POR ID (DEVE SER A ÚLTIMA ROTA)
router.get('/:id', nfaeController.buscarPorId.bind(nfaeController));

export default router;