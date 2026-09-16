import { useState, useCallback } from 'react';
import { cateringMenuItemService } from '../services/catering-menu-item.service';
import type { MenuItemWithRecipes } from '../types/catering-menu.types';
import type { CateringMenuItemFormInput } from '../schemas/catering-menu.schema';

export function useCateringMenuItems() {
  const [items, setItems] = useState<MenuItemWithRecipes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItemsByMenuId = useCallback(async (menuId: string) => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await cateringMenuItemService.getItemsByMenuId(menuId);
    if (err) setError(err.message);
    else setItems((data as MenuItemWithRecipes[]) || []);
    setIsLoading(false);
  }, []);

  const createItem = useCallback(async (menuId: string, input: CateringMenuItemFormInput) => {
    return await cateringMenuItemService.createItem(menuId, input);
  }, []);

  const updateItem = useCallback(async (id: string, input: Partial<CateringMenuItemFormInput>) => {
    return await cateringMenuItemService.updateItem(id, input);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    return await cateringMenuItemService.deleteItem(id);
  }, []);

  return {
    items,
    isLoading,
    error,
    fetchItemsByMenuId,
    createItem,
    updateItem,
    deleteItem,
  };
}
