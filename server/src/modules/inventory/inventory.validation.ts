import { z } from 'zod';

export const createMovementSchema = z.object({
  product_id: z
    .string({ required_error: 'Product ID is required' })
    .uuid('Invalid product ID format'),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be positive'),
  movement_type: z.enum(['IN', 'OUT'], {
    required_error: 'Movement type is required',
    invalid_type_error: 'Movement type must be IN or OUT',
  }),
  reason: z
    .string()
    .max(500, 'Reason must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const movementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  product_id: z.string().uuid().optional(),
  movement_type: z.enum(['IN', 'OUT']).optional(),
});

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  low_stock: z.coerce.boolean().optional(),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type MovementQueryInput = z.infer<typeof movementQuerySchema>;
export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>;
