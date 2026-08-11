import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  mobile: z
    .string({ required_error: 'Mobile is required' })
    .min(10, 'Mobile must be at least 10 digits')
    .max(15, 'Mobile must be at most 15 digits')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional()
    .nullable(),
  business_name: z
    .string()
    .max(200)
    .trim()
    .optional()
    .nullable(),
  gst_number: z
    .string()
    .max(20)
    .trim()
    .optional()
    .nullable(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).default('RETAIL'),
  address: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z
    .string({ required_error: 'Note is required' })
    .min(1, 'Note is required')
    .max(2000, 'Note must be at most 2000 characters')
    .trim(),
  follow_up_date: z
    .string({ required_error: 'Follow-up date is required' })
    .datetime({ message: 'Invalid date format. Use ISO 8601 format.' })
    .transform((val) => new Date(val)),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
