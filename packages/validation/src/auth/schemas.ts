// Auth Validation Schemas
import { z } from 'zod'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password strength: 8+ chars, upper+lower+number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

// Indonesian phone number validation (starts with 08, 8-12 digits after)
const phoneRegex = /^08[1-9][0-9]{7,11}$/

// NIK (Nomor Induk Kependudukan) validation: 16 digits
const nikRegex = /^[0-9]{16}$/

// Login schema
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Register schema
export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .regex(emailRegex, 'Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(8, 'Please confirm your password'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters'),
  region: z.string()
    .min(1, 'Region is required'),
  secretKey: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN_PWNU', 'PWNU', 'STAFF_PWNU', 'COMMANDER', 'ADMIN_PCNU', 'STAFF_PCNU', 'FIELD_STAFF', 'RELAWAN', 'PUBLIC'] as const).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type RegisterInput = z.infer<typeof registerSchema>

// User profile schema
export const userProfileSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),
  phoneNumber: z.string()
    .regex(phoneRegex, 'Please provide a valid Indonesian phone number (starting with 08)'),
  nik: z.string()
    .regex(nikRegex, 'NIK must be exactly 16 digits'),
  branch: z.enum(['headquarters', 'regional', 'local', 'field'] as const).optional(),
  rank: z.enum(['trainee', 'junior', 'senior', 'lead', 'commander'] as const).optional(),
})

export type UserProfileInput = z.infer<typeof userProfileSchema>

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(8, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmNewPassword: z.string()
    .min(8, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
  otp: z.string().length(6, 'OTP harus 6 digit'),
  newPassword: z.string().min(6, 'Password minimal 6 karakter'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Verify account schema
export const verifyAccountSchema = z.object({
  userId: z.string().min(1, 'User ID tidak valid'),
  otp: z.string().length(6, 'Kode verifikasi harus 6 digit'),
})

export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>