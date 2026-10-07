// src/routes/nfae.routes.ts

import { Router } from 'express';
import { NFAeController } from '../controllers/nfae.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { exigirPermissao } from '../middlewares/permissao.middleware.js';

const router = Router();
// 🔐 Permissões (catálogo em config/permissoes.ts)
const podeLer = exigirPermissao('nfae.ver', 'nfae.emitir');
const podeVerEstatisticas = exigirPermissao('relatorios.estatisticas');
const podeEmitir = exigirPermissao('nfae.emitir');
const podeCancelar = exigirPermissao('nfae.cancelar');
const podeBaixarXml = exigirPermissao('nfae.download');
const podeExcluir = exigirPermissao('nfae.excluir');

const nfaeController = new NFAeController();

// 🔒 Todas as rotas exigem autenticação
router.use(authMiddleware);

// 📋 LISTAGEM E CONSULTA
router.get('/', podeLer, nfaeController.listar.bind(nfaeController));
router.get('/estatisticas', podeVerEstatisticas, nfaeController.getEstatisticas.bind(nfaeController));
router.get('/total-periodo', podeVerEstatisticas, nfaeController.getTotalPeriodo.bind(nfaeController));
router.get('/resumo-mensal', podeVerEstatisticas, nfaeController.getResumoMensal.bind(nfaeController));

// 🔍 BUSCAS
router.get('/chave/:chave', podeLer, nfaeController.buscarPorChave.bind(nfaeController));
router.get('/destinatario/:destinatarioId', podeLer, nfaeController.findByDestinatario.bind(nfaeController));

// 📝 CRUD (mutações)
router.post('/emitir', podeEmitir, nfaeController.emitir.bind(nfaeController));
router.post('/cancelar/:id', podeCancelar, nfaeController.cancelar.bind(nfaeController));
router.post('/:id/enviar-email', podeBaixarXml, nfaeController.enviarXmlPorEmail.bind(nfaeController));
router.delete('/:id', podeExcluir, nfaeController.excluir.bind(nfaeController));

// 📄 DOWNLOADS
router.get('/xml/:id', podeBaixarXml, nfaeController.baixarXml.bind(nfaeController));

// 🔍 POR ID (DEVE SER A ÚLTIMA ROTA)
router.get('/:id', podeLer, nfaeController.buscarPorId.bind(nfaeController));

export default router;