import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatRepository,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}