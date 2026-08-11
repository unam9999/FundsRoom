import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from './product.validation';

const router = Router();

// All product routes require authentication
router.use(authenticate);

// GET /api/products — all roles can view
router.get('/', validate(productQuerySchema, 'query'), productController.list);

// GET /api/products/categories — all roles can view
router.get('/categories', productController.getCategories);

// GET /api/products/:id — all roles can view
router.get('/:id', productController.getById);

// POST /api/products — Admin and Warehouse only
router.post(
  '/',
  authorize('ADMIN', 'WAREHOUSE'),
  validate(createProductSchema),
  productController.create
);

// PUT /api/products/:id — Admin and Warehouse only
router.put(
  '/:id',
  authorize('ADMIN', 'WAREHOUSE'),
  validate(updateProductSchema),
  productController.update
);

// DELETE /api/products/:id — Admin only
router.delete('/:id', authorize('ADMIN'), productController.delete);

export default router;
