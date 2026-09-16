import { supabase } from '@/lib/supabase';
import type {
  Quotation,
  QuotationInsert,
  QuotationUpdate,
  QuotationItemInsert,
  QuotationItemDraft,
} from '../types/quotation.types';

export class QuotationRepository {
  // ─── LIST ─────────────────────────────────────────────────────────────────
  async getQuotations(options?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = (supabase as any)
      .from('quotations')
      .select('*, clients ( full_name, company_name )', { count: 'exact' });

    if (options?.search) {
      query = query.or(
        `quotation_number.ilike.%${options.search}%,title.ilike.%${options.search}%`
      );
    }
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    query = query.order('created_at', { ascending: false });
    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }
    return await query;
  }

  // ─── SINGLE WITH DETAILS ──────────────────────────────────────────────────
  async getQuotationById(id: string) {
    return await (supabase as any)
      .from('quotations')
      .select(
        '*, clients ( id, full_name, email, phone_number, company_name ), quotation_items ( * )'
      )
      .eq('id', id)
      .order('display_order', { foreignTable: 'quotation_items', ascending: true })
      .single();
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async createQuotation(
    quotation: Omit<QuotationInsert, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<QuotationItemInsert, 'id' | 'quotation_id' | 'created_at'>[]
  ) {
    const { data: newQuotation, error: quotationError } = await (supabase as any)
      .from('quotations')
      .insert(quotation)
      .select()
      .single();

    if (quotationError) return { data: null, error: quotationError };

    if (items.length > 0) {
      const itemsWithId = items.map((item, idx) => ({
        ...item,
        quotation_id: newQuotation.id,
        display_order: item.display_order ?? idx,
      }));
      const { error: itemsError } = await (supabase as any)
        .from('quotation_items')
        .insert(itemsWithId);

      if (itemsError) {
        await (supabase as any).from('quotations').delete().eq('id', newQuotation.id);
        return { data: null, error: itemsError };
      }
    }

    return { data: newQuotation as Quotation, error: null };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async updateQuotation(
    id: string,
    updates: QuotationUpdate,
    items?: QuotationItemDraft[]
  ) {
    const { data: updatedQuotation, error: quotationError } = await (supabase as any)
      .from('quotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (quotationError) return { data: null, error: quotationError };

    if (items !== undefined) {
      const { error: deleteError } = await (supabase as any)
        .from('quotation_items')
        .delete()
        .eq('quotation_id', id);

      if (deleteError) return { data: null, error: deleteError };

      if (items.length > 0) {
        const itemsForInsert = items.map((item, idx) => ({
          tenant_id: updatedQuotation.tenant_id,
          quotation_id: id,
          service_id: item.service_id || null,
          item_name: item.item_name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          line_total: item.line_total,
          display_order: item.display_order ?? idx,
        }));

        const { error: itemsError } = await (supabase as any)
          .from('quotation_items')
          .insert(itemsForInsert);

        if (itemsError) return { data: null, error: itemsError };
      }
    }

    return { data: updatedQuotation as Quotation, error: null };
  }

  // ─── STATUS UPDATE ────────────────────────────────────────────────────────
  async updateStatus(id: string, status: Quotation['status']) {
    return await (supabase as any)
      .from('quotations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async deleteQuotation(id: string) {
    return await (supabase as any).from('quotations').delete().eq('id', id);
  }

  // ─── GENERATE QUOTATION NUMBER ────────────────────────────────────────────
  async getNextQuotationNumber(tenantId: string): Promise<string> {
    const { count } = await (supabase as any)
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const next = (count || 0) + 1;
    const date = new Date();
    return `QUO/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(next).padStart(4, '0')}`;
  }
}

export const quotationRepository = new QuotationRepository();
