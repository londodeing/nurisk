import { z } from 'zod';

// Asset creation schema
export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(100, 'Asset name must not exceed 100 characters'),
  category: z.enum(['FOOD', 'MEDICINE', 'CLOTHING', 'SHELTER', 'TOOLS', 'OTHER'], 'Invalid asset category'),
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must not exceed 50 characters'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must not exceed 200 characters'),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters'),
  warehouse_id: z.string().uuid('Invalid warehouse ID'),
  qr_code: z.string().min(1, 'QR code is required').max(100, 'QR code must not exceed 100 characters'),
  status: z.enum(['available', 'allocated', 'in_transit', 'maintenance', 'retired'], 'Invalid asset status').optional(),
  min_stock: z.number().int().min(0, 'Minimum stock must be at least 0').optional(),
});

// Asset transfer schema
export const transferAssetSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  to_warehouse_id: z.string().uuid('Invalid destination warehouse ID'),
  to_region: z.string().min(1, 'Destination region is required').max(100, 'Destination region must not exceed 100 characters'),
  quantity: z.number().int().positive('Transfer quantity must be positive'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

// Export index for easy importing
export * from './asset.validator';