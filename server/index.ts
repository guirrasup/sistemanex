import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import financialRoutes from './routes/financial.routes';
import peopleRoutes from './routes/people.routes';
import productRoutes from './routes/product.routes';
import bankRoutes from './routes/bank.routes';
import fiscalRoutes from './routes/fiscal.routes';
import aiRoutes from './routes/ai.routes';
import auditRoutes from './routes/audit.routes';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter(100, 60000));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/fiscal', fiscalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit', auditRoutes);

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

export default app;

if (process.env.RUN_STANDALONE === "true") {
  app.listen(PORT, () => {
    logger.info(`🚀 NEX Server running on port ${PORT}`);
  });
}
