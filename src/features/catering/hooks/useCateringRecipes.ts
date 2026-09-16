import { useState, useCallback } from 'react';
import { cateringRecipeService } from '../services/catering-recipe.service';
import type { RecipeWithInventory, InventoryItem } from '../types/catering-menu.types';
import type { CateringRecipeFormInput } from '../schemas/catering-menu.schema';

export function useCateringRecipes() {
  const [recipes, setRecipes] = useState<RecipeWithInventory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipesByMenuItemId = useCallback(async (menuItemId: string) => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await cateringRecipeService.getRecipesByMenuItemId(menuItemId);
    if (err) setError(err.message);
    else setRecipes((data as RecipeWithInventory[]) || []);
    setIsLoading(false);
  }, []);

  const fetchInventoryItems = useCallback(async () => {
    const { data, error: err } = await cateringRecipeService.getInventoryItems();
    if (!err && data) setInventoryItems(data as InventoryItem[]);
  }, []);

  const createRecipe = useCallback(async (menuItemId: string, input: CateringRecipeFormInput) => {
    return await cateringRecipeService.createRecipe(menuItemId, input);
  }, []);

  const updateRecipe = useCallback(async (id: string, input: Partial<CateringRecipeFormInput>) => {
    return await cateringRecipeService.updateRecipe(id, input);
  }, []);

  const deleteRecipe = useCallback(async (id: string) => {
    return await cateringRecipeService.deleteRecipe(id);
  }, []);

  return {
    recipes,
    inventoryItems,
    isLoading,
    error,
    fetchRecipesByMenuItemId,
    fetchInventoryItems,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
