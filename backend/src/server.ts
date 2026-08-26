// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import nfseRoutes from './routes/nfse.routes';
import nfeRoutes from './routes/nfe.routes';
import financeiroRoutes from './routes/financeiro.routes';
import cnpjRoutes from './routes/cnpj.routes';
import produtoRoutes from './routes/produto.routes';
import clienteRoutes from './routes/cliente.routes';
import servicoRoutes from './routes/servico.routes';
import nfceRoutes from './routes/nfce.routes';
import cteRoutes from './routes/cte.routes';
import nfaeRoutes from './routes/nfae.routes';
import dashboardRoutes from './routes/dashboard.routes'; // ← adicionado
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Security
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://seu-dominio.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    sucesso: false,
    erro: 'Muitas requisições. Aguarde um momento e tente novamente.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use('/api', limiter);

const dataLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    sucesso: false,
    erro: 'Limite de requisições de dados excedido. Aguarde um momento.',
  },
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/nfse', nfseRoutes);
app.use('/api/nfe', nfeRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/cnpj', cnpjRoutes);

app.use('/api/produtos', dataLimiter, produtoRoutes);
app.use('/api/clientes', dataLimiter, clienteRoutes);
app.use('/api/servicos', dataLimiter, servicoRoutes);

app.use('/api/nfce', dataLimiter, nfceRoutes);
app.use('/api/cte', dataLimiter, cteRoutes);
app.use('/api/nfae', dataLimiter, nfaeRoutes);

// Dashboard
app.use('/api/dashboard', dataLimiter, dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    conectaGov: {
      clientId: process.env.CONECTAGOV_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado',
      clientSecret: process.env.CONECTAGOV_CLIENT_SECRET
        ? '✅ Configurado'
        : '❌ Não configurado',
      cpfUsuario: process.env.CONECTAGOV_CPF_USUARIO
        ? '✅ Configurado'
        : '❌ Não configurado',
      privateKey: process.env.CONECTAGOV_PRIVATE_KEY
        ? '✅ Configurado'
        : '❌ Não configurado',
      status:
        process.env.CONECTAGOV_CLIENT_ID && process.env.CONECTAGOV_CLIENT_SECRET
          ? 'Pronto para uso'
          : 'Configure as credenciais no .env',
    },
  });
});

// Error handling (deve ser o último)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(
    `🔑 ConectaGov: ${
      process.env.CONECTAGOV_CLIENT_ID
        ? '✅ Cliente configurado'
        : '❌ Cliente não configurado'
    }`
  );
});