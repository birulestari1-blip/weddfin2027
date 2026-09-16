import type { Database } from '@/types/database.types';

// ─── RAW DB TYPES ────────────────────────────────────────────────────────────
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

// ─── EXACT STATUS FROM SCHEMA: unpaid | paid | overdue | canceled ─────────────
export type InvoiceStatus = Invoice['status'];
export type InvoicePaymentStage = Invoice['payment_stage'];

export const INVOICE_STATUS_VALUES: InvoiceStatus[] = ['unpaid', 'paid', 'overdue', 'canceled'];
export const INVOICE_PAYMENT_STAGE_VALUES: InvoicePaymentStage[] = [
  'down_payment',
  'installment',
  'final_payment',
];

// ─── READABLE LABELS ─────────────────────────────────────────────────────────
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: 'Belum Dibayar',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
  canceled: 'Dibatalkan',
};

export const PAYMENT_STAGE_LABELS: Record<InvoicePaymentStage, string> = {
  down_payment: 'Uang Muka',
  installment: 'Angsuran',
  final_payment: 'Pelunasan',
};

// ─── JOINED TYPE ─────────────────────────────────────────────────────────────
export interface InvoiceWithDetails extends Invoice {
  vendor_bookings?: {
    id: string;
    client_name: string;
    client_email: string | null;
    client_phone: string | null;
    event_name: string | null;
    event_date: string;
    status: string;
    clients?: {
      id: string;
      full_name: string;
      email: string | null;
      phone_number: string | null;
      company_name: string | null;
    } | null;
  } | null;
}
