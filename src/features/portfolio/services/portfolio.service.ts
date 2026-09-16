import { portfolioRepository } from '../repositories/portfolio.repository';
import { authService } from '@/features/auth/services/auth.service';
import type { PortfolioFormInput, PortfolioMediaFormInput } from '../schemas/portfolio.schema';

export class PortfolioService {
  private async getTenantId(): Promise<string> {
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
      throw new Error('Unauthorized: No tenant context found');
    }
    return profile.tenant_id;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-6);
  }

  async getPortfolios(limit?: number, offset?: number) {
    try {
      const tenantId = await this.getTenantId();
      return await portfolioRepository.getPortfolios(tenantId, limit, offset);
    } catch (err: any) {
      return { data: null, count: 0, error: { message: err.message } };
    }
  }

  async getPortfolioById(id: string) {
    try {
      const tenantId = await this.getTenantId();
      return await portfolioRepository.getPortfolioById(id, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async createPortfolio(input: PortfolioFormInput) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        tenant_id: tenantId,
        slug: this.generateSlug(input.title),
      };
      
      const { data, error } = await portfolioRepository.createPortfolio(payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async updatePortfolio(id: string, input: Partial<PortfolioFormInput>) {
    try {
      const tenantId = await this.getTenantId();
      const payload: any = { ...input };
      
      // If title is updated, we might want to update the slug, but usually slugs are immutable
      // for SEO reasons. Let's keep the original slug unless explicitly requested.

      const { data, error } = await portfolioRepository.updatePortfolio(id, tenantId, payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async deletePortfolio(id: string) {
    try {
      const tenantId = await this.getTenantId();
      const { error } = await portfolioRepository.deletePortfolio(id, tenantId);
      if (error) return { success: false, error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  // ─── MEDIA ────────────────────────────────────────────────────────────────
  async addMedia(portfolioId: string, input: PortfolioMediaFormInput) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        tenant_id: tenantId,
        portfolio_id: portfolioId,
      };
      const { data, error } = await portfolioRepository.addMedia(payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async deleteMedia(id: string) {
    try {
      const tenantId = await this.getTenantId();
      const { error } = await portfolioRepository.deleteMedia(id, tenantId);
      if (error) return { success: false, error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }
}

export const portfolioService = new PortfolioService();
