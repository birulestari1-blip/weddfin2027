import { bookingRepository, BookingRepository } from '../repositories/booking.repository';
import { bookingSchema, BookingFormInput } from '../schemas/booking.schema';
import { authService } from '@/features/auth/services/auth.service';
import type { BookingStatus } from '../types/booking.types';

export class BookingService {
  constructor(private readonly repo: BookingRepository = bookingRepository) {}

  async getBookings(search?: string, status?: string, limit = 50, offset = 0) {
    const { data, error, count } = await this.repo.getBookings({ search, status, limit, offset });
    if (error) return { data: null, count: 0, error };
    return { data, count: count || 0, error: null };
  }

  async getBookingById(id: string) {
    const { data, error } = await this.repo.getBookingById(id);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async getSourceQuotation(bookingId: string) {
    const { data, error } = await this.repo.getSourceQuotation(bookingId);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async createBooking(input: BookingFormInput) {
    // 1. Validate form input
    const validation = bookingSchema.safeParse(input);
    if (!validation.success) {
      return { data: null, error: new Error(validation.error.errors[0]?.message || 'Invalid booking data') };
    }

    // 2. Get session & tenant — never trust tenant_id from client input
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
      return { data: null, error: new Error('Unauthorized: no tenant context found') };
    }

    const { source_quotation_id, ...bookingData } = validation.data;

    // 3. Verify quotation eligibility through the repository (keeps supabase out of service)
    if (source_quotation_id) {
      const { data: existingQuotation, error: qErr } = await this.repo.getQuotationForConversion(source_quotation_id);

      if (qErr) {
        return { data: null, error: new Error(`Failed to verify quotation: ${qErr.message}`) };
      }
      if (!existingQuotation) {
        return { data: null, error: new Error('Quotation not found.') };
      }
      if (existingQuotation.booking_id) {
        return { data: null, error: new Error('This quotation has already been converted to a booking.') };
      }
      if (existingQuotation.status !== 'accepted') {
        return { data: null, error: new Error(`Only accepted quotations can be converted. Current status: "${existingQuotation.status}".`) };
      }
    }

    // 4. Transform empty strings to null
    const cleanData = Object.fromEntries(
      Object.entries(bookingData).map(([k, v]) => [k, v === '' ? null : v])
    );

    // 5. Create booking (and link quotation sequentially — see known limitations)
    const { data, error } = await this.repo.createBooking({
      ...cleanData,
      tenant_id: profile.tenant_id,
    } as any, source_quotation_id || undefined);

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateBooking(id: string, input: Partial<BookingFormInput>) {
    const partialSchema = bookingSchema.partial();
    const validation = partialSchema.safeParse(input);

    if (!validation.success) {
      return { data: null, error: new Error(validation.error.errors[0]?.message || 'Invalid update data') };
    }

    const { source_quotation_id, ...bookingData } = validation.data;
    const cleanData = Object.fromEntries(
      Object.entries(bookingData).map(([k, v]) => [k, v === '' ? null : v])
    );

    const { data, error } = await this.repo.updateBooking(id, cleanData);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateStatus(id: string, status: BookingStatus) {
    return await this.updateBooking(id, { status });
  }

  async deleteBooking(id: string) {
    const { error } = await this.repo.deleteBooking(id);
    return { success: !error, error };
  }
}

export const bookingService = new BookingService();
