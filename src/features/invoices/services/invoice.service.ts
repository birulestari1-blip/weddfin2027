import { invoiceRepository, InvoiceRepository } from '../repositories/invoice.repository';
import { invoiceSchema, InvoiceFormInput } from '../schemas/invoice.schema';
import { authService } from '@/features/auth/services/auth.service';
import type { InvoiceStatus } from '../types/invoice.types';

export class InvoiceService {
  constructor(private readonly repo: InvoiceRepository = invoiceRepository) {}

  async getInvoices(search?: string, status?: string, limit = 50, offset = 0) {
    const { data, error, count } = await this.repo.getInvoices({ search, status, limit, offset });
    if (error) return { data: null, count: 0, error };
    return { data, count: count || 0, error: null };
  }

  async getInvoicesByBooking(bookingId: string) {
    const { data, error } = await this.repo.getInvoicesByBooking(bookingId);
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  }

  async getInvoiceById(id: string) {
    const { data, error } = await this.repo.getInvoiceById(id);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async createInvoice(input: InvoiceFormInput) {
    // 1. Validate
    const validation = invoiceSchema.safeParse(input);
    if (!validation.success) {
      return {
        data: null,
        error: new Error(validation.error.errors[0]?.message || 'Invalid invoice data'),
      };
    }

    // 2. Get tenant from auth — never trust client input
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
      return { data: null, error: new Error('Unauthorized: no tenant context') };
    }

    const clean = {
      ...validation.data,
      tenant_id: profile.tenant_id,
      payment_link: validation.data.payment_link || null,
      payment_reference_id: validation.data.payment_reference_id || null,
      payment_method: validation.data.payment_method || null,
      paid_at: validation.data.paid_at || null,
      notes: validation.data.notes || null,
    };

    const { data, error } = await this.repo.createInvoice(clean as any);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateInvoice(id: string, input: Partial<InvoiceFormInput>) {
    const partial = invoiceSchema.partial().safeParse(input);
    if (!partial.success) {
      return {
        data: null,
        error: new Error(partial.error.errors[0]?.message || 'Invalid invoice update data'),
      };
    }

    const clean = Object.fromEntries(
      Object.entries(partial.data).map(([k, v]) => [k, v === '' ? null : v])
    );

    const { data, error } = await this.repo.updateInvoice(id, clean);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    const updates: any = { status };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    return this.updateInvoice(id, updates);
  }

  async deleteInvoice(id: string) {
    // Business rule: paid invoices should not be deleted
    const { data: invoice } = await this.getInvoiceById(id);
    if (invoice?.status === 'paid') {
      return { success: false, error: new Error('Paid invoices cannot be deleted.') };
    }
    const { error } = await this.repo.deleteInvoice(id);
    return { success: !error, error };
  }

  async generateInvoiceNumber(tenantId: string) {
    return await this.repo.getNextInvoiceNumber(tenantId);
  }
}

export const invoiceService = new InvoiceService();
