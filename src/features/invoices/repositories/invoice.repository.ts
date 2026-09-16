import { supabase } from '@/lib/supabase';
import type { InvoiceInsert, InvoiceUpdate } from '../types/invoice.types';

export class InvoiceRepository {
  // ─── LIST ─────────────────────────────────────────────────────────────────
  async getInvoices(options?: { search?: string; status?: string; limit?: number; offset?: number }) {
    let query = (supabase as any)
      .from('invoices')
      .select(
        `*, vendor_bookings ( id, client_name, event_name, event_date, status )`,
        { count: 'exact' }
      );

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    if (options?.search) {
      query = query.ilike('invoice_number', `%${options.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    return await query;
  }

  // ─── INVOICES FOR A BOOKING ───────────────────────────────────────────────
  async getInvoicesByBooking(bookingId: string) {
    return await (supabase as any)
      .from('invoices')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
  }

  // ─── SINGLE WITH DETAILS ──────────────────────────────────────────────────
  async getInvoiceById(id: string) {
    return await (supabase as any)
      .from('invoices')
      .select(
        `*, 
         vendor_bookings ( 
           id, client_name, client_email, client_phone, event_name, event_date, status,
           clients ( id, full_name, email, phone_number, company_name )
         )`
      )
      .eq('id', id)
      .single();
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async createInvoice(invoice: Omit<InvoiceInsert, 'id' | 'created_at' | 'updated_at'>) {
    return await (supabase as any)
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async updateInvoice(id: string, updates: InvoiceUpdate) {
    return await (supabase as any)
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async deleteInvoice(id: string) {
    return await (supabase as any).from('invoices').delete().eq('id', id);
  }

  // ─── GENERATE INVOICE NUMBER ──────────────────────────────────────────────
  async getNextInvoiceNumber(tenantId: string): Promise<string> {
    const { count } = await (supabase as any)
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    const next = (count || 0) + 1;
    const d = new Date();
    return `INV/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(next).padStart(4, '0')}`;
  }
}

export const invoiceRepository = new InvoiceRepository();
