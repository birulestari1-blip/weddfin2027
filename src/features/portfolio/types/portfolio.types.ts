import type { Database } from '@/types/database.types';

export type PortfolioRow = Database['public']['Tables']['portfolios']['Row'];
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert'];
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update'];

export type PortfolioMediaRow = Database['public']['Tables']['portfolio_media']['Row'];
export type PortfolioMediaInsert = Database['public']['Tables']['portfolio_media']['Insert'];
export type PortfolioMediaUpdate = Database['public']['Tables']['portfolio_media']['Update'];

export type MediaType = 'image' | 'video';

export interface PortfolioWithMedia extends PortfolioRow {
  portfolio_media: PortfolioMediaRow[];
}
