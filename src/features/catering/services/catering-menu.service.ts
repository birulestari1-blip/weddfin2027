import { authService } from '@/features/auth/services/auth.service';
import { cateringMenuRepository } from '../repositories/catering-menu.repository';
import type { CateringMenuFormInput } from '../schemas/catering-menu.schema';

export class CateringMenuService {
  private async getTenantId(): Promise<string> {
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) throw new Error('Unauthorized: No tenant context found');
    return profile.tenant_id;
  }

  async getMenus(limit?: number, offset?: number) {
    try {
      const tenantId = await this.getTenantId();
      return await cateringMenuRepository.getMenus(tenantId, limit, offset);
    } catch (err: any) {
      return { data: null, count: 0, error: { message: err.message } };
    }
  }

  async getMenuById(id: string) {
    try {
      const tenantId = await this.getTenantId();
      return await cateringMenuRepository.getMenuById(id, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async createMenu(input: CateringMenuFormInput) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        tenant_id: tenantId,
        image_url: input.image_url || null,
        description: input.description || null,
        category: input.category || null,
      };
      const { data, error } = await cateringMenuRepository.createMenu(payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async updateMenu(id: string, input: Partial<CateringMenuFormInput>) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        image_url: input.image_url || null,
        description: input.description || null,
        category: input.category || null,
      };
      const { data, error } = await cateringMenuRepository.updateMenu(id, tenantId, payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async deleteMenu(id: string) {
    try {
      const tenantId = await this.getTenantId();
      const { error } = await cateringMenuRepository.deleteMenu(id, tenantId);
      if (error) return { success: false, error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async getOverviewStats() {
    try {
      const tenantId = await this.getTenantId();
      return await cateringMenuRepository.getOverviewStats(tenantId);
    } catch (err: any) {
      return { totalMenus: 0, activeMenus: 0, totalItems: 0, totalRecipes: 0, error: { message: err.message } };
    }
  }

  async getLowStockIngredients() {
    try {
      const tenantId = await this.getTenantId();
      return await cateringMenuRepository.getLowStockIngredients(tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }
}

export const cateringMenuService = new CateringMenuService();
