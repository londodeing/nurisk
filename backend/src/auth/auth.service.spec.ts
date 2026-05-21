import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

// Mock modules before importing the service
const mockQuery = jest.fn();

jest.mock('../config/database', () => ({
  __esModule: true,
  default: { query: mockQuery },
  pool: { query: mockQuery },
}));

jest.mock('../utils/generateCode', () => ({
  __esModule: true,
  generateCode: jest.fn().mockReturnValue('NU-SEM-25051234'),
}));

jest.mock('../utils/email', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockResolvedValue(true),
}));

// Import after mocks are set up
import { pool } from '../config/database';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockPool = { query: mockQuery };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

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
      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        username: 'johndoe',
        role: 'RELAWAN',
        region: 'SEMARANG',
        user_code: 'NU-SEM-25051234',
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await service.register(validRegisterDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Pendaftaran Berhasil! Silakan Masuk.');
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('johndoe');
    });

    it('should throw ConflictException for duplicate username', async () => {
      mockPool.query.mockRejectedValueOnce({ code: '23505' });

      await expect(service.register(validRegisterDto)).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException for invalid secret key for ADMIN_PWNU role', async () => {
      const adminDto = {
        full_name: 'Admin User',
        username: 'adminuser',
        password: 'password123',
        role: 'ADMIN_PWNU',
        region: 'SEMARANG',
        secret_key: 'WRONG_KEY',
      };

      await expect(service.register(adminDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid secret key for ADMIN_PCNU role', async () => {
      const adminDto = {
        full_name: 'PCNU Admin',
        username: 'pcnuadmin',
        password: 'password123',
        role: 'ADMIN_PCNU',
        region: 'SEMARANG',
        secret_key: 'WRONG_KEY',
      };

      await expect(service.register(adminDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should register ADMIN_PWNU with correct secret key', async () => {
      process.env.SECRET_KEY_PWNU = 'PWNU_JATENG_BOSS';

      const adminDto = {
        full_name: 'Admin User',
        username: 'adminuser',
        password: 'password123',
        role: 'ADMIN_PWNU',
        region: 'SEMARANG',
        secret_key: 'PWNU_JATENG_BOSS',
      };

      const mockUser = {
        id: 1,
        full_name: 'Admin User',
        username: 'adminuser',
        role: 'ADMIN_PWNU',
        region: 'SEMARANG',
        user_code: 'NU-SEM-25051234',
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await service.register(adminDto);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('ADMIN_PWNU');
    });

    it('should register ADMIN_PCNU with correct secret key', async () => {
      process.env.SECRET_KEY_PCNU = 'PCNU_JATENG_MEMBER';

      const adminDto = {
        full_name: 'PCNU Admin',
        username: 'pcnuadmin',
        password: 'password123',
        role: 'ADMIN_PCNU',
        region: 'SEMARANG',
        secret_key: 'PCNU_JATENG_MEMBER',
      };

      const mockUser = {
        id: 1,
        full_name: 'PCNU Admin',
        username: 'pcnuadmin',
        role: 'ADMIN_PCNU',
        region: 'SEMARANG',
        user_code: 'NU-SEM-25051234',
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await service.register(adminDto);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('ADMIN_PCNU');
    });

    it('should hash password with bcrypt', async () => {
      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        username: 'johndoe',
        role: 'RELAWAN',
        region: 'SEMARANG',
        user_code: 'NU-SEM-25051234',
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      await service.register(validRegisterDto);

      // Check that query was called with a hashed password
      const queryCall = mockPool.query.mock.calls[0];
      const hashedPassword = queryCall[1][3]; // $2... indicates bcrypt hash

      expect(hashedPassword.startsWith('$2')).toBe(true);
    });
  });

  describe('login', () => {
    const validLoginDto = {
      username: 'johndoe',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        username: 'johndoe',
        password: hashedPassword,
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] }) // User query
        .mockResolvedValueOnce({ rows: [] }); // Volunteer query

      mockJwtService.sign
        .mockReturnValueOnce('mock_access_token')
        .mockReturnValueOnce('mock_refresh_token');

      const result = await service.login(validLoginDto);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.user).toBeDefined();
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        username: 'johndoe',
        password: hashedPassword,
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const wrongPasswordDto = {
        username: 'johndoe',
        password: 'wrongpassword',
      };

      await expect(service.login(wrongPasswordDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle legacy plain text password', async () => {
      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        username: 'johndoe',
        password: 'plaintextpassword', // Legacy plain text
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [] });

      mockJwtService.sign
        .mockReturnValueOnce('mock_access_token')
        .mockReturnValueOnce('mock_refresh_token');

      const result = await service.login(validLoginDto);

      expect(result.success).toBe(true);
    });

    it('should return volunteer data if user is a volunteer', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        username: 'johndoe',
        password: hashedPassword,
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      const mockVolunteer = {
        id: 1,
        user_id: 1,
        volunteer_code: 'VOL-SEM-001',
        status: 'ACTIVE',
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [mockVolunteer] });

      mockJwtService.sign
        .mockReturnValueOnce('mock_access_token')
        .mockReturnValueOnce('mock_refresh_token');

      const result = await service.login(validLoginDto);

      expect(result.user.volunteer).toBeDefined();
      expect(result.user.volunteer?.volunteer_code).toBe('VOL-SEM-001');
    });
  });

  describe('forgotPassword', () => {
    const validForgotPasswordDto = {
      email: 'johndoe@example.com',
    };

    it('should return success message even if email not found (security)', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.forgotPassword(validForgotPasswordDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Jika email terdaftar, OTP akan dikirim dalam 5 menit');
    });

    it('should generate and store OTP for valid email', async () => {
      const mockUser = {
        id: 1,
        full_name: 'John Doe',
        email: 'johndoe@example.com',
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] }) // Find user
        .mockResolvedValueOnce({ rows: [] }); // Insert OTP

      const result = await service.forgotPassword(validForgotPasswordDto);

      expect(result.success).toBe(true);
      // Check that OTP was inserted
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetPassword', () => {
    const validResetPasswordDto = {
      email: 'johndoe@example.com',
      otp: '123456',
      newPassword: 'newpassword123',
    };

    it('should throw NotFoundException for non-existent email', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.resetPassword(validResetPasswordDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      const mockUser = {
        id: 1,
        email: 'johndoe@example.com',
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] }) // Find user
        .mockResolvedValueOnce({ rows: [] }); // Invalid OTP

      await expect(service.resetPassword(validResetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reset password successfully with valid OTP', async () => {
      const mockUser = {
        id: 1,
        email: 'johndoe@example.com',
      };

      const mockOtp = {
        id: 1,
        user_id: 1,
        otp: '123456',
        used: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] }) // Find user
        .mockResolvedValueOnce({ rows: [mockOtp] }) // Verify OTP
        .mockResolvedValueOnce({ rows: [] }) // Update password
        .mockResolvedValueOnce({ rows: [] }); // Mark OTP as used

      const result = await service.resetPassword(validResetPasswordDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password berhasil direset. Silakan login dengan password baru.');
    });

    it('should throw UnauthorizedException for expired OTP', async () => {
      const mockUser = {
        id: 1,
        email: 'johndoe@example.com',
      };

      const mockOtp = {
        id: 1,
        user_id: 1,
        otp: '123456',
        used: false,
        expires_at: new Date(Date.now() - 10 * 60 * 1000), // Expired
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [] }); // No valid OTP

      await expect(service.resetPassword(validResetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for already used OTP', async () => {
      const mockUser = {
        id: 1,
        email: 'johndoe@example.com',
      };

      const mockOtp = {
        id: 1,
        user_id: 1,
        otp: '123456',
        used: true, // Already used
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [] }); // No valid OTP (used = true)

      await expect(service.resetPassword(validResetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});