export interface IAsset {
  id: string; // uuid
  name: string;
  category: string; // FOOD/MEDICINE/CLOTHING/SHELTER/TOOLS/OTHER
  quantity: number; // >=0
  unit: string;
  location: string;
  region: string;
  warehouse_id: string; // FK
  qr_code: string; // UQ
  status: string;
  min_stock: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IAssetTransaction {
  id: string; // uuid
  asset_id: string; // FK
  incident_id: string; // FK
  volunteer_id: string; // FK
  quantity: number; // >0
  type: string; // checkin/checkout/dispatch/transfer/return/maintenance/retire
  status: string; // pending/approved/completed/rejected/cancelled
  notes: string;
  to_warehouse_id: string | null; // FK
  to_region: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ILogisticsRequest {
  id: string; // uuid
  incident_id: string; // FK
  requester_region: string;
  item_name: string;
  quantity_requested: number; // >0
  status: string; // pending/approved/fulfilled/rejected/cancelled
  admin_note: string;
  approved_by: string | null; // FK (user_id)
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}