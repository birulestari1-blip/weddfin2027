import { useState, useCallback } from 'react';
import { photographyEquipmentService } from '../services/photography-equipment.service';
import type { PhotographyEquipment } from '../types/photography.types';
import type { PhotographyEquipmentFormInput } from '../schemas/photography.schema';

interface EquipmentStats {
  total: number;
  available: number;
  maintenance: number;
  damaged: number;
  reserved: number;
}

export function usePhotographyEquipment() {
  const [equipment, setEquipment] = useState<PhotographyEquipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await photographyEquipmentService.getAll();
    if (result.success) {
      setEquipment((result.data as PhotographyEquipment[]) ?? []);
    } else {
      setError(result.error?.message ?? 'Failed to load equipment');
    }
    setIsLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const result = await photographyEquipmentService.getOverviewStats();
    if (!result.error) {
      setStats({
        total: result.total,
        available: result.available,
        maintenance: result.maintenance,
        damaged: result.damaged,
        reserved: result.reserved,
      });
    }
  }, []);

  const createEquipment = useCallback(async (payload: PhotographyEquipmentFormInput) => {
    const result = await photographyEquipmentService.create(payload);
    if (result.success) await fetchAll();
    return result;
  }, [fetchAll]);

  const updateEquipment = useCallback(async (id: string, payload: PhotographyEquipmentFormInput) => {
    const result = await photographyEquipmentService.update(id, payload);
    if (result.success) await fetchAll();
    return result;
  }, [fetchAll]);

  const deleteEquipment = useCallback(async (id: string) => {
    const result = await photographyEquipmentService.delete(id);
    if (result.success) await fetchAll();
    return result;
  }, [fetchAll]);

  return {
    equipment,
    stats,
    isLoading,
    error,
    fetchAll,
    fetchStats,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}
