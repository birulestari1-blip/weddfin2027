import { z } from 'zod';

export const clientSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long'),
  email: z.string().trim().email('Invalid email format').nullable().optional().or(z.literal('')),
  phone_number: z.string().trim().max(20, 'Phone number is too long').nullable().optional().or(z.literal('')),
  company_name: z.string().trim().max(100, 'Company name is too long').nullable().optional().or(z.literal('')),
  address: z.string().trim().max(500, 'Address is too long').nullable().optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes are too long').nullable().optional().or(z.literal('')),
});

export type ClientInput = z.infer<typeof clientSchema>;
