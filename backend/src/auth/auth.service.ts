import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { z } from 'zod';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@nurisk/shared-types/auth';

import generateCode from '../utils/generateCode';
import { sendEmail } from '../utils/email';
import { AuditService } from '../common/services/audit.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyAccountSchema,
} from '@nurisk/validation/auth';
import { PrismaService } from '../prisma/prisma.service';

// RSA key pair for RS256 signing
let rsaKeyPair: { privateKey: string; publicKey: string } | null = null;

function getOrCreateRSAKeyPair(): { privateKey: string; publicKey: string } {
  if (rsaKeyPair) return rsaKeyPair;

  const privateKeyPem = process.env.JWT_PRIVATE_KEY;
  const publicKeyPem = process.env.JWT_PUBLIC_KEY;

  if (privateKeyPem && publicKeyPem) {
    rsaKeyPair = { privateKey: privateKeyPem, publicKey: publicKeyPem };
  } else {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    rsaKeyPair = { privateKey, publicKey };
    console.log('⚠️  Generated new RSA key pair for JWT RS256. Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY in production!');
  }
  return rsaKeyPair;
}

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyAccountDto = z.infer<typeof verifyAccountSchema>;

// Re-export schemas from validation package for controller
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyAccountSchema,
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async register(registerDto: RegisterDto) {
    const parsed = registerSchema.parse(registerDto);
    const { fullName, username, password, role, region, secretKey } = parsed;

    const inputKey = (secretKey || '').trim();
    const serverKeyPWNU = (process.env.SECRET_KEY_PWNU ?? 'PWNU_JATENG_BOSS').trim();
    const serverKeyPCNU = (process.env.SECRET_KEY_PCNU ?? 'PCNU_JATENG_MEMBER').trim();

    const roleRequirement: Record<string, string> = {
      ADMIN_PWNU: serverKeyPWNU,
      PWNU: serverKeyPWNU,
      ADMIN_PCNU: serverKeyPCNU,
      STAFF_PWNU: serverKeyPWNU,
      STAFF_PCNU: serverKeyPCNU,
    };

    if (role && roleRequirement[role] && inputKey !== roleRequirement[role]) {
      throw new UnauthorizedException(`KODE OTORITAS ${role} TIDAK VALID!`);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const lowerUsername = username.toLowerCase().trim();
    const userCode = generateCode(region);

    try {
      const user = await this.prisma.user.create({
        data: {
          fullName: fullName,
          region,
          username: lowerUsername,
          passwordHash: hashedPassword,
          role: role as any,
          userCode,
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          role: true,
          region: true,
          userCode: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: 'Pendaftaran Berhasil! Silakan Masuk.',
        user: {
          id: user.id,
          full_name: user.fullName,
          username: user.username,
          role: user.role,
          region: user.region,
          user_code: user.userCode,
          created_at: user.createdAt,
        },
      };
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
        throw new ConflictException('USERNAME SUDAH TERDAFTAR');
      }
      throw new UnauthorizedException('INTERNAL SERVER ERROR PADA DATABASE');
    }
  }

  async login(loginDto: LoginDto) {
    const parsed = loginSchema.parse(loginDto);
    const { username, password } = parsed;

    const lowerUsername = username.toLowerCase().trim();

    try {
      const user = await this.prisma.user.findUnique({
        where: { username: lowerUsername },
      });

      if (!user) {
        await this.auditService.log(null, 'FAILED_LOGIN', 'user', lowerUsername);
        throw new UnauthorizedException('Akun tidak ditemukan');
      }

      let isMatch = false;
      if (user.passwordHash.startsWith('$2') || user.passwordHash.length > 30) {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } else {
        isMatch = password === user.passwordHash;
      }

      if (!isMatch) {
        await this.auditService.log(user.id, 'FAILED_LOGIN', 'user', user.id);
        throw new UnauthorizedException('Password salah');
      }

      const volunteer = await this.prisma.volunteer.findUnique({
        where: { userId: user.id },
      });

      const keys = getOrCreateRSAKeyPair();
      const regionId = user.region?.match(/(?:KABUPATEN|KOTA)\s+(\w+)/i)?.[1] || user.region;

      const payload = {
        id: user.id,
        role: user.role,
        region: user.region,
        region_id: regionId,
      };

      const accessToken = this.jwtService.sign(payload, {
        privateKey: keys.privateKey,
        algorithm: 'RS256',
        expiresIn: '15m',
      });

      const refreshToken = this.jwtService.sign(payload, {
        privateKey: keys.privateKey,
        algorithm: 'RS256',
        expiresIn: '7d',
      });

      await this.auditService.log(user.id, 'LOGIN', 'user', user.id);

      return {
        success: true,
        message: 'Login Berhasil',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          full_name: user.fullName,
          role: user.role,
          region: user.region,
          volunteer: volunteer || null,
        },
      };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
        throw err;
      }
      throw new UnauthorizedException('Terjadi kesalahan internal pada server');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const parsed = forgotPasswordSchema.parse(forgotPasswordDto);
    const { email } = parsed;

    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return {
        success: true,
        message: 'Jika email terdaftar, OTP akan dikirim dalam 5 menit',
      };
    }

    const userId = user.id;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert OTP - use raw query for ON CONFLICT
    await this.prisma.$executeRaw`
      INSERT INTO password_reset_otps (user_id, otp, expires_at, created_at)
      VALUES (${user.id}, ${otp}, ${expiresAt}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        otp = EXCLUDED.otp,
        expires_at = EXCLUDED.expires_at,
        created_at = EXCLUDED.created_at,
        used = false
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Kode OTP Reset Password - NURisk',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a56db;">Reset Password - NURisk</h2>
            <p>Halo <strong>${user.fullName}</strong>,</p>
            <p>Anda meminta reset password. Berikut adalah kode OTP Anda:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p><strong>Kode ini berlaku selama 5 menit.</strong></p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">NURisk - Pusdatin NU Peduli</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr);
      throw new UnauthorizedException('Gagal mengirim email OTP');
    }

    return {
      success: true,
      message: 'Jika email terdaftar, OTP akan dikirim dalam 5 menit',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const parsed = resetPasswordSchema.parse(resetPasswordDto);
    const { email, otp, newPassword } = parsed;

    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Email tidak terdaftar');
    }

    // Verify OTP using raw query
    const otpResult = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM password_reset_otps 
       WHERE user_id = $1 AND otp = $2 AND used = false AND expires_at > NOW()`,
      user.id,
      otp
    );

    if (!otpResult || otpResult.length === 0) {
      throw new UnauthorizedException('OTP tidak valid atau sudah kedaluwarsa');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.$executeRawUnsafe(
      `UPDATE password_reset_otps SET used = true WHERE user_id = $1`,
      user.id
    );

    return {
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    };
  }

  async verifyAccount(dto: VerifyAccountDto) {
    const parsed = verifyAccountSchema.parse(dto);
    const { userId, otp } = parsed;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const otpResult = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM user_verification_otps 
       WHERE user_id = $1 AND otp = $2 AND used = false AND expires_at > NOW()`,
      String(userId),
      otp
    );

    if (!otpResult || otpResult.length === 0) {
      throw new UnauthorizedException('Kode verifikasi tidak valid atau sudah kedaluwarsa');
    }

    await this.prisma.$executeRawUnsafe(
      `UPDATE user_verification_otps SET used = true WHERE user_id = $1`,
      String(userId)
    );

    return { success: true, message: 'Akun berhasil diverifikasi' };
  }
}