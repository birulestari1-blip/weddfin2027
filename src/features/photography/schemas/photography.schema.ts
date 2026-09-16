import { z } from 'zod';

export const equipmentStatusSchema = z.enum(['available', 'reserved', 'maintenance', 'damaged']);

export const photographyEquipmentSchema = z.object({
  inventory_item_id: z.string().nullable().optional(),
  equipment_type: z.string().min(1, 'Equipment type is required').max(100),
  brand: z.string().max(100).nullable().optional().or(z.literal('')),
  model: z.string().max(150).nullable().optional().or(z.literal('')),
  serial_number: z.string().max(150).nullable().optional().or(z.literal('')),
  status: equipmentStatusSchema,
  notes: z.string().nullable().optional().or(z.literal('')),
});

export type PhotographyEquipmentFormInput = z.infer<typeof photographyEquipmentSchema>;

export const photographyBookingDetailSchema = z.object({
  booking_id: z.string().min(1, 'Booking is required'),
  shooting_duration_hours: z
    .number({ invalid_type_error: 'Duration must be a number' })
    .nullable()
    .optional(),
  photographer_count: z
    .number({ invalid_type_error: 'Photographer count must be a number' })
    .int()
    .min(1, 'Must have at least 1 photographer'),
  edited_photo_count: z
    .number({ invalid_type_error: 'Photo count must be a number' })
    .int()
    .min(0),
  album_quantity: z
    .number({ invalid_type_error: 'Album quantity must be a number' })
    .int()
    .min(0),
  delivery_deadline: z.string().nullable().optional().or(z.literal('')),
  shot_list: z.array(z.any()), // Can refine later if needed
  editing_notes: z.string().nullable().optional().or(z.literal('')),
});

export type PhotographyBookingDetailFormInput = z.infer<typeof photographyBookingDetailSchema>;
