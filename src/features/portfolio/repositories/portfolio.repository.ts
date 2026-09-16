import { supabase } from '@/lib/supabase';
import type { PortfolioInsert, PortfolioUpdate, PortfolioMediaInsert, PortfolioMediaUpdate } from '../types/portfolio.types';

export class PortfolioRepository {
  // ─── PORTFOLIO ────────────────────────────────────────────────────────────
  async getPortfolios(tenantId: string, limit: number = 50, offset: number = 0) {
    const { data, error, count } = await supabase
      .from('portfolios')
      .select('*, portfolio_media(*)', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error, count };
  }

  async getPortfolioById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*, portfolio_media(*)')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    return { data, error };
  }

  async createPortfolio(payload: PortfolioInsert) {
    const { data, error } = await supabase
      .from('portfolios')
      // @ts-ignore
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  async updatePortfolio(id: string, tenantId: string, payload: PortfolioUpdate) {
    const { data, error } = await supabase
      .from('portfolios')
      // @ts-ignore
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  async deletePortfolio(id: string, tenantId: string) {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }

  // ─── PORTFOLIO MEDIA ──────────────────────────────────────────────────────
  async addMedia(payload: PortfolioMediaInsert) {
    const { data, error } = await supabase
      .from('portfolio_media')
      // @ts-ignore
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  async updateMedia(id: string, tenantId: string, payload: PortfolioMediaUpdate) {
    const { data, error } = await supabase
      .from('portfolio_media')
      // @ts-ignore
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  async deleteMedia(id: string, tenantId: string) {
    const { error } = await supabase
      .from('portfolio_media')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }
}

export const portfolioRepository = new PortfolioRepository();
