import { supabase } from '@/lib/supabase';
import type { CateringMenuItemInsert, CateringMenuItemUpdate } from '../types/catering-menu.types';

export class CateringMenuItemRepository {
  async getItemsByMenuId(menuId: string, tenantId: string) {
    const { data, error } = await supabase
      .from('catering_menu_items')
      .select(`
        *,
        catering_recipes (
          *,
          inventory_item:inventory_items (*)
        )
      `)
      .eq('menu_id', menuId)
      .eq('tenant_id', tenantId)
      .order('display_order', { ascending: true });

    return { data, error };
  }

  async getItemById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from('catering_menu_items')
      .select(`
        *,
        catering_recipes (
          *,
          inventory_item:inventory_items (*)
        )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    return { data, error };
  }

  async createItem(payload: CateringMenuItemInsert) {
    const { data, error } = await supabase
      .from('catering_menu_items')
      // @ts-ignore
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  async updateItem(id: string, tenantId: string, payload: CateringMenuItemUpdate) {
    const { data, error } = await supabase
      .from('catering_menu_items')
      // @ts-ignore
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  async deleteItem(id: string, tenantId: string) {
    const { error } = await supabase
      .from('catering_menu_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }
}

export const cateringMenuItemRepository = new CateringMenuItemRepository();
