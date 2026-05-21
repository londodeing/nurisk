import request from 'supertest';
import * as express from 'express';

// Import the Express app
const app = require('../app');

// Note: This e2e test requires the Express app to be running
// In a real CI/CD environment, you would use test containers or a dedicated test database.

describe('Auth (e2e)', () => {
  let server: any;

  // Test user data
  const testUser = {
    full_name: 'E2E Test User',
    username: `e2etest_${Date.now()}`,
    password: 'password123',
    role: 'RELAWAN',
    region: 'SEMARANG',
  };

  let accessToken: string;
  let refreshToken: string;

  beforeAll((done) => {
    // Get the underlying HTTP server
    server = app.listen(7861, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Full Register-Login-Refresh Cycle', () => {
    it('should register a new user', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pendaftaran Berhasil! Silakan Masuk.');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(testUser.username.toLowerCase());
      expect(response.body.user.role).toBe(testUser.role);
    });

    it('should reject duplicate username registration', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409); // Conflict

      expect(response.body.message).toBe('USERNAME SUDAH TERDAFTAR');
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        username: testUser.username,
        password: testUser.password,
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login Berhasil');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();

      // Store tokens for refresh test
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject login with wrong password', async () => {
      const loginDto = {
        username: testUser.username,
        password: 'wrongpassword',
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Password salah');
    });

    it('should reject login with non-existent username', async () => {
      const loginDto = {
        username: 'nonexistent_user_12345',
        password: 'password123',
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Akun tidak ditemukan');
    });

    it('should validate registration input - missing full_name', async () => {
      const invalidDto = {
        username: 'newuser',
        password: 'password123',
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should validate registration input - short password', async () => {
      const invalidDto = {
        full_name: 'New User',
        username: 'newuser',
        password: '123', // Less than 6 characters
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should validate registration input - short username', async () => {
      const invalidDto = {
        full_name: 'New User',
        username: 'ab', // Less than 3 characters
        password: 'password123',
        role: 'RELAWAN',
        region: 'SEMARANG',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should validate login input - missing username', async () => {
      const invalidDto = {
        password: 'password123',
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should validate login input - missing password', async () => {
      const invalidDto = {
        username: 'testuser',
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should register ADMIN_PWNU with correct secret key', async () => {
      const adminDto = {
        full_name: 'Admin PWNU',
        username: `adminpwnu_${Date.now()}`,
        password: 'password123',
        role: 'ADMIN_PWNU',
        region: 'SEMARANG',
        secret_key: 'PWNU_JATENG_BOSS',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(adminDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('ADMIN_PWNU');
    });

    it('should reject ADMIN_PWNU with wrong secret key', async () => {
      const adminDto = {
        full_name: 'Admin PWNU',
        username: `adminpwnu_wrong_${Date.now()}`,
        password: 'password123',
        role: 'ADMIN_PWNU',
        region: 'SEMARANG',
        secret_key: 'WRONG_KEY',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(adminDto)
        .expect(401);

      expect(response.body.message).toContain('KODE OTORITAS');
    });

    it('should register ADMIN_PCNU with correct secret key', async () => {
      const adminDto = {
        full_name: 'Admin PCNU',
        username: `adminpcnu_${Date.now()}`,
        password: 'password123',
        role: 'ADMIN_PCNU',
        region: 'SEMARANG',
        secret_key: 'PCNU_JATENG_MEMBER',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(adminDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('ADMIN_PCNU');
    });

    it('should reject ADMIN_PCNU with wrong secret key', async () => {
      const adminDto = {
        full_name: 'Admin PCNU',
        username: `adminpcnu_wrong_${Date.now()}`,
        password: 'password123',
        role: 'ADMIN_PCNU',
        region: 'SEMARANG',
        secret_key: 'WRONG_KEY',
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(adminDto)
        .expect(401);

      expect(response.body.message).toContain('KODE OTORITAS');
    });
  });

  describe('Forgot Password Flow', () => {
    it('should return success for non-existent email (security)', async () => {
      const forgotDto = {
        email: 'nonexistent@example.com',
      };

      const response = await request(server)
        .post('/api/auth/forgot-password')
        .send(forgotDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Jika email terdaftar, OTP akan dikirim dalam 5 menit');
    });

    it('should validate forgot password - invalid email format', async () => {
      const invalidDto = {
        email: 'not-an-email',
      };

      const response = await request(server)
        .post('/api/auth/forgot-password')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });
  });

  describe('Reset Password Flow', () => {
    it('should validate reset password - invalid email format', async () => {
      const invalidDto = {
        email: 'not-an-email',
        otp: '123456',
        newPassword: 'newpassword123',
      };

      const response = await request(server)
        .post('/api/auth/reset-password')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should validate reset password - invalid OTP length', async () => {
      const invalidDto = {
        email: 'test@example.com',
        otp: '12345', // Less than 6 digits
        newPassword: 'newpassword123',
      };

      const response = await request(server)
        .post('/api/auth/reset-password')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should validate reset password - short new password', async () => {
      const invalidDto = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: '123', // Less than 6 characters
      };

      const response = await request(server)
        .post('/api/auth/reset-password')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });
  });
});