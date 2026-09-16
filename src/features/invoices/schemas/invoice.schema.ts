import { z } from 'zod';
import { INVOICE_STATUS_VALUES, INVOICE_PAYMENT_STAGE_VALUES } from '../types/invoice.types';

export const invoiceSchema = z.object({
  booking_id: z.string().uuid('A valid booking is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  payment_stage: z.enum(INVOICE_PAYMENT_STAGE_VALUES as [string, ...string[]]),
  amount: z.number().positive('Amount must be greater than zero'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(INVOICE_STATUS_VALUES as [string, ...string[]]).default('unpaid'),
  paid_at: z.string().nullable().optional(),
  payment_link: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  payment_reference_id: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type InvoiceFormInput = z.infer<typeof invoiceSchema>;
