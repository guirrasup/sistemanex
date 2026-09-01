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
import nfceRoutes from './nfce.routes';      
import cteRoutes from './cte.routes';        
import nfaeRoutes from './nfae.routes';      
import transportadoraRoutes from './transportadora.routes';
import mdfeRoutes from './mdfe.routes';

const router = Router();

// 🔥 ROTAS DE AUTENTICAÇÃO
router.use('/auth', authRoutes);

// 🔥 ROTAS FISCAIS
router.use('/nfse', nfseRoutes);
router.use('/nfe', nfeRoutes);
router.use('/nfce', nfceRoutes);      
router.use('/cte', cteRoutes);        
router.use('/nfae', nfaeRoutes);  
router.use('/mdfe', mdfeRoutes);    

// 🔥 ROTAS DE CADASTRO
router.use('/produtos', produtoRoutes);
router.use('/clientes', clienteRoutes);
router.use('/servicos', servicoRoutes);
router.use('/transportadoras', transportadoraRoutes); 

// 🔥 ROTAS FINANCEIRAS E FERRAMENTAS
router.use('/financeiro', financeiroRoutes);
router.use('/cnpj', cnpjRoutes);

export default router;