import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import { AuditService } from '../common/services/audit.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyAccountSchema } from '@nurisk/validation/auth';
import { PrismaService } from '../prisma/prisma.service';
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyAccountDto = z.infer<typeof verifyAccountSchema>;
export { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, verifyAccountSchema, };
export declare class AuthService {
    private jwtService;
    private prisma;
    private auditService;
    constructor(jwtService: JwtService, prisma: PrismaService, auditService: AuditService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            full_name: string | null;
            username: string;
            role: import("@prisma/client").$Enums.Role;
            region: string | null;
            user_code: never;
            created_at: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            full_name: string | null;
            role: import("@prisma/client").$Enums.Role;
            region: string | null;
            volunteer: {
                fullName: string | null;
                userId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                birthDate: Date | null;
                gender: string | null;
                bloodType: string | null;
                regency: string | null;
                district: string | null;
                village: string | null;
                detailAddress: string | null;
                medicalHistory: string | null;
                expertise: string | null;
                experience: string | null;
                status: string;
                statusTugas: string;
                lastLocation: string | null;
                rating: number | null;
                totalMissions: number;
                totalHours: number;
            } | null;
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyAccount(dto: VerifyAccountDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map