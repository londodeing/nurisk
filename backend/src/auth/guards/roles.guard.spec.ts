import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Role types matching shared/enums/role.ts
type UserRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN_PWNU'
  | 'PWNU'
  | 'STAFF_PWNU'
  | 'COMMANDER'
  | 'ADMIN_PCNU'
  | 'STAFF_PCNU'
  | 'FIELD_STAFF'
  | 'RELAWAN';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (user: any, requiredRoles: UserRole[] = []) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has valid role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN_PWNU', 'PWNU']);
      const context = mockExecutionContext({ role: 'PWNU' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has higher role in hierarchy', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['STAFF_PWNU']);
      const context = mockExecutionContext({ role: 'ADMIN_PWNU' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw 401 Unauthorized when no user attached', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN_PWNU']);
      const context = mockExecutionContext(null);
      
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw 403 Forbidden when user role is not in required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN_PWNU', 'PWNU']);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw 403 Forbidden for invalid role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN_PWNU']);
      const context = mockExecutionContext({ role: 'INVALID_ROLE' as UserRole });
      
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to access any role-protected route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['STAFF_PCNU']);
      const context = mockExecutionContext({ role: 'SUPER_ADMIN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow FIELD_STAFF to access FIELD_STAFF routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['FIELD_STAFF']);
      const context = mockExecutionContext({ role: 'FIELD_STAFF' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow multiple required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN_PWNU', 'STAFF_PWNU', 'FIELD_STAFF']);
      const context = mockExecutionContext({ role: 'STAFF_PWNU' });
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});