import type { Database } from '@/types/database.types';

// ─── RAW DB TYPES ────────────────────────────────────────────────────────────
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

// ─── TRANSACTION TYPE ENUM ───────────────────────────────────────────────────
// Actual enum from 002_enums.sql: 'income' | 'expense' | 'payout'
export type TransactionType = Database['public']['Enums']['transaction_type_enum'];

export const TRANSACTION_TYPE_VALUES: TransactionType[] = ['income', 'expense', 'payout'];

// ─── JOINED TYPE FOR LIST/DETAIL ─────────────────────────────────────────────
export interface TransactionWithDetails extends Transaction {
  vendor_bookings?: {
    id: string;
    client_name: string;
    event_name: string | null;
  } | null;
  invoices?: {
    id: string;
    invoice_number: string;
  } | null;
  profiles?: {
    id: string;
    full_name: string | null;
  } | null;
}

// ─── FINANCE KPI SUMMARY ─────────────────────────────────────────────────────
// Computed from real schema fields — no invented columns
export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  totalPayout: number;
  netBalance: number;
}
