import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BriefingController } from './briefing.controller';
import { BriefingService } from './briefing.service';

@Module({
  controllers: [BriefingController],
  providers: [BriefingService, PrismaService],
  exports: [BriefingService],
})
export class BriefingModule {}
