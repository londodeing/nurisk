import { z } from 'zod';

// Pagination schema with page, limit, sortBy, sortOrder
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Date-range filter schema with optional start/end dates
export const dateRangeFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: "startDate must be before or equal to endDate",
  path: ["endDate"]
});

// GeoQuery schema for radius-based spatial searches
export const geoQuerySchema = z.object({
  center: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  radius: z.number().positive().max(1000), // radius in kilometers
});

// Export all schemas
export * from './pagination.validator';