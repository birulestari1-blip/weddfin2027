import { supabase } from '@/lib/supabase';

export interface DashboardMetrics {
  totalClients: number;
  activeServices: number;
  pendingQuotations: number;
  activeBookings: number;
}

export class DashboardRepository {
  async getDashboardMetrics(): Promise<{ data: DashboardMetrics | null; error: Error | null }> {
    try {
      // 1. Get total clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientsError) throw clientsError;

      // 2. Get active services count
      const { count: servicesCount, error: servicesError } = await supabase
        .from('vendor_services')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // 3. Get draft quotations count
      const { count: quotationsCount, error: quotationsError } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      if (quotationsError) throw quotationsError;

      // 4. Get active bookings count
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('vendor_bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (bookingsError) throw bookingsError;

      return {
        data: {
          totalClients: clientsCount || 0,
          activeServices: servicesCount || 0,
          pendingQuotations: quotationsCount || 0,
          activeBookings: bookingsCount || 0,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const dashboardRepository = new DashboardRepository();
