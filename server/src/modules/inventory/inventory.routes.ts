import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createMovementSchema,
  movementQuerySchema,
  inventoryQuerySchema,
} from './inventory.validation';

const router = Router();

// All inventory routes require authentication
router.use(authenticate);

// GET /api/inventory — all roles can view stock levels
router.get('/', validate(inventoryQuerySchema, 'query'), inventoryController.getStockLevels);

// GET /api/inventory/movements — all roles can view movement history
router.get(
  '/movements',
  validate(movementQuerySchema, 'query'),
  inventoryController.getMovements
);

// POST /api/inventory/movements — Admin and Warehouse only
router.post(
  '/movements',
  authorize('ADMIN', 'WAREHOUSE'),
  validate(createMovementSchema),
  inventoryController.createMovement
);

export default router;
