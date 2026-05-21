import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HazardController } from './hazard.controller';
import { HazardService } from './hazard.service';

@Module({
  controllers: [HazardController],
  providers: [HazardService, PrismaService],
  exports: [HazardService],
})
export class HazardModule {}
