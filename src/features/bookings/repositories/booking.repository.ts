import { supabase } from '@/lib/supabase';
import type { Booking, BookingInsert, BookingUpdate } from '../types/booking.types';

export class BookingRepository {
  // ─── LIST ─────────────────────────────────────────────────────────────────
  async getBookings(options?: { search?: string; status?: string; limit?: number; offset?: number }) {
    let query = (supabase as any)
      .from('vendor_bookings')
      .select(`*, clients ( full_name, company_name ), vendor_services ( name )`, {
        count: 'exact',
      });

    if (options?.search) {
      query = query.or(
        `client_name.ilike.%${options.search}%,event_name.ilike.%${options.search}%`
      );
    }
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    return await query;
  }

  // ─── SINGLE WITH DETAILS ──────────────────────────────────────────────────
  async getBookingById(id: string) {
    return await (supabase as any)
      .from('vendor_bookings')
      .select(
        `*, 
         clients ( id, full_name, email, phone_number, company_name ), 
         vendor_services ( id, name ),
         booking_workflow_states ( 
           id, current_stage_id, 
           workflow_stages ( id, name, code ) 
         ),
         project_team_assignments (
           id, role_in_project, profile_id, assigned_at
         )`
      )
      .eq('id', id)
      .single();
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async createBooking(booking: Omit<BookingInsert, 'id' | 'created_at' | 'updated_at'>, sourceQuotationId?: string) {
    // 1. Create booking
    const { data: newBooking, error: bookingError } = await (supabase as any)
      .from('vendor_bookings')
      .insert(booking)
      .select()
      .single();

    if (bookingError) return { data: null, error: bookingError };

    // 2. If a quotation was the source, link it
    if (sourceQuotationId) {
      const { error: quotationError } = await (supabase as any)
        .from('quotations')
        .update({ booking_id: newBooking.id })
        .eq('id', sourceQuotationId);

      if (quotationError) {
        // Simple rollback mechanism for now
        await (supabase as any).from('vendor_bookings').delete().eq('id', newBooking.id);
        return { data: null, error: quotationError };
      }
    }

    return { data: newBooking as Booking, error: null };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async updateBooking(id: string, updates: BookingUpdate) {
    return await (supabase as any)
      .from('vendor_bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  // ─── SOURCE QUOTATION ────────────────────────────────────────────────────
  // Finds the quotation that was converted into this booking, if any.
  // The relationship is: quotations.booking_id → vendor_bookings.id
  async getSourceQuotation(bookingId: string) {
    return await (supabase as any)
      .from('quotations')
      .select('id, quotation_number, title, total_amount, status, client_id, clients ( full_name )')
      .eq('booking_id', bookingId)
      .maybeSingle();
  }

  // ─── CHECK QUOTATION ELIGIBILITY ─────────────────────────────────────────
  // Used by BookingService to verify a quotation is eligible before conversion.
  async getQuotationForConversion(quotationId: string) {
    return await (supabase as any)
      .from('quotations')
      .select('id, status, booking_id')
      .eq('id', quotationId)
      .single();
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async deleteBooking(id: string) {
    return await (supabase as any).from('vendor_bookings').delete().eq('id', id);
  }
}

export const bookingRepository = new BookingRepository();
