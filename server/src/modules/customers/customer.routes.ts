import { Router } from 'express';
import { customerController } from './customer.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
  customerQuerySchema,
} from './customer.validation';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// GET /api/customers — all roles can view
router.get('/', validate(customerQuerySchema, 'query'), customerController.list);

// GET /api/customers/:id — all roles can view
router.get('/:id', customerController.getById);

// POST /api/customers — Admin and Sales only
router.post(
  '/',
  authorize('ADMIN', 'SALES'),
  validate(createCustomerSchema),
  customerController.create
);

// PUT /api/customers/:id — Admin and Sales only
router.put(
  '/:id',
  authorize('ADMIN', 'SALES'),
  validate(updateCustomerSchema),
  customerController.update
);

// DELETE /api/customers/:id — Admin only
router.delete('/:id', authorize('ADMIN'), customerController.delete);

// POST /api/customers/:id/followups — Admin and Sales only
router.post(
  '/:id/followups',
  authorize('ADMIN', 'SALES'),
  validate(createFollowUpSchema),
  customerController.addFollowUp
);

export default router;
