import { supabase } from '@/lib/supabase';
import type { CateringRecipeInsert, CateringRecipeUpdate } from '../types/catering-menu.types';

export class CateringRecipeRepository {
  async getRecipesByMenuItemId(menuItemId: string, tenantId: string) {
    const { data, error } = await supabase
      .from('catering_recipes')
      .select(`
        *,
        inventory_item:inventory_items (
          id, name, unit, current_stock, minimum_stock, status
        )
      `)
      .eq('menu_item_id', menuItemId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });

    return { data, error };
  }

  async createRecipe(payload: CateringRecipeInsert) {
    const { data, error } = await supabase
      .from('catering_recipes')
      // @ts-ignore
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  async updateRecipe(id: string, tenantId: string, payload: CateringRecipeUpdate) {
    const { data, error } = await supabase
      .from('catering_recipes')
      // @ts-ignore
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  async deleteRecipe(id: string, tenantId: string) {
    const { error } = await supabase
      .from('catering_recipes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }

  /** Fetch all inventory items for this tenant (to populate ingredient picker) */
  async getInventoryItems(tenantId: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name, unit, current_stock, minimum_stock, status, sku')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('name', { ascending: true });

    return { data, error };
  }
}

export const cateringRecipeRepository = new CateringRecipeRepository();
