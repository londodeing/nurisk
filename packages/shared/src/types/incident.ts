export interface IIncident {
  id: string; // uuid
  incident_code: string; // UQ
  title: string;
  disaster_type: string; // 12 enum
  status: string; // 6-state
  location: any; // PostGIS geometry(Point, 4326)
  region: string;
  kecamatan: string;
  desa: string;
  alamat_spesifik: string;
  priority_score: number;
  priority_level: string;
  description: string;
  kondisi_mutakhir: string;
  dampak_manusia: any; // JSONB
  dampak_rumah: any; // JSONB
  dampak_fasum: any; // JSONB
  dampak_vital: any; // JSONB
  dampak_lingkungan: any; // JSONB
  needs_numeric: any; // JSONB
  has_shelter: boolean;
  is_ai_generated: boolean;
  reporter_name: string;
  whatsapp_number: string;
  photo_data: string;
  event_date: Date;
  probability_score: number;
  ai_features: any; // JSONB
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}