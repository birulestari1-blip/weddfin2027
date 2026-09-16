import { supabase } from '@/lib/supabase';
import type { ContractInsert, ContractUpdate } from '../types/contract.types';

export class ContractRepository {
  // ─── LIST ─────────────────────────────────────────────────────────────────
  async getContracts(tenantId: string, limit: number = 50, offset: number = 0) {
    const { data, error, count } = await supabase
      .from('contracts')
      .select(
        `
          *,
          vendor_bookings (
            id,
            client_name,
            event_name,
            event_date,
            clients (
              id,
              full_name,
              company_name,
              email,
              phone_number
            )
          )
        `,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error, count };
  }

  // ─── GET BY ID ────────────────────────────────────────────────────────────
  async getContractById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select(
        `
          *,
          vendor_bookings (
            id,
            client_name,
            event_name,
            event_date,
            clients (
              id,
              full_name,
              company_name,
              email,
              phone_number
            )
          )
        `
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    return { data, error };
  }

  // ─── GET BY BOOKING ID ────────────────────────────────────────────────────
  async getContractByBookingId(bookingId: string, tenantId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    return { data, error };
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async createContract(payload: ContractInsert) {
    const { data, error } = await supabase
      .from('contracts')
      // @ts-ignore
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async updateContract(id: string, tenantId: string, payload: ContractUpdate) {
    const { data, error } = await supabase
      .from('contracts')
      // @ts-ignore
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async deleteContract(id: string, tenantId: string) {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }
}

export const contractRepository = new ContractRepository();
