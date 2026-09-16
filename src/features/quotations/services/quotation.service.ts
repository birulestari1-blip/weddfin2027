import { quotationRepository, QuotationRepository } from '../repositories/quotation.repository';
import { quotationSchema, QuotationFormInput } from '../schemas/quotation.schema';
import { authService } from '@/features/auth/services/auth.service';
import type { Quotation, QuotationItemDraft } from '../types/quotation.types';

export class QuotationService {
  constructor(private readonly repo: QuotationRepository = quotationRepository) {}

  async getQuotations(search?: string, status?: string, limit = 50, offset = 0) {
    const { data, error, count } = await this.repo.getQuotations({ search, status, limit, offset });
    if (error) return { data: null, count: 0, error };
    return { data, count: count || 0, error: null };
  }

  async getQuotationById(id: string) {
    const { data, error } = await this.repo.getQuotationById(id);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async createQuotation(input: QuotationFormInput) {
    // 1. Validate
    const validation = quotationSchema.safeParse(input);
    if (!validation.success) {
      return {
        data: null,
        error: new Error(validation.error.errors[0]?.message || 'Invalid quotation data'),
      };
    }

    // 2. Get tenant context securely
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
      return { data: null, error: new Error('Unauthorized: no tenant context') };
    }

    const { items, ...quotationFields } = validation.data;

    // 3. Clean empty strings
    const cleanQuotation = {
      ...quotationFields,
      tenant_id: profile.tenant_id,
      client_id: quotationFields.client_id || null,
      valid_until: quotationFields.valid_until || null,
      notes: quotationFields.notes || null,
    };

    const cleanItems = items.map((item, idx) => ({
      tenant_id: profile.tenant_id,
      service_id: item.service_id || null,
      item_name: item.item_name,
      description: item.description || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      line_total: item.line_total,
      display_order: item.display_order ?? idx,
    }));

    return await this.repo.createQuotation(cleanQuotation, cleanItems);
  }

  async updateQuotation(id: string, input: QuotationFormInput) {
    const validation = quotationSchema.safeParse(input);
    if (!validation.success) {
      return {
        data: null,
        error: new Error(validation.error.errors[0]?.message || 'Invalid quotation data'),
      };
    }

    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
      return { data: null, error: new Error('Unauthorized: no tenant context') };
    }

    const { items, ...quotationFields } = validation.data;

    const updates = {
      client_id: quotationFields.client_id || null,
      quotation_number: quotationFields.quotation_number,
      title: quotationFields.title,
      subtotal: quotationFields.subtotal,
      discount_amount: quotationFields.discount_amount,
      tax_amount: quotationFields.tax_amount,
      total_amount: quotationFields.total_amount,
      valid_until: quotationFields.valid_until || null,
      status: quotationFields.status,
      notes: quotationFields.notes || null,
    };

    const cleanItems: QuotationItemDraft[] = items.map((item, idx) => ({
      service_id: item.service_id || null,
      item_name: item.item_name,
      description: item.description || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      line_total: item.line_total,
      display_order: item.display_order ?? idx,
    }));

    return await this.repo.updateQuotation(id, updates, cleanItems);
  }

  async updateStatus(id: string, status: Quotation['status']) {
    const { data, error } = await this.repo.updateStatus(id, status);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async deleteQuotation(id: string) {
    const { error } = await this.repo.deleteQuotation(id);
    return { error };
  }

  async generateQuotationNumber(tenantId: string) {
    return await this.repo.getNextQuotationNumber(tenantId);
  }

  // ─── Calculation helpers ──────────────────────────────────────────────────

  calculateItemLineTotal(quantity: number, unitPrice: number, discountAmount: number): number {
    const gross = Math.round(quantity * unitPrice * 100) / 100;
    const discount = Math.min(discountAmount, gross);
    return Math.max(0, Math.round((gross - discount) * 100) / 100);
  }

  calculateTotals(
    items: Array<{ line_total: number }>,
    discountAmount: number,
    taxAmount: number
  ) {
    const subtotal = Math.round(
      items.reduce((sum, item) => sum + item.line_total, 0) * 100
    ) / 100;
    const discount = Math.min(discountAmount, subtotal);
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxAmount * 100) / 100;
    const total = Math.round((afterDiscount + tax) * 100) / 100;
    return { subtotal, total };
  }
}

export const quotationService = new QuotationService();
