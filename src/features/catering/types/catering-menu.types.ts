import type { Database } from '@/types/database.types';

export type CateringMenu = Database['public']['Tables']['catering_menus']['Row'];
export type CateringMenuInsert = Database['public']['Tables']['catering_menus']['Insert'];
export type CateringMenuUpdate = Database['public']['Tables']['catering_menus']['Update'];

export type CateringMenuItem = Database['public']['Tables']['catering_menu_items']['Row'];
export type CateringMenuItemInsert = Database['public']['Tables']['catering_menu_items']['Insert'];
export type CateringMenuItemUpdate = Database['public']['Tables']['catering_menu_items']['Update'];

export type CateringRecipe = Database['public']['Tables']['catering_recipes']['Row'];
export type CateringRecipeInsert = Database['public']['Tables']['catering_recipes']['Insert'];
export type CateringRecipeUpdate = Database['public']['Tables']['catering_recipes']['Update'];

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];

/** Recipe row joined with its inventory item detail */
export interface RecipeWithInventory extends CateringRecipe {
  inventory_item: InventoryItem | null;
}

/** Menu item row joined with its recipes */
export interface MenuItemWithRecipes extends CateringMenuItem {
  catering_recipes: RecipeWithInventory[];
}

/** Menu row joined with its items */
export interface CateringMenuWithItems extends CateringMenu {
  catering_menu_items: MenuItemWithRecipes[];
}

/** Stock status helper */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(current: number, minimum: number): StockStatus {
  if (current <= 0) return 'out_of_stock';
  if (current <= minimum) return 'low_stock';
  return 'in_stock';
}

export interface IngredientRequirement {
  inventory_item_id: string;
  name: string;
  unit: string;
  quantity_per_pax: number;
  current_stock: number;
  minimum_stock: number;
  stock_status: StockStatus;
  required_for_pax?: (pax: number) => number;
}
