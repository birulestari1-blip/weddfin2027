import { authService } from '@/features/auth/services/auth.service';
import { cateringMenuItemRepository } from '../repositories/catering-menu-item.repository';
import type { CateringMenuItemFormInput } from '../schemas/catering-menu.schema';

export class CateringMenuItemService {
  private async getTenantId(): Promise<string> {
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) throw new Error('Unauthorized: No tenant context found');
    return profile.tenant_id;
  }

  async getItemsByMenuId(menuId: string) {
    try {
      const tenantId = await this.getTenantId();
      return await cateringMenuItemRepository.getItemsByMenuId(menuId, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async getItemById(id: string) {
    try {
      const tenantId = await this.getTenantId();
      return await cateringMenuItemRepository.getItemById(id, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async createItem(menuId: string, input: CateringMenuItemFormInput) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        menu_id: menuId,
        tenant_id: tenantId,
        image_url: input.image_url || null,
        description: input.description || null,
        course_type: input.course_type || null,
      };
      const { data, error } = await cateringMenuItemRepository.createItem(payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async updateItem(id: string, input: Partial<CateringMenuItemFormInput>) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        image_url: input.image_url || null,
        description: input.description || null,
        course_type: input.course_type || null,
      };
      const { data, error } = await cateringMenuItemRepository.updateItem(id, tenantId, payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async deleteItem(id: string) {
    try {
      const tenantId = await this.getTenantId();
      const { error } = await cateringMenuItemRepository.deleteItem(id, tenantId);
      if (error) return { success: false, error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }
}

export const cateringMenuItemService = new CateringMenuItemService();
