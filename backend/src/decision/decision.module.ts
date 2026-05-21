import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DecisionController } from './decision.controller';
import { DecisionService } from './decision.service';

@Module({
  controllers: [DecisionController],
  providers: [DecisionService, PrismaService],
  exports: [DecisionService],
})
export class DecisionModule {}
