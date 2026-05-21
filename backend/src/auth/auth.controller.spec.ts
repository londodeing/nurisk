import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterDto = {
      full_name: 'John Doe',
      username: 'johndoe',
      password: 'password123',
      role: 'RELAWAN',
      region: 'SEMARANG',
    };

    it('should register a new user successfully', async () => {
      const expectedResult = {
        success: true,
        message: 'Pendaftaran Berhasil! Silakan Masuk.',
        user: {
          id: 1,
          full_name: 'John Doe',
          username: 'johndoe',
          role: 'RELAWAN',
          region: 'SEMARANG',
          user_code: 'NU-SEM-25051234',
          created_at: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(validRegisterDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should throw BadRequestException for invalid register data - missing full_name', async () => {
      const invalidDto = {
        username: 'johndoe',
        password: 'password123',
        role: 'RELAWAN',
        region: 'SEMARANG',
      } as any;

      await expect(controller.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid register data - short password', async () => {
      const invalidDto = {
        full_name: 'John Doe',
        username: 'johndoe',
        password: '123', // Less than 6 characters
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      await expect(controller.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid register data - short username', async () => {
      const invalidDto = {
        full_name: 'John Doe',
        username: 'jo', // Less than 3 characters
        password: 'password123',
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      await expect(controller.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for duplicate username', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('USERNAME SUDAH TERDAFTAR'),
      );

      await expect(controller.register(validRegisterDto)).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException for invalid secret key', async () => {
      const adminDto = {
        full_name: 'Admin User',
        username: 'adminuser',
        password: 'password123',
        role: 'ADMIN_PWNU',
        region: 'SEMARANG',
        secret_key: 'WRONG_KEY',
      };

      mockAuthService.register.mockRejectedValue(
        new UnauthorizedException('KODE OTORITAS ADMIN_PWNU TIDAK VALID!'),
      );

      await expect(controller.register(adminDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const validLoginDto = {
      username: 'johndoe',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const expectedResult = {
        success: true,
        message: 'Login Berhasil',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: 1,
          full_name: 'John Doe',
          role: 'RELAWAN',
          region: 'SEMARANG',
          volunteer: null,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(validLoginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should throw BadRequestException for invalid login data - missing username', async () => {
      const invalidDto = {
        password: 'password123',
      } as any;

      await expect(controller.login(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid login data - missing password', async () => {
      const invalidDto = {
        username: 'johndoe',
      } as any;

      await expect(controller.login(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Akun tidak ditemukan'),
      );

      await expect(controller.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Password salah'),
      );

      const wrongPasswordDto = {
        username: 'johndoe',
        password: 'wrongpassword',
      };

      await expect(controller.login(wrongPasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    const validForgotPasswordDto = {
      email: 'johndoe@example.com',
    };

    it('should send OTP successfully for valid email', async () => {
      const expectedResult = {
        success: true,
        message: 'Jika email terdaftar, OTP akan dikirim dalam 5 menit',
      };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(validForgotPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(validForgotPasswordDto);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const invalidDto = {
        email: 'not-an-email',
      };

      await expect(controller.forgotPassword(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    const validResetPasswordDto = {
      email: 'johndoe@example.com',
      otp: '123456',
      newPassword: 'newpassword123',
    };

    it('should reset password successfully with valid OTP', async () => {
      const expectedResult = {
        success: true,
        message: 'Password berhasil direset. Silakan login dengan password baru.',
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(validResetPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(validResetPasswordDto);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const invalidDto = {
        email: 'not-an-email',
        otp: '123456',
        newPassword: 'newpassword123',
      };

      await expect(controller.resetPassword(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid OTP length', async () => {
      const invalidDto = {
        email: 'johndoe@example.com',
        otp: '12345', // Less than 6 digits
        newPassword: 'newpassword123',
      };

      await expect(controller.resetPassword(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for short new password', async () => {
      const invalidDto = {
        email: 'johndoe@example.com',
        otp: '123456',
        newPassword: '123', // Less than 6 characters
      };

      await expect(controller.resetPassword(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for invalid or expired OTP', async () => {
      mockAuthService.resetPassword.mockRejectedValue(
        new UnauthorizedException('OTP tidak valid atau sudah kedaluwarsa'),
      );

      await expect(controller.resetPassword(validResetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});