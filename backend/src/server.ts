// backend/src/server.ts
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
import mdfeRoutes from './routes/mdfe.routes';

import dashboardRoutes from './routes/dashboard.routes'; 
import { errorMiddleware } from './middlewares/error.middleware';
import transportadoraRoutes from './routes/transportadora.routes';

dotenv.config();

const app = express();
const DEFAULT_PORT = 3333;
const PORT = process.env.PORT || DEFAULT_PORT;

// Segurança (P5): atrás de 1 proxy (nginx) — habilita IP real do cliente
// para rate limiting e logs (X-Forwarded-For).
app.set('trust proxy', 1);

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

// Segurança (P4): brute-force de credenciais — mais restritivo que o global.
// O frontend já trata 429 com backoff exponencial.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    sucesso: false,
    erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Segurança (P4): emissão de documentos fiscais é operação crítica.
const emissaoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    sucesso: false,
    erro: 'Limite de emissões excedido. Aguarde um momento e tente novamente.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/nfse', nfseRoutes);
app.use('/api/nfe', nfeRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/cnpj', cnpjRoutes);

app.use('/api/produtos', dataLimiter, produtoRoutes);
app.use('/api/clientes', dataLimiter, clienteRoutes);
app.use('/api/servicos', dataLimiter, servicoRoutes);
app.use('/api/transportadoras', dataLimiter, transportadoraRoutes);

app.use('/api/nfce', dataLimiter, emissaoLimiter, nfceRoutes);
app.use('/api/cte', dataLimiter, emissaoLimiter, cteRoutes);
app.use('/api/nfae', dataLimiter, emissaoLimiter, nfaeRoutes);
app.use('/api/mdfe', dataLimiter, emissaoLimiter, mdfeRoutes);

// Dashboard
app.use('/api/dashboard', dataLimiter, dashboardRoutes);

// Health check
// Segurança (P6): em produção só revela status básico — sem detalhes de configuração.
app.get('/health', (req, res) => {
  const conectaGovConfigurado =
    !!process.env.CONECTAGOV_CLIENT_ID && !!process.env.CONECTAGOV_CLIENT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    return res.json({ status: 'OK', timestamp: new Date().toISOString() });
  }

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
      status: conectaGovConfigurado
        ? 'Pronto para uso'
        : 'Configure as credenciais no .env',
    },
  });
});

// Error handling (deve ser o último)
app.use(errorMiddleware);

// Start server
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido, encerrando graciosamente...");
  server.close(() => {
    console.log("Servidor encerrado.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
});

process.on("SIGINT", () => {
  console.log("SIGINT recebido, encerrando graciosamente...");
  server.close(() => {
    console.log("Servidor encerrado.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
});;