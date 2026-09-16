import { useState, useCallback } from 'react';
import { contractService } from '../services/contract.service';
import type { ContractWithDetails, ContractStatus } from '../types/contract.types';
import type { ContractFormInput } from '../schemas/contract.schema';

export const useContracts = () => {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async (limit: number = 50, offset: number = 0) => {
    setIsLoading(true);
    setError(null);
    const { data, count: totalCount, error: err } = await contractService.getContracts(limit, offset);
    setIsLoading(false);
    
    if (err) {
      setError(err.message);
      return;
    }
    
    setContracts((data as unknown as ContractWithDetails[]) || []);
    setCount(totalCount || 0);
  }, []);

  const createContract = async (input: ContractFormInput) => {
    const res = await contractService.createContract(input);
    if (res.success) fetchContracts();
    return res;
  };

  const updateContract = async (id: string, input: Partial<ContractFormInput>) => {
    const res = await contractService.updateContract(id, input);
    if (res.success) fetchContracts();
    return res;
  };

  const updateStatus = async (id: string, status: ContractStatus) => {
    const res = await contractService.updateStatus(id, status);
    if (res.success) fetchContracts();
    return res;
  };

  const deleteContract = async (id: string) => {
    const res = await contractService.deleteContract(id);
    if (res.success) fetchContracts();
    return res;
  };

  return {
    contracts,
    count,
    isLoading,
    error,
    fetchContracts,
    createContract,
    updateContract,
    updateStatus,
    deleteContract,
  };
};
