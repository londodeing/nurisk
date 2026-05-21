import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';
import { IncidentRepository } from './incident.repository';

@Module({
  controllers: [IncidentController],
  providers: [
    IncidentService,
    IncidentRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [IncidentService, IncidentRepository],
})
export class IncidentModule {}