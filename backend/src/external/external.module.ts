import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';

@Module({
  controllers: [ExternalController],
  providers: [
    ExternalService,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [ExternalService],
})
export class ExternalModule {}