import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}