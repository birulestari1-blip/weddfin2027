import { z } from 'zod';

// ─── Contract form schema ─────────────────────────────────────────────────────
// Mirrors exact columns of `contracts` table (schema V3.2)
// tenant_id is injected by the service — never from the form.
export const contractSchema = z.object({
  // Required FK to vendor_bookings
  booking_id: z.string().uuid('Booking tidak valid — harus berupa UUID'),

  // Required identifier
  contract_number: z
    .string()
    .min(1, 'Nomor kontrak wajib diisi')
    .max(100, 'Nomor kontrak maksimal 100 karakter'),

  // Required legal body
  terms_and_conditions: z
    .string()
    .min(1, 'Syarat & ketentuan wajib diisi'),

  // JSONB — stored as array of items; UI treats it as free-form text blocks
  // Schema default is '[]'; we accept an array of any objects
  scope_of_work: z.array(z.any()).default([]),

  // Status — exact values from schema CHECK constraint
  status: z
    .enum(['draft', 'sent', 'signed', 'rejected', 'void'])
    .default('draft'),

  // Signature timestamps (ISO string or null)
  client_signed_at: z.string().nullable().optional(),
  vendor_signed_at: z.string().nullable().optional(),

  // URL fields — must be valid URL or empty string → coerced to null
  client_signature_url: z
    .union([z.string().url('URL signature klien tidak valid'), z.literal('')])
    .nullable()
    .optional()
    .transform((v) => v || null),

  vendor_signature_url: z
    .union([z.string().url('URL signature vendor tidak valid'), z.literal('')])
    .nullable()
    .optional()
    .transform((v) => v || null),

  pdf_url: z
    .union([z.string().url('URL dokumen PDF tidak valid'), z.literal('')])
    .nullable()
    .optional()
    .transform((v) => v || null),
});

export type ContractFormInput = z.infer<typeof contractSchema>;

// ─── Partial schema for updates ───────────────────────────────────────────────
export const contractUpdateSchema = contractSchema.partial().omit({ booking_id: true });
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>;
