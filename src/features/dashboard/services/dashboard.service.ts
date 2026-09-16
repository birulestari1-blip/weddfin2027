import { dashboardRepository, DashboardRepository, DashboardMetrics } from '../repositories/dashboard.repository';

export class DashboardService {
  constructor(private readonly repo: DashboardRepository = dashboardRepository) {}

  async getMetrics(): Promise<{ data: DashboardMetrics | null; error: Error | null }> {
    return await this.repo.getDashboardMetrics();
  }
}

export const dashboardService = new DashboardService();
