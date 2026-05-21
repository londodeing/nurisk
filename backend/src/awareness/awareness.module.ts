import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwarenessController } from './awareness.controller';
import { AwarenessService } from './awareness.service';

@Module({
  controllers: [AwarenessController],
  providers: [AwarenessService, PrismaService],
  exports: [AwarenessService],
})
export class AwarenessModule {}
