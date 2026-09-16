import { useState, useCallback } from 'react';
import { quotationService } from '../services/quotation.service';
import type { QuotationFormInput } from '../schemas/quotation.schema';
import type { Quotation } from '../types/quotation.types';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuotations = useCallback(
    async (search?: string, status?: string, limit = 50, offset = 0) => {
      setIsLoading(true);
      setError(null);
      const { data, count, error: fetchError } = await quotationService.getQuotations(
        search,
        status,
        limit,
        offset
      );
      if (fetchError) {
        setError(fetchError);
      } else {
        setQuotations(data || []);
        setTotalCount(count);
      }
      setIsLoading(false);
    },
    []
  );

  const createQuotation = async (input: QuotationFormInput) => {
    setIsLoading(true);
    setError(null);
    const { data, error: createError } = await quotationService.createQuotation(input);
    if (createError) {
      setError(createError);
      setIsLoading(false);
      return { success: false, error: createError, data: null };
    }
    setIsLoading(false);
    return { success: true, data };
  };

  const updateQuotation = async (id: string, input: QuotationFormInput) => {
    setIsLoading(true);
    setError(null);
    const { data, error: updateError } = await quotationService.updateQuotation(id, input);
    if (updateError) {
      setError(updateError);
      setIsLoading(false);
      return { success: false, error: updateError, data: null };
    }
    setIsLoading(false);
    return { success: true, data };
  };

  const updateStatus = async (id: string, status: Quotation['status']) => {
    setIsLoading(true);
    setError(null);
    const { data, error: statusError } = await quotationService.updateStatus(id, status);
    if (statusError) {
      setError(statusError);
      setIsLoading(false);
      return { success: false, error: statusError };
    }
    await fetchQuotations();
    return { success: true, data };
  };

  const deleteQuotation = async (id: string) => {
    setIsLoading(true);
    setError(null);
    const { error: deleteError } = await quotationService.deleteQuotation(id);
    if (deleteError) {
      setError(deleteError);
      setIsLoading(false);
      return { success: false, error: deleteError };
    }
    await fetchQuotations();
    return { success: true };
  };

  return {
    quotations,
    totalCount,
    isLoading,
    error,
    fetchQuotations,
    createQuotation,
    updateQuotation,
    updateStatus,
    deleteQuotation,
  };
};
