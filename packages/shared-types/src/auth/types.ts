// Auth Types - Business Interfaces
import type { UserRole } from './enums';

// =============================================================================
// User
// =============================================================================

export interface User {
  /** Unique user identifier */
  id: string;
  /** User email address */
  email: string;
  /** Full name */
  name: string;
  /** User role */
  role: UserRole;
  /** Phone number (optional) */
  phone?: string;
  /** Avatar URL (optional) */
  avatar?: string;
  /** Organization name (optional) */
  organization?: string;
  /** Whether user is active */
  isActive: boolean;
  /** Email verified */
  emailVerified: boolean;
  /** Phone verified */
  phoneVerified: boolean;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** Account created timestamp */
  createdAt: string;
  /** Account updated timestamp */
  updatedAt: string;
}

// =============================================================================
// Auth Request/Response
// =============================================================================

export interface LoginRequest {
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** Remember me flag */
  rememberMe?: boolean;
}

export interface LoginResponse {
  /** JWT access token */
  token: string;
  /** Refresh token */
  refreshToken?: string;
  /** Token expiration (seconds) */
  expiresIn: number;
  /** User data */
  user: User;
}

export interface RegisterRequest {
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** Full name */
  name: string;
  /** Phone number */
  phone?: string;
  /** Role (default: PUBLIC) */
  role?: UserRole;
  /** Organization (optional) */
  organization?: string;
}

export interface RegisterResponse {
  /** User data */
  user: User;
  /** Message */
  message: string;
}

// =============================================================================
// Password Management
// =============================================================================

export interface ForgotPasswordRequest {
  /** Email address */
  email: string;
}

export interface ResetPasswordRequest {
  /** Reset token */
  token: string;
  /** New password */
  newPassword: string;
}

export interface ChangePasswordRequest {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
}

export interface VerifyOtpRequest {
  /** Email or phone */
  identifier: string;
  /** OTP code */
  otp: string;
}

export interface VerifyOtpResponse {
  /** Verification token */
  token: string;
  /** Expires at */
  expiresAt: string;
}

// =============================================================================
// Profile
// =============================================================================

export interface UpdateProfileRequest {
  /** Full name */
  name?: string;
  /** Phone number */
  phone?: string;
  /** Avatar URL */
  avatar?: string;
  /** Organization */
  organization?: string;
}

export interface UpdateProfileResponse {
  /** Updated user data */
  user: User;
  /** Message */
  message: string;
}

// =============================================================================
// Session
// =============================================================================

export interface Session {
  /** Session ID */
  id: string;
  /** User ID */
  userId: string;
  /** Device info */
  device: string;
  /** IP address */
  ip: string;
  /** Last active */
  lastActiveAt: string;
  /** Created at */
  createdAt: string;
}

export interface RefreshTokenRequest {
  /** Refresh token */
  refreshToken: string;
}

export interface RefreshTokenResponse {
  /** New access token */
  token: string;
  /** New refresh token */
  refreshToken?: string;
  /** Expires in */
  expiresIn: number;
}

// =============================================================================
// Role Permissions
// =============================================================================

export interface Permission {
  /** Permission key */
  key: string;
  /** Permission name */
  name: string;
  /** Description */
  description: string;
}

export interface RolePermissions {
  /** Role */
  role: UserRole;
  /** List of permissions */
  permissions: Permission[];
}