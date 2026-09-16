import { useState, useCallback } from 'react';
import { invoiceService } from '../services/invoice.service';
import type { Invoice, InvoiceStatus } from '../types/invoice.types';
import type { InvoiceFormInput } from '../schemas/invoice.schema';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(
    async (search?: string, status?: string, limit = 50, offset = 0) => {
      setIsLoading(true);
      setError(null);
      const result = await invoiceService.getInvoices(search, status, limit, offset);
      if (result.error) {
        setError(result.error.message);
      } else {
        setInvoices((result.data as Invoice[]) || []);
        setCount(result.count);
      }
      setIsLoading(false);
    },
    []
  );

  const createInvoice = useCallback(async (input: InvoiceFormInput) => {
    const result = await invoiceService.createInvoice(input);
    if (!result.error) {
      setInvoices((prev) => [result.data as Invoice, ...prev]);
    }
    return { success: !result.error, data: result.data, error: result.error };
  }, []);

  const updateInvoice = useCallback(async (id: string, input: Partial<InvoiceFormInput>) => {
    const result = await invoiceService.updateInvoice(id, input);
    if (!result.error) {
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...result.data } : inv)));
    }
    return { success: !result.error, data: result.data, error: result.error };
  }, []);

  const updateStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    const result = await invoiceService.updateStatus(id, status);
    if (!result.error) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
      );
    }
    return { success: !result.error, error: result.error };
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    const result = await invoiceService.deleteInvoice(id);
    if (result.success) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    }
    return result;
  }, []);

  return {
    invoices,
    count,
    isLoading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    updateStatus,
    deleteInvoice,
  };
}
