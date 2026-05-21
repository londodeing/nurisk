import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

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

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const mockExecutionContext = (user: any) => {
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
      providers: [PermissionsGuard],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no permissions required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has all required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:read', 'incident:create']);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw 401 Unauthorized when no user attached', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:create']);
      const context = mockExecutionContext(null);
      
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw 403 Forbidden when user lacks required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:delete', 'user:delete']);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to access any permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:delete', 'user:delete', 'logistics:approve']);
      const context = mockExecutionContext({ role: 'SUPER_ADMIN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow ADMIN_PWNU to have multiple permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:create', 'incident:approve', 'volunteer:assign']);
      const context = mockExecutionContext({ role: 'ADMIN_PWNU' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw 403 with missing permissions in error message', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:delete', 'user:delete']);
      const context = mockExecutionContext({ role: 'FIELD_STAFF' });
      
      try {
        guard.canActivate(context);
        fail('Expected ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        const exception = error as any;
        expect(exception.getResponse().requiredPermissions).toContain('incident:delete');
        expect(exception.getResponse().requiredPermissions).toContain('user:delete');
      }
    });

    it('should allow FIELD_STAFF to create incidents', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:create']);
      const context = mockExecutionContext({ role: 'FIELD_STAFF' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow RELAWAN to create reports', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['report:create']);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny RELAWAN to approve incidents', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['incident:approve']);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});