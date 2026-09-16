import { useState, useCallback } from 'react';
import { financeService } from '../services/finance.service';
import type { TransactionWithDetails, FinanceSummary, TransactionType } from '../types/finance.types';

export function useFinance() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (type?: TransactionType, bookingId?: string, limit = 50, offset = 0) => {
      setIsLoading(true);
      setError(null);
      const result = await financeService.getTransactions(type, bookingId, limit, offset);
      if (result.error) {
        setError(result.error.message);
      } else {
        setTransactions((result.data as TransactionWithDetails[]) || []);
        setCount(result.count);
      }
      setIsLoading(false);
    },
    []
  );

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    const result = await financeService.getFinanceSummary();
    if (result.error) {
      setSummaryError(result.error.message);
    } else {
      setSummary(result.data);
    }
    setSummaryLoading(false);
  }, []);

  return {
    transactions,
    count,
    summary,
    isLoading,
    summaryLoading,
    error,
    summaryError,
    fetchTransactions,
    fetchSummary,
  };
}
