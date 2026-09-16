import type { Database } from '@/types/database.types';

export type Quotation = Database['public']['Tables']['quotations']['Row'];
export type QuotationInsert = Database['public']['Tables']['quotations']['Insert'];
export type QuotationUpdate = Database['public']['Tables']['quotations']['Update'];

export type QuotationItem = Database['public']['Tables']['quotation_items']['Row'];
export type QuotationItemInsert = Database['public']['Tables']['quotation_items']['Insert'];
export type QuotationItemUpdate = Database['public']['Tables']['quotation_items']['Update'];

export type QuotationStatus = Quotation['status'];

export const QUOTATION_STATUS_VALUES: QuotationStatus[] = [
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'canceled',
];

// Quotation with joined client and items — used in detail/edit views
export interface QuotationWithDetails extends Quotation {
  clients: {
    id: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    company_name: string | null;
  } | null;
  quotation_items: QuotationItem[];
  // booking_id is included in the base Quotation Row from database.types.ts
  // It is nullable; non-null means this quotation was already converted to a booking
}

// Quotation list row — with client joined
export interface QuotationListRow extends Quotation {
  clients: {
    full_name: string;
    company_name: string | null;
  } | null;
}

// Form-level item (before DB insert — no id/tenant_id yet)
export interface QuotationItemDraft {
  id?: string; // present when editing existing item
  service_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  display_order: number;
}
