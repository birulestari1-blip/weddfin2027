import type { Database } from '@/types/database.types';

type BookingRow = Database['public']['Tables']['vendor_bookings']['Row'];

export type BookingStatus = Database['public']['Enums']['booking_status_enum'];
export type PaymentStatus = Database['public']['Enums']['payment_status_enum'];

export const BOOKING_STATUS_VALUES: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'canceled',
];

export const PAYMENT_STATUS_VALUES: PaymentStatus[] = [
  'unpaid',
  'dp_paid',
  'fully_paid',
  'refunded',
];

// Base Booking Model
export type Booking = BookingRow;

// Booking joined with common references (client, service, team, quotation, etc)
export interface BookingWithDetails extends Booking {
  clients?: {
    id: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    company_name: string | null;
  } | null;
  vendor_services?: {
    id: string;
    name: string;
  } | null;
  booking_workflow_states?: {
    id: string;
    current_stage_id: string | null;
    workflow_stages?: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
}

// Data needed to create a booking
export type BookingInsert = Database['public']['Tables']['vendor_bookings']['Insert'];

// Data needed to update a booking
export type BookingUpdate = Database['public']['Tables']['vendor_bookings']['Update'];
