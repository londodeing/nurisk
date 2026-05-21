import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RegionGuard } from './guards/region.guard';

function getJwtSecret(): string {
  // RS256 requires public key - fail if not configured
  if (!process.env.JWT_PUBLIC_KEY) {
    throw new Error('JWT_PUBLIC_KEY environment variable is required for RS256 authentication');
  }
  return process.env.JWT_PUBLIC_KEY;
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { 
        algorithm: 'RS256',
        expiresIn: '15m', // Default, overridden in service for refresh token
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    RegionGuard,
  ],
  exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, PermissionsGuard, RegionGuard],
})
export class AuthModule {}