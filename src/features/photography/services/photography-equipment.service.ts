import { authService } from '@/features/auth/services/auth.service';
import { photographyEquipmentRepository } from '../repositories/photography-equipment.repository';
import type { PhotographyEquipmentFormInput } from '../schemas/photography.schema';

class PhotographyEquipmentService {
  private async getTenantId(): Promise<string> {
    const session = await authService.getCurrentSession();
    if (!session?.tenantId) throw new Error('No active tenant session');
    return session.tenantId;
  }

  async getAll() {
    const tenantId = await this.getTenantId();
    const { data, error } = await photographyEquipmentRepository.getAll(tenantId);
    if (error) return { success: false, error, data: null };
    return { success: true, error: null, data };
  }

  async getById(id: string) {
    const tenantId = await this.getTenantId();
    const { data, error } = await photographyEquipmentRepository.getById(id, tenantId);
    if (error) return { success: false, error, data: null };
    return { success: true, error: null, data };
  }

  async create(payload: PhotographyEquipmentFormInput) {
    const tenantId = await this.getTenantId();
    const { data, error } = await photographyEquipmentRepository.create(tenantId, payload);
    if (error) return { success: false, error, data: null };
    return { success: true, error: null, data };
  }

  async update(id: string, payload: PhotographyEquipmentFormInput) {
    const tenantId = await this.getTenantId();
    const { data, error } = await photographyEquipmentRepository.update(id, tenantId, payload);
    if (error) return { success: false, error, data: null };
    return { success: true, error: null, data };
  }

  async delete(id: string) {
    const tenantId = await this.getTenantId();
    const { error } = await photographyEquipmentRepository.delete(id, tenantId);
    if (error) return { success: false, error };
    return { success: true, error: null };
  }

  async getOverviewStats() {
    const tenantId = await this.getTenantId();
    return photographyEquipmentRepository.getOverviewStats(tenantId);
  }
}

export const photographyEquipmentService = new PhotographyEquipmentService();
