import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters')
    .trim(),
  sku: z
    .string({ required_error: 'SKU is required' })
    .min(2, 'SKU must be at least 2 characters')
    .max(50, 'SKU must be at most 50 characters')
    .toUpperCase()
    .trim(),
  category: z
    .string({ required_error: 'Category is required' })
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must be at most 100 characters')
    .trim(),
  unit_price: z
    .number({ required_error: 'Unit price is required' })
    .positive('Unit price must be positive')
    .max(99999999.99, 'Unit price exceeds maximum'),
  current_stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .default(0),
  minimum_stock: z
    .number()
    .int('Minimum stock must be a whole number')
    .min(0, 'Minimum stock cannot be negative')
    .default(0),
  warehouse_location: z
    .string()
    .max(50)
    .trim()
    .optional()
    .nullable(),
});

export const updateProductSchema = createProductSchema.partial().omit({ sku: true });

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  low_stock: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
