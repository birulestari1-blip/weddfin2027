import { z } from 'zod';

export const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  event_date: z.string().nullable().optional(),
  venue_name: z.string().max(255).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export type PortfolioFormInput = z.infer<typeof portfolioSchema>;

export const portfolioMediaSchema = z.object({
  media_type: z.enum(['image', 'video']),
  media_url: z.string().url('Must be a valid URL'),
  thumbnail_url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  caption: z.string().nullable().optional(),
  display_order: z.number().int().default(0),
});

export type PortfolioMediaFormInput = z.infer<typeof portfolioMediaSchema>;
