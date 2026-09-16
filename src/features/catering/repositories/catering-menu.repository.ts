import { supabase } from '@/lib/supabase';
import type { CateringMenuInsert, CateringMenuUpdate } from '../types/catering-menu.types';

export class CateringMenuRepository {
  // ─── MENUS ───────────────────────────────────────────────────────────────────

  async getMenus(tenantId: string, limit = 50, offset = 0) {
    const { data, error, count } = await supabase
      .from('catering_menus')
      .select('*, catering_menu_items(id)', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error, count };
  }

  async getMenuById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from('catering_menus')
      .select(
        `
        *,
        catering_menu_items (
          *,
          catering_recipes (
            *,
            inventory_item:inventory_items (*)
          )
        )
      `
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    return { data, error };
  }

  async createMenu(payload: CateringMenuInsert) {
    const { data, error } = await supabase
      .from('catering_menus')
      // @ts-ignore
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  async updateMenu(id: string, tenantId: string, payload: CateringMenuUpdate) {
    const { data, error } = await supabase
      .from('catering_menus')
      // @ts-ignore
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  async deleteMenu(id: string, tenantId: string) {
    const { error } = await supabase
      .from('catering_menus')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }

  // ─── OVERVIEW STATS ──────────────────────────────────────────────────────────

  async getOverviewStats(tenantId: string) {
    const [menusRes, activeMenusRes, itemsRes, recipesRes] = await Promise.all([
      supabase
        .from('catering_menus')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
      supabase
        .from('catering_menus')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('is_active', true),
      supabase
        .from('catering_menu_items')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
      supabase
        .from('catering_recipes')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
    ]);

    return {
      totalMenus: menusRes.count ?? 0,
      activeMenus: activeMenusRes.count ?? 0,
      totalItems: itemsRes.count ?? 0,
      totalRecipes: recipesRes.count ?? 0,
      error:
        menusRes.error || activeMenusRes.error || itemsRes.error || recipesRes.error || null,
    };
  }

  // ─── LOW STOCK INGREDIENTS ────────────────────────────────────────────────────

  async getLowStockIngredients(tenantId: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name, unit, current_stock, minimum_stock')
      .eq('tenant_id', tenantId)
      .filter('current_stock', 'lte', 'minimum_stock')
      .eq('status', 'active')
      .order('current_stock', { ascending: true })
      .limit(20);

    return { data, error };
  }
}

export const cateringMenuRepository = new CateringMenuRepository();
