import { AuthService, LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyAccountDto } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    verify(verifyDto: VerifyAccountDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map