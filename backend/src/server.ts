// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import nfseRoutes from './routes/nfse.routes.js';
import nfeRoutes from './routes/nfe.routes.js';
import financeiroRoutes from './routes/financeiro.routes.js';
import cnpjRoutes from './routes/cnpj.routes.js';
import produtoRoutes from './routes/produto.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import servicoRoutes from './routes/servico.routes.js';
import nfceRoutes from './routes/nfce.routes.js';
import cteRoutes from './routes/cte.routes.js';
import nfaeRoutes from './routes/nfae.routes.js';
import mdfeRoutes from './routes/mdfe.routes.js';

import dashboardRoutes from './routes/dashboard.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import transportadoraRoutes from './routes/transportadora.routes.js';
import certificadoRoutes from './routes/certificado.routes.js';
import empresaRoutes from './routes/empresa.routes.js';

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
        // 🔥 Qualquer porta em localhost/127.0.0.1, não só 3000/5173 fixos: o Vite
        // sobe em 3001/3002/... automaticamente quando a porta padrão já está
        // ocupada (ex.: um dev server anterior ainda rodando), e a lista fixa
        // bloqueava o login com CORS assim que isso acontecia.
        : /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
    credentials: true,
  })
);

// Rate limiting
// 🔥 100 req/min por IP era compartilhado por TODA a API (auth, cadastros, os 6
// tipos de documento fiscal, dashboard) — um único carregamento do app já disparava
// ~16-34 requisições (App.tsx + Dashboard, hoje deduplicado), e qualquer IP com mais
// de um usuário atrás do mesmo NAT/rede corporativa, ou só duas ou três recargas de
// página em menos de 1 minuto (comportamento normal quando a página parece travada),
// já estourava o limite. Ao bater 429, o interceptor de retry com backoff do frontend
// insistia nos mesmos endpoints, prolongando o travamento em vez de se recuperar.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
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
  max: 400,
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
app.use('/api/certificado', certificadoRoutes);
app.use('/api/empresa', empresaRoutes);

app.use('/api/produtos', dataLimiter, produtoRoutes);
app.use('/api/clientes', dataLimiter, clienteRoutes);
app.use('/api/servicos', dataLimiter, servicoRoutes);
app.use('/api/transportadoras', dataLimiter, transportadoraRoutes);

// 🔥 nfce/cte/nfae/mdfe já aplicam seus próprios limiters por rota (consultarLimiter
// nos GETs, emitirLimiter nos POSTs de emissão/cancelamento — mesmo padrão de
// nfe/nfse). Um `emissaoLimiter` de 10 req/min era aplicado aqui em cima de TODO
// o router (GETs inclusive, via app.use), sufocando até a simples listagem desses
// 4 tipos — qualquer refresh de tela já estourava o limite e travava a UI em 429.
app.use('/api/nfce', dataLimiter, nfceRoutes);
app.use('/api/cte', dataLimiter, cteRoutes);
app.use('/api/nfae', dataLimiter, nfaeRoutes);
app.use('/api/mdfe', dataLimiter, mdfeRoutes);

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
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

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