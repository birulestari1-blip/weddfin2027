import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export class ClientRepository {
  async getClients(options?: { search?: string; limit?: number; offset?: number }) {
    let query = supabase.from('clients').select('*', { count: 'exact' });

    if (options?.search) {
      query = query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,company_name.ilike.%${options.search}%`);
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

  async getClientById(id: string) {
    return await supabase.from('clients').select('*').eq('id', id).single();
  }

  async createClient(client: Omit<ClientInsert, 'tenant_id'>) {
    return await (supabase as any).from('clients').insert(client).select().single();
  }

  async updateClient(id: string, updates: ClientUpdate) {
    return await (supabase as any).from('clients').update(updates).eq('id', id).select().single();
  }

  async deleteClient(id: string) {
    return await (supabase as any).from('clients').delete().eq('id', id);
  }
}

export const clientRepository = new ClientRepository();
