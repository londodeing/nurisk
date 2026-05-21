import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';
import { VolunteersRepository } from './volunteers.repository';

@Module({
  controllers: [VolunteersController],
  providers: [
    VolunteersService,
    VolunteersRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [VolunteersService, VolunteersRepository],
})
export class VolunteersModule {}