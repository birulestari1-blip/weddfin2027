import { authService } from '@/features/auth/services/auth.service';
import { cateringRecipeRepository } from '../repositories/catering-recipe.repository';
import type { CateringRecipeFormInput } from '../schemas/catering-menu.schema';

export class CateringRecipeService {
  private async getTenantId(): Promise<string> {
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) throw new Error('Unauthorized: No tenant context found');
    return profile.tenant_id;
  }

  async getRecipesByMenuItemId(menuItemId: string) {
    try {
      const tenantId = await this.getTenantId();
      return await cateringRecipeRepository.getRecipesByMenuItemId(menuItemId, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async createRecipe(menuItemId: string, input: CateringRecipeFormInput) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        menu_item_id: menuItemId,
        tenant_id: tenantId,
      };
      const { data, error } = await cateringRecipeRepository.createRecipe(payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async updateRecipe(id: string, input: Partial<CateringRecipeFormInput>) {
    try {
      const tenantId = await this.getTenantId();
      const { data, error } = await cateringRecipeRepository.updateRecipe(id, tenantId, input);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async deleteRecipe(id: string) {
    try {
      const tenantId = await this.getTenantId();
      const { error } = await cateringRecipeRepository.deleteRecipe(id, tenantId);
      if (error) return { success: false, error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async getInventoryItems() {
    try {
      const tenantId = await this.getTenantId();
      return await cateringRecipeRepository.getInventoryItems(tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  /** Application-level calculation: required quantity for given pax */
  calculateRequired(quantityPerPax: number, pax: number): number {
    return Math.round(quantityPerPax * pax * 10000) / 10000;
  }
}

export const cateringRecipeService = new CateringRecipeService();
