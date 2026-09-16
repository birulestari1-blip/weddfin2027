import { useState, useCallback } from 'react';
import { cateringMenuService } from '../services/catering-menu.service';
import type { CateringMenu } from '../types/catering-menu.types';
import type { CateringMenuFormInput } from '../schemas/catering-menu.schema';

interface OverviewStats {
  totalMenus: number;
  activeMenus: number;
  totalItems: number;
  totalRecipes: number;
}

export function useCateringMenus() {
  const [menus, setMenus] = useState<CateringMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);

  const fetchMenus = useCallback(async (limit = 50, offset = 0) => {
    setIsLoading(true);
    setError(null);
    const { data, error: err, count: total } = await cateringMenuService.getMenus(limit, offset);
    if (err) setError(err.message);
    else {
      setMenus((data as CateringMenu[]) || []);
      setCount(total || 0);
    }
    setIsLoading(false);
  }, []);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    const result = await cateringMenuService.getOverviewStats();
    if (result.error) setError(result.error.message);
    else setOverviewStats(result);
    setIsLoading(false);
  }, []);

  const createMenu = useCallback(async (input: CateringMenuFormInput) => {
    return await cateringMenuService.createMenu(input);
  }, []);

  const updateMenu = useCallback(async (id: string, input: Partial<CateringMenuFormInput>) => {
    return await cateringMenuService.updateMenu(id, input);
  }, []);

  const deleteMenu = useCallback(async (id: string) => {
    return await cateringMenuService.deleteMenu(id);
  }, []);

  const toggleActive = useCallback(async (id: string, is_active: boolean) => {
    return await cateringMenuService.updateMenu(id, { is_active });
  }, []);

  return {
    menus,
    count,
    isLoading,
    error,
    overviewStats,
    fetchMenus,
    fetchOverview,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleActive,
  };
}
