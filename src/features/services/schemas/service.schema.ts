import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  description: z.string().trim().max(1000, 'Description is too long').nullable().optional().or(z.literal('')),
  pricing_type: z.enum(['fixed_package', 'per_pax', 'per_hour', 'custom_quote'] as const),
  base_price: z.number().min(0, 'Base price cannot be negative').optional(),
  min_order_qty: z.number().min(1, 'Minimum order quantity must be at least 1').optional(),
  specifications: z.record(z.any()).nullable().optional(), // JSONB field
  image_url: z.string().trim().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
