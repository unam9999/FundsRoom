import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// GET /api/dashboard/stats — all authenticated roles
router.get('/stats', authenticate, dashboardController.getStats);

export default router;
