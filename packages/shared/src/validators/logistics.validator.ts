import { z } from 'zod';

// Logistics request schema
export const createLogisticsRequestSchema = z.object({
  incident_id: z.string().uuid('Invalid incident ID'),
  requester_region: z.string().min(1, 'Requester region is required').max(100, 'Requester region must not exceed 100 characters'),
  item_name: z.string().min(1, 'Item name is required').max(100, 'Item name must not exceed 100 characters'),
  quantity_requested: z.number().int().positive('Requested quantity must be positive'),
});

// Logistics approval schema
export const approveLogisticsRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  admin_note: z.string().max(500, 'Admin note must not exceed 500 characters').optional(),
});

// Logistics fulfillment schema
export const fulfillLogisticsRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  volunteer_id: z.string().uuid('Invalid volunteer ID'),
  quantity_fulfilled: z.number().int().positive('Fulfilled quantity must be positive'),
  notes: z.string().max(500, 'Fulfillment notes must not exceed 500 characters').optional(),
});

// Logistics rejection schema
export const rejectLogisticsRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  admin_note: z.string().max(500, 'Admin note must not exceed 500 characters').optional(),
});

// Export index for easy importing
export * from './logistics.validator';