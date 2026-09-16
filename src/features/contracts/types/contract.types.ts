import type { Database } from '@/types/database.types';

// ─── Row types derived directly from schema ───────────────────────────────────
export type ContractRow = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

// ─── Status enum (exact values from schema CHECK constraint) ─────────────────
// schema: CHECK (status IN ('draft','sent','signed','rejected','void'))
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'rejected' | 'void';

export const CONTRACT_STATUS_VALUES: ContractStatus[] = [
  'draft',
  'sent',
  'signed',
  'rejected',
  'void',
];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Draft',
  sent: 'Dikirim',
  signed: 'Ditandatangani',
  rejected: 'Ditolak',
  void: 'Batal',
};

// ─── Status transition map ────────────────────────────────────────────────────
// Only valid forward transitions are listed; void/signed/rejected have no forward path
export const CONTRACT_STATUS_TRANSITIONS: Partial<Record<ContractStatus, ContractStatus[]>> = {
  draft: ['sent', 'void'],
  sent: ['signed', 'rejected', 'void'],
  rejected: ['draft'],
};

// ─── Joined type for detail views ─────────────────────────────────────────────
// contracts ← vendor_bookings ← clients
export interface ContractWithDetails extends ContractRow {
  vendor_bookings: {
    id: string;
    client_name: string;
    event_name: string | null;
    event_date: string;
    clients: {
      id: string;
      full_name: string;
      company_name: string | null;
      email: string | null;
      phone_number: string | null;
    } | null;
  } | null;
}

// ─── List-optimised type ──────────────────────────────────────────────────────
export interface ContractListRow extends ContractRow {
  vendor_bookings: {
    id: string;
    client_name: string;
    event_name: string | null;
    event_date: string;
  } | null;
}
