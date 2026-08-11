import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { loginLimiter } from '../../middleware/rate-limiter';
import { loginSchema } from './auth.validation';

const router = Router();

// POST /api/auth/login — public, rate-limited
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// GET /api/auth/me — requires authentication
router.get('/me', authenticate, authController.getProfile);

export default router;
