import { Router } from 'express';
import { challanController } from './challan.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createChallanSchema, challanQuerySchema } from './challan.validation';

const router = Router();

// All challan routes require authentication
router.use(authenticate);

// GET /api/challans — all roles can view
router.get('/', validate(challanQuerySchema, 'query'), challanController.list);

// GET /api/challans/:id — all roles can view
router.get('/:id', challanController.getById);

// POST /api/challans — Admin and Sales only (create draft)
router.post(
  '/',
  authorize('ADMIN', 'SALES'),
  validate(createChallanSchema),
  challanController.create
);

// POST /api/challans/:id/confirm — Admin and Sales only
router.post(
  '/:id/confirm',
  authorize('ADMIN', 'SALES'),
  challanController.confirm
);

// POST /api/challans/:id/cancel — Admin and Sales only
router.post(
  '/:id/cancel',
  authorize('ADMIN', 'SALES'),
  challanController.cancel
);

export default router;
