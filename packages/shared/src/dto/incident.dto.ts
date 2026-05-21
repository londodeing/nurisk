import { IIncident } from '../types/incident';

// Create DTO (excluding read-only fields and generated fields)
export class CreateIncidentDTO {
  incident_code: string;
  title: string;
  disaster_type: string;
  status: string;
  location: any; // PostGIS geometry(Point, 4326)
  region: string;
  kecamatan: string;
  desa: string;
  alamat_spesifik: string;
  priority_score?: number;
  priority_level?: string;
  description?: string;
  kondisi_mutakhir?: string;
  dampak_manusia?: any; // JSONB
  dampak_rumah?: any; // JSONB
  dampak_fasum?: any; // JSONB
  dampak_vital?: any; // JSONB
  dampak_lingkungan?: any; // JSONB
  needs_numeric?: any; // JSONB
  has_shelter?: boolean;
  reporter_name: string;
  whatsapp_number: string;
  photo_data?: string;
  event_date: Date;
  probability_score?: number;
  ai_features?: any; // JSONB
}

// Update DTO (partial update - all fields optional except id)
export class UpdateIncidentDTO {
  id: string;
  incident_code?: string;
  title?: string;
  disaster_type?: string;
  status?: string;
  location?: any; // PostGIS geometry(Point, 4326)
  region?: string;
  kecamatan?: string;
  desa?: string;
  alamat_spesifik?: string;
  priority_score?: number;
  priority_level?: string;
  description?: string;
  kondisi_mutakhir?: string;
  dampak_manusia?: any; // JSONB
  dampak_rumah?: any; // JSONB
  dampak_fasum?: any; // JSONB
  dampak_vital?: any; // JSONB
  dampak_lingkungan?: any; // JSONB
  needs_numeric?: any; // JSONB
  has_shelter?: boolean;
  is_ai_generated?: boolean;
  reporter_name?: string;
  whatsapp_number?: string;
  photo_data?: string;
  event_date?: Date;
  probability_score?: number;
  ai_features?: any; // JSONB
}

// Response DTO (what gets sent back to client - excludes sensitive fields)
export class IncidentResponseDTO {
  id: string;
  incident_code: string;
  title: string;
  disaster_type: string;
  status: string;
  location: any; // PostGIS geometry(Point, 4326)
  region: string;
  kecamatan: string;
  desa: string;
  alamat_spesifik: string;
  priority_score: number;
  priority_level: string;
  description?: string;
  kondisi_mutakhir?: string;
  has_shelter: boolean;
  reporter_name: string;
  whatsapp_number: string;
  photo_data?: string;
  event_date: Date;
  probability_score?: number;
  created_at: Date;
  updated_at: Date;
}

// PII-safe DTO - excludes personally identifiable information from incident responses
export class IncidentDTO {
  static fromPrisma(incident: any): any {
    return {
      id: incident.id,
      incident_code: incident.incident_code,
      title: incident.title,
      disaster_type: incident.disaster_type,
      status: incident.status,
      location: incident.location,
      region: incident.region,
      kecamatan: incident.kecamatan,
      desa: incident.desa,
      alamat_spesifik: incident.alamat_spesifik,
      priority_score: incident.priority_score,
      priority_level: incident.priority_level,
      description: incident.description,
      kondisi_mutakhir: incident.kondisi_mutakhir,
      has_shelter: incident.has_shelter,
      photo_data: incident.photo_data,
      event_date: incident.event_date,
      probability_score: incident.probability_score,
      created_at: incident.created_at,
      updated_at: incident.updated_at,
      // Excluded PII fields:
      // - whatsapp_number
      // - reporter_name
      // - phone (from volunteer relation)
    };
  }

  // Transform incident list
  static fromPrismaMany(incidents: any[]): any[] {
    return incidents.map((incident) => IncidentDTO.fromPrisma(incident));
  }
}