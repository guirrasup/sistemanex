// backend/src/routes/certificado.routes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CertificadoController } from '../controllers/certificado.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CertificadoController();

// Segurança: upload/renovação de certificado é operação sensível e pouco frequente.
const certificadoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    sucesso: false,
    erro: 'Muitas tentativas de envio de certificado. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware);

router.get('/status', controller.status.bind(controller));
router.post('/upload', certificadoLimiter, controller.upload.bind(controller));
router.post('/renovar', certificadoLimiter, controller.renovar.bind(controller));

export default router;
