import { z } from 'zod';

// User role enum
const roleEnum = ['PWNU', 'PCNU', 'RELAWAN', 'RELAWAN_ADMIN', 'SUPER_ADMIN', 'BNPB'] as const;

// Create User DTO
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  fullName: z.string().optional(),
  region: z.string().optional(),
  role: z.enum(roleEnum).default('RELAWAN')
});

// Update User DTO
export const updateUserSchema = createUserSchema.partial();

// Filter User Query
export const userFilterSchema = z.object({
  role: z.enum(roleEnum).optional(),
  region: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional()
});

// Types
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserFilterDTO = z.infer<typeof userFilterSchema>;

// PII-safe DTO - excludes personally identifiable information from user responses
export class UserDTO {
  static fromPrisma(user: any): any {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      region: user.region,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Excluded PII fields:
      // - passwordHash
      // - phoneNumber
      // - whatsappNumber
    };
  }

  // Transform user list
  static fromPrismaMany(users: any[]): any[] {
    return users.map((user) => UserDTO.fromPrisma(user));
  }
}