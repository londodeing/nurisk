// Auth SDK Module

import { SdkClient } from '../core'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
} from '@nurisk/shared-types'

export class AuthApi {
  constructor(private client: SdkClient) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.client.post<LoginResponse>('/auth/login', data)
    return res.data!
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await this.client.post<RegisterResponse>('/auth/register', data)
    return res.data!
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const res = await this.client.post<{ message: string }>('/auth/forgot-password', data)
    return res.data!
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const res = await this.client.post<{ message: string }>('/auth/reset-password', data)
    return res.data!
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const res = await this.client.patch<{ message: string }>('/auth/change-password', data)
    return res.data!
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const res = await this.client.post<VerifyOtpResponse>('/auth/verify-otp', data)
    return res.data!
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const res = await this.client.post<RefreshTokenResponse>('/auth/refresh', data)
    return res.data!
  }

  async getProfile(): Promise<User> {
    const res = await this.client.get<User>('/auth/profile')
    return res.data!
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const res = await this.client.patch<UpdateProfileResponse>('/auth/profile', data)
    return res.data!
  }

  async logout(): Promise<void> {
    await this.client.post<void>('/auth/logout')
  }
}