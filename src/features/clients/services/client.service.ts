import { clientRepository, ClientRepository } from '../repositories/client.repository';
import { clientSchema, ClientInput } from '../schemas/client.schema';
import { authService } from '@/features/auth/services/auth.service';

export class ClientService {
  constructor(private readonly repo: ClientRepository = clientRepository) {}

  async getClients(search?: string, limit = 50, offset = 0) {
    const { data, error, count } = await this.repo.getClients({ search, limit, offset });
    if (error) return { data: null, count: 0, error };
    return { data, count: count || 0, error: null };
  }

  async getClientById(id: string) {
    const { data, error } = await this.repo.getClientById(id);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async createClient(input: ClientInput) {
    // 1. Validate input
    const validation = clientSchema.safeParse(input);
    if (!validation.success) {
      return { data: null, error: new Error(validation.error.errors[0]?.message || 'Invalid client data') };
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
    const { data, error } = await this.repo.createClient({
      ...cleanData,
      tenant_id: profile.tenant_id,
    } as any);

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateClient(id: string, input: Partial<ClientInput>) {
    // Allow partial validation for updates if needed, or just validate present fields
    // Here we'll validate the whole payload against schema by spreading it over existing, 
    // or just let Zod validate what's passed (using partial).
    const partialSchema = clientSchema.partial();
    const validation = partialSchema.safeParse(input);
    
    if (!validation.success) {
      return { data: null, error: new Error(validation.error.errors[0]?.message || 'Invalid update data') };
    }

    const cleanData = Object.fromEntries(
      Object.entries(validation.data).map(([k, v]) => [k, v === '' ? null : v])
    );

    const { data, error } = await this.repo.updateClient(id, cleanData);
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async deleteClient(id: string) {
    const { error } = await this.repo.deleteClient(id);
    return { error };
  }
}

export const clientService = new ClientService();
