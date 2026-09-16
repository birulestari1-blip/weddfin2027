import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type VendorService = Database['public']['Tables']['vendor_services']['Row'];
export type VendorServiceInsert = Database['public']['Tables']['vendor_services']['Insert'];
export type VendorServiceUpdate = Database['public']['Tables']['vendor_services']['Update'];

export class ServiceRepository {
  async getServices(options?: { search?: string; isActive?: boolean; limit?: number; offset?: number }) {
    let query = supabase.from('vendor_services').select('*', { count: 'exact' });

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
      if (options?.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      }
    }

    // Always sort by newest
    query = query.order('created_at', { ascending: false });

    return await query;
  }

  async getServiceById(id: string) {
    return await supabase.from('vendor_services').select('*').eq('id', id).single();
  }

  async createService(service: Omit<VendorServiceInsert, 'tenant_id'>) {
    return await (supabase as any).from('vendor_services').insert(service).select().single();
  }

  async updateService(id: string, updates: VendorServiceUpdate) {
    return await (supabase as any).from('vendor_services').update(updates).eq('id', id).select().single();
  }

  async deleteService(id: string) {
    return await (supabase as any).from('vendor_services').delete().eq('id', id);
  }
}

export const serviceRepository = new ServiceRepository();
