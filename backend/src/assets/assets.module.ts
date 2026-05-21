import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetsRepository } from './assets.repository';

@Module({
  controllers: [AssetsController],
  providers: [
    AssetsService,
    AssetsRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [AssetsService, AssetsRepository],
})
export class AssetsModule {}