// C:\emissornfe\backend\src\routes\index.ts

import { Router } from 'express';
import authRoutes from './auth.routes';
import nfseRoutes from './nfse.routes';
import nfeRoutes from './nfe.routes';
import financeiroRoutes from './financeiro.routes';
import cnpjRoutes from './cnpj.routes';
import produtoRoutes from './produto.routes';
import clienteRoutes from './cliente.routes';
import servicoRoutes from './servico.routes';
import nfceRoutes from './nfce.routes';      // ✅ ADICIONADO
import cteRoutes from './cte.routes';        // ✅ ADICIONADO
import nfaeRoutes from './nfae.routes';      // ✅ ADICIONADO

const router = Router();

// 🔥 ROTAS DE AUTENTICAÇÃO
router.use('/auth', authRoutes);

// 🔥 ROTAS FISCAIS
router.use('/nfse', nfseRoutes);
router.use('/nfe', nfeRoutes);
router.use('/nfce', nfceRoutes);      // ✅ ADICIONADO
router.use('/cte', cteRoutes);        // ✅ ADICIONADO
router.use('/nfae', nfaeRoutes);      // ✅ ADICIONADO

// 🔥 ROTAS DE CADASTRO
router.use('/produtos', produtoRoutes);
router.use('/clientes', clienteRoutes);
router.use('/servicos', servicoRoutes);

// 🔥 ROTAS FINANCEIRAS E FERRAMENTAS
router.use('/financeiro', financeiroRoutes);
router.use('/cnpj', cnpjRoutes);

export default router;