import { z } from 'zod';

// Indonesian phone number validation
const phoneRegex = /^08[1-9][0-9]{7,11}$/;

// NIK validation: 16 digits
const nikRegex = /^[0-9]{16}$/;

// Gender enum
const genderEnum = ['LAKI_LAKI', 'PEREMPUAN'] as const;

// Blood type enum
const bloodTypeEnum = ['A', 'B', 'AB', 'O'] as const;

// Volunteer status
const statusEnum = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'] as const;

// Create Volunteer DTO
export const createVolunteerSchema = z.object({
  // User linkage
  user_id: z.number().int().positive().optional(),
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),
  
  // Contact
  phone: z.string()
    .regex(phoneRegex, 'Please provide a valid Indonesian phone number (starting with 08)'),
  email: z.string().email('Invalid email format').optional(),
  
  // Personal
  nik: z.string()
    .regex(nikRegex, 'NIK must be exactly 16 digits'),
  birth_date: z.string().datetime().optional(),
  gender: z.enum(genderEnum).optional(),
  blood_type: z.enum(bloodTypeEnum).optional(),
  
  // Location
  regency: z.string().max(100, 'Regency must not exceed 100 characters').optional(),
  district: z.string().max(100, 'District must not exceed 100 characters').optional(),
  village: z.string().max(100, 'Village must not exceed 100 characters').optional(),
  detail_address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Medical
  medical_history: z.string().max(1000).optional(),
  
  // Skills & Experience
  expertise: z.string().max(500).optional(),
  experience: z.string().max(2000).optional(),
  
  // Status
  status: z.enum(statusEnum).default('PENDING')
});

// Update Volunteer DTO (all fields optional)
export const updateVolunteerSchema = createVolunteerSchema.partial();

// Filter Volunteer Query
export const volunteerFilterSchema = z.object({
  status: z.enum(statusEnum).optional(),
  skill: z.string().optional(),
  region_id: z.string().optional(),
  regency: z.string().optional(),
  district: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional()
});

// Types
export type CreateVolunteerDTO = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerDTO = z.infer<typeof updateVolunteerSchema>;
export type VolunteerFilterDTO = z.infer<typeof volunteerFilterSchema>;

// PII-safe DTO - excludes personally identifiable information from volunteer responses
export class VolunteerDTO {
  static fromPrisma(volunteer: any): any {
    return {
      id: volunteer.id,
      user_id: volunteer.user_id,
      full_name: volunteer.full_name,
      email: volunteer.email,
      gender: volunteer.gender,
      blood_type: volunteer.blood_type,
      regency: volunteer.regency,
      district: volunteer.district,
      village: volunteer.village,
      detail_address: volunteer.detail_address,
      latitude: volunteer.latitude,
      longitude: volunteer.longitude,
      expertise: volunteer.expertise,
      experience: volunteer.experience,
      status: volunteer.status,
      created_at: volunteer.created_at,
      updated_at: volunteer.updated_at,
      // Excluded PII fields:
      // - nik
      // - phone
      // - birth_date
      // - medical_history
    };
  }

  // Transform volunteer list
  static fromPrismaMany(volunteers: any[]): any[] {
    return volunteers.map((volunteer) => VolunteerDTO.fromPrisma(volunteer));
  }
}