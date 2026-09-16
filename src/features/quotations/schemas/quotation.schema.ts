import { z } from 'zod';

export const quotationItemSchema = z.object({
  id: z.string().uuid().optional(),
  service_id: z.string().uuid().nullable().optional(),
  item_name: z.string().trim().min(1, 'Item name is required').max(255),
  description: z.string().trim().max(1000).nullable().optional().or(z.literal('')),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount_amount: z.number().min(0, 'Discount cannot be negative').default(0),
  line_total: z.number().min(0),
  display_order: z.number().int().min(0).default(0),
});

export const quotationSchema = z.object({
  client_id: z.string().uuid('Please select a client').nullable().optional(),
  quotation_number: z.string().trim().min(1, 'Quotation number is required').max(100),
  title: z.string().trim().min(1, 'Title is required').max(255),
  subtotal: z.number().min(0).default(0),
  discount_amount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax_amount: z.number().min(0, 'Tax cannot be negative').default(0),
  total_amount: z.number().min(0).default(0),
  valid_until: z.string().nullable().optional().or(z.literal('')),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'canceled']).default('draft'),
  notes: z.string().trim().max(5000).nullable().optional().or(z.literal('')),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
});

export type QuotationFormInput = z.infer<typeof quotationSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
