import { useState, useCallback } from 'react';
import { photographyBookingService } from '../services/photography-booking.service';
import type { PhotographyBookingDetail } from '../types/photography.types';
import type { PhotographyBookingDetailFormInput } from '../schemas/photography.schema';

export function usePhotographyBookingDetails(bookingId: string) {
  const [detail, setDetail] = useState<PhotographyBookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    const result = await photographyBookingService.getByBookingId(bookingId);
    if (result.success) {
      setDetail((result.data as PhotographyBookingDetail) ?? null);
    } else {
      setError(result.error?.message ?? 'Failed to load photography details');
    }
    setIsLoading(false);
  }, [bookingId]);

  const upsertDetail = useCallback(async (payload: PhotographyBookingDetailFormInput) => {
    const result = await photographyBookingService.upsert(bookingId, payload);
    if (result.success) await fetchDetail();
    return result;
  }, [bookingId, fetchDetail]);

  return {
    detail,
    isLoading,
    error,
    fetchDetail,
    upsertDetail,
  };
}
