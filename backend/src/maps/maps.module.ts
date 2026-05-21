import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { MapsRepository } from './maps.repository';

@Module({
  controllers: [MapsController],
  providers: [
    MapsService,
    MapsRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [MapsService, MapsRepository],
})
export class MapsModule {}