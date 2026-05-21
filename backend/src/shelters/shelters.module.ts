import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { SheltersController } from './shelters.controller';
import { SheltersService } from './shelters.service';
import { SheltersRepository } from './shelters.repository';

@Module({
  controllers: [SheltersController],
  providers: [
    SheltersService,
    SheltersRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [SheltersService, SheltersRepository],
})
export class SheltersModule {}