import { contractRepository } from '../repositories/contract.repository';
import { authService } from '@/features/auth/services/auth.service';
import type { ContractFormInput } from '../schemas/contract.schema';
import type { ContractStatus } from '../types/contract.types';

export class ContractService {
  private async getTenantId(): Promise<string> {
    const { profile } = await authService.getCurrentSession();
    if (!profile?.tenant_id) {
      throw new Error('Unauthorized: No tenant context found');
    }
    return profile.tenant_id;
  }

  async getContracts(limit?: number, offset?: number) {
    try {
      const tenantId = await this.getTenantId();
      return await contractRepository.getContracts(tenantId, limit, offset);
    } catch (err: any) {
      return { data: null, count: 0, error: { message: err.message } };
    }
  }

  async getContractById(id: string) {
    try {
      const tenantId = await this.getTenantId();
      return await contractRepository.getContractById(id, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async getContractByBookingId(bookingId: string) {
    try {
      const tenantId = await this.getTenantId();
      return await contractRepository.getContractByBookingId(bookingId, tenantId);
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async createContract(input: ContractFormInput) {
    try {
      const tenantId = await this.getTenantId();
      const payload = {
        ...input,
        tenant_id: tenantId,
      };
      
      const { data, error } = await contractRepository.createContract(payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async updateContract(id: string, input: Partial<ContractFormInput>) {
    try {
      const tenantId = await this.getTenantId();
      const { data, error } = await contractRepository.updateContract(id, tenantId, input);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async updateStatus(id: string, status: ContractStatus) {
    try {
      const tenantId = await this.getTenantId();
      const payload: any = { status };
      
      if (status === 'signed') {
        payload.vendor_signed_at = new Date().toISOString();
        payload.client_signed_at = new Date().toISOString();
      }

      const { data, error } = await contractRepository.updateContract(id, tenantId, payload);
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }

  async deleteContract(id: string) {
    try {
      const tenantId = await this.getTenantId();
      const { error } = await contractRepository.deleteContract(id, tenantId);
      if (error) return { success: false, error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: { message: err.message } };
    }
  }
}

export const contractService = new ContractService();
