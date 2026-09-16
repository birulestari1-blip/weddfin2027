import { useState, useCallback } from 'react';
import { bookingService } from '../services/booking.service';
import type { BookingWithDetails, BookingStatus } from '../types/booking.types';
import type { BookingFormInput } from '../schemas/booking.schema';

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(
    async (search?: string, status?: string, limit = 50, offset = 0) => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await bookingService.getBookings(search, status, limit, offset);
      if (error) {
        setError(error);
      } else {
        setBookings(data as BookingWithDetails[]);
      }
      setIsLoading(false);
    },
    []
  );

  const createBooking = async (input: BookingFormInput) => {
    setIsLoading(true);
    const { data, error } = await bookingService.createBooking(input);
    setIsLoading(false);
    return { success: !error, data, error };
  };

  const updateBooking = async (id: string, input: Partial<BookingFormInput>) => {
    setIsLoading(true);
    const { data, error } = await bookingService.updateBooking(id, input);
    setIsLoading(false);
    return { success: !error, data, error };
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    setIsLoading(true);
    const { error } = await bookingService.updateStatus(id, status);
    if (!error) {
      setBookings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    }
    setIsLoading(false);
    return { success: !error, error };
  };

  const deleteBooking = async (id: string) => {
    setIsLoading(true);
    const { success, error } = await bookingService.deleteBooking(id);
    if (success) {
      setBookings((prev) => prev.filter((item) => item.id !== id));
    }
    setIsLoading(false);
    return { success, error };
  };

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    updateStatus,
    deleteBooking,
  };
};
