import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { LogisticsRepository } from './logistics.repository';

@Module({
  controllers: [LogisticsController],
  providers: [LogisticsService, LogisticsRepository],
  exports: [LogisticsService],
})
export class LogisticsModule {}