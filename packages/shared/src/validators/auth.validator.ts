import { z } from 'zod';

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength: 8+ chars, upper+lower+number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// Login schema (email+password)
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .regex(emailRegex, 'Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

// Register schema (email+password+confirm password+full name)
export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .regex(emailRegex, 'Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(8, 'Please confirm your password'),
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Indonesian phone number validation (starts with 08, 8-12 digits after)
const phoneRegex = /^08[1-9][0-9]{7,11}$/;

// NIK (Nomor Induk Kependudukan) validation: 16 digits
const nikRegex = /^[0-9]{16}$/;

// User profile schema with phone number and NIK validation
export const userProfileSchema = z.object({
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),
  phone_number: z.string()
    .regex(phoneRegex, 'Please provide a valid Indonesian phone number (starting with 08)'),
  nik: z.string()
    .regex(nikRegex, 'NIK must be exactly 16 digits')
});

// Export all schemas
export * from './auth.validator';