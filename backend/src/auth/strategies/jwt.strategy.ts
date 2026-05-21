import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { pool } from '../../config/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const publicKey = process.env.JWT_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('JWT_PUBLIC_KEY environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256'], // RS256 only - require public key
    });
  }

  async validate(payload: { id: string; role: string; region: string; region_id: string }) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id]);

      if (result.rows.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = result.rows[0];
      
      // Attach region_id from token for region-scoped validation
      // Fall back to extracted region_id if not in DB
      user.region_id = payload.region_id || user.region?.match(/(?:KABUPATEN|KOTA)\s+(\w+)/i)?.[1];
      
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}