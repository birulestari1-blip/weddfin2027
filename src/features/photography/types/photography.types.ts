import type { InventoryItem } from '@/features/inventory/types/inventory.types';

export type EquipmentStatus = 'available' | 'reserved' | 'maintenance' | 'damaged';

export interface PhotographyEquipment {
  id: string;
  tenant_id: string;
  inventory_item_id: string | null;
  equipment_type: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  status: EquipmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  inventory_item?: InventoryItem; // joined data
}

export interface PhotographyBookingDetail {
  id: string;
  tenant_id: string;
  booking_id: string;
  shooting_duration_hours: number | null;
  photographer_count: number;
  edited_photo_count: number;
  album_quantity: number;
  delivery_deadline: string | null;
  shot_list: any[]; // JSONB
  editing_notes: string | null;
  created_at: string;
  updated_at: string;
}
