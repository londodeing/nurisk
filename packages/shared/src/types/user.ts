export interface IUser {
  id: string; // uuid
  username: string; // UQ
  password_hash: string;
  full_name: string;
  role: string; // 10 enum
  region: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  avatar_url: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IVolunteer {
  id: string; // uuid
  user_id: string; // UQ FK
  full_name: string;
  phone: string;
  birth_date: Date;
  gender: string;
  blood_type: string;
  regency: string;
  district: string;
  village: string;
  detail_address: string;
  location: any; // PostGIS
  medical_history: string;
  expertise: string;
  experience: string;
  status: string; // pending/approved/rejected/inactive/active
  status_tugas: string; // available/on_duty/off_duty
  last_location: any; // PostGIS
  rating: number;
  total_missions: number;
  total_hours: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IShelter {
  id: string; // uuid
  name: string;
  region: string;
  address: string;
  location: any; // PostGIS
  capacity: number;
  refugee_count: number;
  water_stock_liters: number;
  toilet_count: number;
  status: string; // AKTIF/FULL/CLOSED
  score: number;
  stock_status: string;
  incident_id: string | null; // FK (optional)
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IWarehouse {
  id: string; // uuid
  name: string;
  region: string;
  address: string;
  location: any; // PostGIS
  type: string; // GUDANG/POSKO/DISTRIBUSI
  phone_number: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}