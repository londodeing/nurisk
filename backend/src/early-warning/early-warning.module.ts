import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EarlyWarningController } from './early-warning.controller';
import { EarlyWarningService } from './early-warning.service';

@Module({
  controllers: [EarlyWarningController],
  providers: [EarlyWarningService, PrismaService],
  exports: [EarlyWarningService],
})
export class EarlyWarningModule {}
