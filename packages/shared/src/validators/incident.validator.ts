import { z } from 'zod';
import { DISASTER_TYPES } from '../enums/disaster-type';
import { validateCoordinates } from '../utils/geo';

// Helper to validate GeoJSON Point structure
const isValidGeoJSONPoint = (val: any): val is { type: 'Point'; coordinates: [number, number] } => {
  return val &&
    typeof val === 'object' &&
    val.type === 'Point' &&
    Array.isArray(val.coordinates) &&
    val.coordinates.length === 2 &&
    typeof val.coordinates[0] === 'number' &&
    typeof val.coordinates[1] === 'number' &&
    validateCoordinates(val.coordinates[1], val.coordinates[0]); // lat, lng order
};

// Create incident schema with validation rules
export const createIncidentSchema = z.object({
  incident_code: z.string().min(1, 'Incident code is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  disaster_type: z.enum(DISASTER_TYPES, 'Invalid disaster type'),
  status: z.string().min(1, 'Status is required'),
  location: z.custom(isValidGeoJSONPoint, 'Location must be a valid GeoJSON Point with valid coordinates'),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters'),
  kecamatan: z.string().min(1, 'Kecamatan is required').max(100, 'Kecamatan must not exceed 100 characters'),
  desa: z.string().min(1, 'Desa is required').max(100, 'Desa must not exceed 100 characters'),
  alamat_spesifik: z.string().max(500, 'Specific address must not exceed 500 characters'),
  priority_score: z.number().min(0, 'Priority score must be at least 0').max(100, 'Priority score must not exceed 100').optional(),
  priority_level: z.string().max(50, 'Priority level must not exceed 50 characters').optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  kondisi_mutakhir: z.string().max(500, 'Current condition must not exceed 500 characters').optional(),
  reporter_name: z.string().min(1, 'Reporter name is required').max(100, 'Reporter name must not exceed 100 characters'),
  whatsapp_number: z.string().min(10, 'WhatsApp number must be at least 10 characters').max(20, 'WhatsApp number must not exceed 20 characters'),
  photo_data: z.string().optional(),
  event_date: z.date(),
  probability_score: z.number().min(0, 'Probability score must be at least 0').max(100, 'Probability score must not exceed 100').optional(),
});

// Update incident schema (partial update)
export const updateIncidentSchema = z.object({
  id: z.string().uuid('Invalid incident ID'),
  incident_code: z.string().min(1, 'Incident code is required').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters').optional(),
  disaster_type: z.enum(DISASTER_TYPES, 'Invalid disaster type').optional(),
  status: z.string().min(1, 'Status is required').optional(),
  location: z.custom(isValidGeoJSONPoint, 'Location must be a valid GeoJSON Point with valid coordinates').optional(),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters').optional(),
  kecamatan: z.string().min(1, 'Kecamatan is required').max(100, 'Kecamatan must not exceed 100 characters').optional(),
  desa: z.string().min(1, 'Desa is required').max(100, 'Desa must not exceed 100 characters').optional(),
  alamat_spesifik: z.string().max(500, 'Specific address must not exceed 500 characters').optional(),
  priority_score: z.number().min(0, 'Priority score must be at least 0').max(100, 'Priority score must not exceed 100').optional(),
  priority_level: z.string().max(50, 'Priority level must not exceed 50 characters').optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  kondisi_mutakhir: z.string().max(500, 'Current condition must not exceed 500 characters').optional(),
  reporter_name: z.string().min(1, 'Reporter name is required').max(100, 'Reporter name must not exceed 100 characters').optional(),
  whatsapp_number: z.string().min(10, 'WhatsApp number must be at least 10 characters').max(20, 'WhatsApp number must not exceed 20 characters').optional(),
  photo_data: z.string().optional(),
  event_date: z.date().optional(),
  probability_score: z.number().min(0, 'Probability score must be at least 0').max(100, 'Probability score must not exceed 100').optional(),
}).refine((data) => {
  // Conditional validation: Ensure event_date is not in the future beyond a reasonable limit
  // For example, we might not want events dated more than 1 year in the future
  if (data.event_date) {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    return data.event_date <= oneYearFromNow;
  }
  return true;
}, {
  message: "Event date cannot be more than 1 year in the future",
  path: ["event_date"]
});

// Export index for easy importing
export * from './incident.validator';