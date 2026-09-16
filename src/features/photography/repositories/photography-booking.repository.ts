import { supabase } from '@/lib/supabase';
import type { PhotographyBookingDetailFormInput } from '../schemas/photography.schema';

export class PhotographyBookingRepository {
  // ── GET BY BOOKING ───────────────────────────────────────────────────────────

  async getByBookingId(bookingId: string, tenantId: string) {
    const { data, error } = await supabase
      .from('photography_booking_details')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    return { data, error };
  }

  // ── UPSERT (create or update) ────────────────────────────────────────────────

  async upsert(tenantId: string, bookingId: string, payload: PhotographyBookingDetailFormInput) {
    // Try to get existing record first
    const { data: existing } = await supabase
      .from('photography_booking_details')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (existing?.id) {
      // UPDATE
      const { data, error } = await supabase
        .from('photography_booking_details')
        // @ts-ignore
        .update({
          shooting_duration_hours: payload.shooting_duration_hours ?? null,
          photographer_count: payload.photographer_count,
          edited_photo_count: payload.edited_photo_count,
          album_quantity: payload.album_quantity,
          delivery_deadline: payload.delivery_deadline || null,
          shot_list: payload.shot_list ?? [],
          editing_notes: payload.editing_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      return { data, error };
    } else {
      // INSERT
      const { data, error } = await supabase
        .from('photography_booking_details')
        // @ts-ignore
        .insert({
          tenant_id: tenantId,
          booking_id: bookingId,
          shooting_duration_hours: payload.shooting_duration_hours ?? null,
          photographer_count: payload.photographer_count,
          edited_photo_count: payload.edited_photo_count,
          album_quantity: payload.album_quantity,
          delivery_deadline: payload.delivery_deadline || null,
          shot_list: payload.shot_list ?? [],
          editing_notes: payload.editing_notes || null,
        })
        .select()
        .single();
      return { data, error };
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────────

  async deleteByBookingId(bookingId: string, tenantId: string) {
    const { error } = await supabase
      .from('photography_booking_details')
      .delete()
      .eq('booking_id', bookingId)
      .eq('tenant_id', tenantId);

    return { error };
  }
}

export const photographyBookingRepository = new PhotographyBookingRepository();
