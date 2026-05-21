import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}