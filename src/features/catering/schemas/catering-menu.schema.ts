import { z } from 'zod';

// ─── Catering Menu Schema ─────────────────────────────────────────────────────
export const cateringMenuSchema = z.object({
  name: z.string().min(1, 'Menu name is required').max(255, 'Max 255 characters'),
  description: z.string().max(2000, 'Max 2000 characters').nullable().optional(),
  category: z.string().max(100, 'Max 100 characters').nullable().optional(),
  image_url: z
    .string()
    .url('Must be a valid URL starting with http:// or https://')
    .nullable()
    .optional()
    .or(z.literal('')),
  price_per_pax: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be 0 or more'),
  is_active: z.boolean(),
});

export type CateringMenuFormInput = z.infer<typeof cateringMenuSchema>;

// ─── Catering Menu Item Schema ────────────────────────────────────────────────
export const cateringMenuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(255, 'Max 255 characters'),
  description: z.string().max(2000, 'Max 2000 characters').nullable().optional(),
  course_type: z.string().max(100, 'Max 100 characters').nullable().optional(),
  image_url: z
    .string()
    .url('Must be a valid URL')
    .nullable()
    .optional()
    .or(z.literal('')),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
});

export type CateringMenuItemFormInput = z.infer<typeof cateringMenuItemSchema>;

// ─── Catering Recipe Schema ───────────────────────────────────────────────────
export const cateringRecipeSchema = z.object({
  inventory_item_id: z.string().uuid('Please select a valid inventory item'),
  quantity_per_pax: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Max 50 characters'),
});

export type CateringRecipeFormInput = z.infer<typeof cateringRecipeSchema>;
