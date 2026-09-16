import { z } from 'zod';
import { BOOKING_STATUS_VALUES, PAYMENT_STATUS_VALUES } from '../types/booking.types';

export const bookingSchema = z.object({
  client_id: z.string().uuid('Please select a client').nullable(),
  service_id: z.string().uuid('Please select a service').nullable(),
  promo_code_id: z.string().uuid().nullable().optional(),

  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')),
  client_phone: z.string().nullable().optional().or(z.literal('')),

  event_name: z.string().nullable().optional().or(z.literal('')),
  event_date: z.string().min(1, 'Event date is required'),
  event_end_date: z.string().nullable().optional().or(z.literal('')),
  
  venue_name: z.string().nullable().optional().or(z.literal('')),
  venue_address: z.string().nullable().optional().or(z.literal('')),

  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  unit_price: z.number().min(0, 'Unit price cannot be negative').default(0),
  discount_amount: z.number().min(0, 'Discount cannot be negative').default(0),
  total_cost: z.number().min(0, 'Total cost cannot be negative').default(0),
  amount_paid: z.number().min(0, 'Amount paid cannot be negative').default(0),

  status: z.enum(BOOKING_STATUS_VALUES as [string, ...string[]]).default('pending'),
  payment_status: z.enum(PAYMENT_STATUS_VALUES as [string, ...string[]]).default('unpaid'),
  
  // To handle the Quotation → Booking flow in the form, though not saved to vendor_bookings directly
  source_quotation_id: z.string().uuid().nullable().optional(),
});

export type BookingFormInput = z.infer<typeof bookingSchema>;
