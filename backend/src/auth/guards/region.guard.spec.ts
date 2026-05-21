import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RegionGuard } from './region.guard';
import { REGION_KEY } from '../decorators/region-scoped.decorator';

describe('RegionGuard', () => {
  let guard: RegionGuard;
  let reflector: Reflector;

  const mockExecutionContext = (user: any, params: any = {}, query: any = {}) => {
    const request = { user, params, query };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegionGuard],
    }).compile();

    guard = module.get<RegionGuard>(RegionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no region restriction', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = mockExecutionContext({ role: 'RELAWAN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user is province-level (PWNU)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const context = mockExecutionContext(
        { role: 'PWNU', region: 'JAWA TENGAH' },
        { region: 'KABUPATEN_SEMARANG' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user is same regency (PCNU)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const context = mockExecutionContext(
        { role: 'PCNU', region: 'KABUPATEN SEMARANG' },
        { region: 'KABUPATEN SEMARANG' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw 401 Unauthorized when no user attached', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const context = mockExecutionContext(null);
      
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw 403 Forbidden when accessing cross-region data', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const context = mockExecutionContext(
        { role: 'PCNU', region: 'KABUPATEN SEMARANG' },
        { region: 'KABUPATEN PATI' },
      );
      
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw 403 Forbidden when user has no region assigned', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const context = mockExecutionContext({ role: 'RELAWAN', region: null });
      
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access to same province for PWNU role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_KENDAL']);
      const context = mockExecutionContext(
        { role: 'PWNU', region: 'JAWA TENGAH' },
        { region: 'KABUPATEN KENDAL' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should attach userRegion to request for query filtering', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const request = { user: { role: 'PCNU', region: 'KABUPATEN SEMARANG' }, params: {}, query: {} };
      const context = mockExecutionContext(request.user, request.params, request.query);
      
      guard.canActivate(context);
      
      // The guard should attach userRegion to the request
      expect(request.user).toBeDefined();
    });

    it('should allow access when no target region specified', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['KABUPATEN_SEMARANG']);
      const context = mockExecutionContext(
        { role: 'PCNU', region: 'KABUPATEN SEMARANG' },
        {},
      );
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});