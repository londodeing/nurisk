import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { BuildingsRepository } from './buildings.repository';

@Module({
  controllers: [BuildingsController],
  providers: [
    BuildingsService,
    BuildingsRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [BuildingsService, BuildingsRepository],
})
export class BuildingsModule {}