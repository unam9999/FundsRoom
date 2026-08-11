import { z } from 'zod';

const challanItemSchema = z.object({
  product_id: z
    .string({ required_error: 'Product ID is required' })
    .uuid('Invalid product ID format'),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0'),
});

export const createChallanSchema = z.object({
  customer_id: z
    .string({ required_error: 'Customer ID is required' })
    .uuid('Invalid customer ID format'),
  items: z
    .array(challanItemSchema, { required_error: 'Items are required' })
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per challan'),
});

export const challanQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
  customer_id: z.string().uuid().optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type ChallanQueryInput = z.infer<typeof challanQuerySchema>;
