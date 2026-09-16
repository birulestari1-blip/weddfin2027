import { authService } from '@/features/auth/services/auth.service';
import { photographyBookingRepository } from '../repositories/photography-booking.repository';
import type { PhotographyBookingDetailFormInput } from '../schemas/photography.schema';

class PhotographyBookingService {
  private async getTenantId(): Promise<string> {
    const session = await authService.getCurrentSession();
    if (!session?.tenantId) throw new Error('No active tenant session');
    return session.tenantId;
  }

  async getByBookingId(bookingId: string) {
    const tenantId = await this.getTenantId();
    const { data, error } = await photographyBookingRepository.getByBookingId(bookingId, tenantId);
    if (error) return { success: false, error, data: null };
    return { success: true, error: null, data };
  }

  async upsert(bookingId: string, payload: PhotographyBookingDetailFormInput) {
    const tenantId = await this.getTenantId();
    const { data, error } = await photographyBookingRepository.upsert(tenantId, bookingId, payload);
    if (error) return { success: false, error, data: null };
    return { success: true, error: null, data };
  }

  async deleteByBookingId(bookingId: string) {
    const tenantId = await this.getTenantId();
    const { error } = await photographyBookingRepository.deleteByBookingId(bookingId, tenantId);
    if (error) return { success: false, error };
    return { success: true, error: null };
  }
}

export const photographyBookingService = new PhotographyBookingService();
