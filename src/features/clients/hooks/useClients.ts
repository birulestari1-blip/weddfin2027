import { useState, useCallback } from 'react';
import { clientService } from '../services/client.service';
import type { Client } from '../repositories/client.repository';
import type { ClientInput } from '../schemas/client.schema';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async (search?: string, limit = 50, offset = 0) => {
    setIsLoading(true);
    setError(null);
    const { data, count, error: fetchError } = await clientService.getClients(search, limit, offset);
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setClients(data || []);
      setTotalCount(count);
    }
    setIsLoading(false);
  }, []);

  const createClient = async (input: ClientInput) => {
    setIsLoading(true);
    setError(null);
    const { data, error: createError } = await clientService.createClient(input);
    
    if (createError) {
      setError(createError);
      setIsLoading(false);
      return { success: false, error: createError };
    }
    
    // Refresh list on success
    await fetchClients();
    return { success: true, data };
  };

  const updateClient = async (id: string, input: Partial<ClientInput>) => {
    setIsLoading(true);
    setError(null);
    const { data, error: updateError } = await clientService.updateClient(id, input);
    
    if (updateError) {
      setError(updateError);
      setIsLoading(false);
      return { success: false, error: updateError };
    }
    
    // Refresh list on success
    await fetchClients();
    return { success: true, data };
  };

  const deleteClient = async (id: string) => {
    setIsLoading(true);
    setError(null);
    const { error: deleteError } = await clientService.deleteClient(id);
    
    if (deleteError) {
      setError(deleteError);
      setIsLoading(false);
      return { success: false, error: deleteError };
    }
    
    // Refresh list on success
    await fetchClients();
    return { success: true };
  };

  return {
    clients,
    totalCount,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
};
