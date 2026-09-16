import { financeRepository, FinanceRepository } from '../repositories/finance.repository';
import type { TransactionType } from '../types/finance.types';

export class FinanceService {
  constructor(private readonly repo: FinanceRepository = financeRepository) {}

  async getTransactions(type?: TransactionType, bookingId?: string, limit = 50, offset = 0) {
    const { data, error, count } = await this.repo.getTransactions({ type, bookingId, limit, offset });
    if (error) return { data: null, count: 0, error };
    return { data, count: count || 0, error: null };
  }

  async getFinanceSummary() {
    const { data, error } = await this.repo.getFinanceSummary();
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async getTransactionsByBooking(bookingId: string) {
    const { data, error } = await this.repo.getTransactionsByBooking(bookingId);
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  }
}

export const financeService = new FinanceService();
