import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppGateway } from './gateway.gateway';

@Module({
  providers: [AppGateway, JwtService],
  exports: [AppGateway],
})
export class GatewayModule {}