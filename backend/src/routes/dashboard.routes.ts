// C:\emissornfe\backend\src\routes\dashboard.routes.ts

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new DashboardController();

router.use(authMiddleware);
router.get('/', controller.getDashboard.bind(controller));

export default router;