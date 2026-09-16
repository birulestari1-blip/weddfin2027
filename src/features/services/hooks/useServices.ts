import { useState, useCallback } from 'react';
import { vendorServiceService } from '../services/service.service';
import type { VendorService } from '../repositories/service.repository';
import type { ServiceInput } from '../schemas/service.schema';

export const useServices = () => {
  const [services, setServices] = useState<VendorService[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchServices = useCallback(async (search?: string, isActive?: boolean, limit = 50, offset = 0) => {
    setIsLoading(true);
    setError(null);
    const { data, count, error: fetchError } = await vendorServiceService.getServices(search, isActive, limit, offset);
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setServices(data || []);
      setTotalCount(count);
    }
    setIsLoading(false);
  }, []);

  const createService = async (input: ServiceInput) => {
    setIsLoading(true);
    setError(null);
    const { data, error: createError } = await vendorServiceService.createService(input);
    
    if (createError) {
      setError(createError);
      setIsLoading(false);
      return { success: false, error: createError };
    }
    
    await fetchServices();
    return { success: true, data };
  };

  const updateService = async (id: string, input: Partial<ServiceInput>) => {
    setIsLoading(true);
    setError(null);
    const { data, error: updateError } = await vendorServiceService.updateService(id, input);
    
    if (updateError) {
      setError(updateError);
      setIsLoading(false);
      return { success: false, error: updateError };
    }
    
    await fetchServices();
    return { success: true, data };
  };

  const deleteService = async (id: string) => {
    setIsLoading(true);
    setError(null);
    const { error: deleteError } = await vendorServiceService.deleteService(id);
    
    if (deleteError) {
      setError(deleteError);
      setIsLoading(false);
      return { success: false, error: deleteError };
    }
    
    await fetchServices();
    return { success: true };
  };

  return {
    services,
    totalCount,
    isLoading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};
