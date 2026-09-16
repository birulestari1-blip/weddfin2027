import { supabase } from '@/lib/supabase';
import type { TransactionType, FinanceSummary } from '../types/finance.types';

export class FinanceRepository {
  // ─── LIST TRANSACTIONS ────────────────────────────────────────────────────
  async getTransactions(options?: {
    type?: TransactionType;
    bookingId?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = (supabase as any)
      .from('transactions')
      .select(
        `*, 
         vendor_bookings ( id, client_name, event_name ),
         invoices ( id, invoice_number )`,
        { count: 'exact' }
      );

    if (options?.type) query = query.eq('type', options.type);
    if (options?.bookingId) query = query.eq('booking_id', options.bookingId);

    query = query.order('transaction_date', { ascending: false });

    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    return await query;
  }

  // ─── SUMMARY KPI (aggregate from real transactions table) ─────────────────
  async getFinanceSummary(): Promise<{ data: FinanceSummary | null; error: any }> {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .select('type, amount');

    if (error) return { data: null, error };

    const summary: FinanceSummary = {
      totalIncome: 0,
      totalExpense: 0,
      totalPayout: 0,
      netBalance: 0,
    };

    for (const tx of data || []) {
      if (tx.type === 'income') summary.totalIncome += Number(tx.amount);
      else if (tx.type === 'expense') summary.totalExpense += Number(tx.amount);
      else if (tx.type === 'payout') summary.totalPayout += Number(tx.amount);
    }

    summary.netBalance = summary.totalIncome - summary.totalExpense - summary.totalPayout;
    return { data: summary, error: null };
  }

  // ─── TRANSACTIONS BY BOOKING ──────────────────────────────────────────────
  async getTransactionsByBooking(bookingId: string) {
    return await (supabase as any)
      .from('transactions')
      .select('*')
      .eq('booking_id', bookingId)
      .order('transaction_date', { ascending: false });
  }
}

export const financeRepository = new FinanceRepository();
