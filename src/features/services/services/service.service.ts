import { serviceRepository, ServiceRepository } from '../repositories/service.repository';
import { serviceSchema, ServiceInput } from '../schemas/service.schema';
import { authService } from '@/features/auth/services/auth.service';

export class VendorServiceService {
  constructor(private readonly repo: ServiceRepository = serviceRepository) {}

  async getServices(search?: string, isActive?: boolean, limit = 50, offset = 0) {
    const { data, error, count } = await this.repo.getServices({ search, isActive, limit, offset });
    if (error) return { data: null, count: 0, error };
    return { data, count: count || 0, error: null };
  }

  async getServiceById(id: string) {
    const { data, error } = await this.repo.getServiceById(id);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async createService(input: ServiceInput) {
    // 1. Validate input
    const validation = serviceSchema.safeParse(input);
    if (!validation.success) {
      return { data: null, error: new Error(validation.error.errors[0]?.message || 'Invalid service data') };
    }

    // 2. Get current session to inject tenant_id securely
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
       return { data: null, error: new Error('Unauthorized or no tenant context found') };
    }

    // Transform empty strings to null for DB compatibility
    const cleanData = Object.fromEntries(
      Object.entries(validation.data).map(([k, v]) => [k, v === '' ? null : v])
    );

    // 3. Inject tenant_id and create
    const { data, error } = await this.repo.createService({
      ...cleanData,
      tenant_id: profile.tenant_id,
    } as any);

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateService(id: string, input: Partial<ServiceInput>) {
    const partialSchema = serviceSchema.partial();
    const validation = partialSchema.safeParse(input);
    
    if (!validation.success) {
      return { data: null, error: new Error(validation.error.errors[0]?.message || 'Invalid update data') };
    }

    const cleanData = Object.fromEntries(
      Object.entries(validation.data).map(([k, v]) => [k, v === '' ? null : v])
    );

    const { data, error } = await this.repo.updateService(id, cleanData);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async toggleActiveStatus(id: string, currentStatus: boolean) {
    return await this.updateService(id, { is_active: !currentStatus });
  }

  async deleteService(id: string) {
    const { error } = await this.repo.deleteService(id);
    return { error };
  }
}

export const vendorServiceService = new VendorServiceService();
