// PII-safe Volunteer DTO

import { maskPhone, maskEmail, maskName, maskDate, maskAddress } from '../../common/utils/pii';

export interface SafeVolunteer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  birth_date: string;
  address: string;
  gender?: string;
  blood_type?: string;
  regency?: string;
  district?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  expertise?: string;
  status: string;
  createdAt: string;
}

export function toSafeVolunteer(volunteer: any): SafeVolunteer {
  return {
    id: volunteer.id,
    full_name: maskName(volunteer.fullName || volunteer.full_name),
    phone: maskPhone(volunteer.phone || ''),
    email: maskEmail(volunteer.email || ''),
    birth_date: maskDate(volunteer.birthDate || volunteer.birth_date || ''),
    address: maskAddress(volunteer.detailAddress || volunteer.detail_address || volunteer.address || ''),
    gender: volunteer.gender,
    blood_type: volunteer.bloodType || volunteer.blood_type,
    regency: volunteer.regency,
    district: volunteer.district,
    village: volunteer.village,
    latitude: volunteer.latitude,
    longitude: volunteer.longitude,
    expertise: volunteer.expertise,
    status: volunteer.status,
    createdAt: volunteer.createdAt || volunteer.created_at,
  };
}
