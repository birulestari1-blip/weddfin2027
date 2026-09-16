import { supabase } from '@/lib/supabase';
import type { PhotographyEquipmentFormInput } from '../schemas/photography.schema';

export class PhotographyEquipmentRepository {
  // ── LIST ────────────────────────────────────────────────────────────────────

  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('photography_equipment')
      .select('*, inventory_item:inventory_items(id, name, unit, current_stock)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  // ── SINGLE ──────────────────────────────────────────────────────────────────

  async getById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from('photography_equipment')
      .select('*, inventory_item:inventory_items(id, name, unit, current_stock, minimum_stock, status)')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    return { data, error };
  }

  // ── CREATE ──────────────────────────────────────────────────────────────────

  async create(tenantId: string, payload: PhotographyEquipmentFormInput) {
    const { data, error } = await supabase
      .from('photography_equipment')
      // @ts-ignore — Supabase generated types may be stale vs actual schema
      .insert({
        tenant_id: tenantId,
        inventory_item_id: payload.inventory_item_id || null,
        equipment_type: payload.equipment_type,
        brand: payload.brand || null,
        model: payload.model || null,
        serial_number: payload.serial_number || null,
        status: payload.status,
        notes: payload.notes || null,
      })
      .select()
      .single();

    return { data, error };
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────

  async update(id: string, tenantId: string, payload: PhotographyEquipmentFormInput) {
    const { data, error } = await supabase
      .from('photography_equipment')
      // @ts-ignore
      .update({
        inventory_item_id: payload.inventory_item_id || null,
        equipment_type: payload.equipment_type,
        brand: payload.brand || null,
        model: payload.model || null,
        serial_number: payload.serial_number || null,
        status: payload.status,
        notes: payload.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    return { data, error };
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────

  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from('photography_equipment')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return { error };
  }

  // ── STATS ───────────────────────────────────────────────────────────────────

  async getOverviewStats(tenantId: string) {
    const [totalRes, availableRes, maintenanceRes, damagedRes] = await Promise.all([
      supabase
        .from('photography_equipment')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
      supabase
        .from('photography_equipment')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'available'),
      supabase
        .from('photography_equipment')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'maintenance'),
      supabase
        .from('photography_equipment')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'damaged'),
    ]);

    return {
      total: totalRes.count ?? 0,
      available: availableRes.count ?? 0,
      maintenance: maintenanceRes.count ?? 0,
      damaged: damagedRes.count ?? 0,
      reserved: (totalRes.count ?? 0) - (availableRes.count ?? 0) - (maintenanceRes.count ?? 0) - (damagedRes.count ?? 0),
      error: totalRes.error || availableRes.error || maintenanceRes.error || damagedRes.error || null,
    };
  }
}

export const photographyEquipmentRepository = new PhotographyEquipmentRepository();
