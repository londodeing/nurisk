import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import {
  BroadcastDTO,
  broadcastSchema,
  SendMessageDTO,
  sendMessageSchema,
  ChatService,
} from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':incidentId')
  async getConversation(@Param('incidentId') incidentId: string) {
    return this.chatService.getConversation(incidentId);
  }

  @Get(':incidentId/messages')
  async getMessages(
    @Param('incidentId') incidentId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getMessages(
      incidentId,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  }

  @Post('message')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: SendMessageDTO,
    // In real implementation, get from JWT guard
    @Query('sender_id') senderId?: string,
    @Query('sender_name') senderName?: string,
  ) {
    // Use query params as fallback (in real app, get from JWT)
    const senderIdStr = senderId || '00000000-0000-0000-0000-000000000001';
    const senderNameStr = senderName || 'System';
    return this.chatService.sendMessage(dto, senderIdStr, senderNameStr);
  }

  @Post('message/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Query('message_id') messageId: string,
    @Query('user_id') userId: string,
  ) {
    return this.chatService.markAsRead(messageId, userId);
  }

  @Get('team/:region')
  async getTeamMessages(
    @Param('region') region: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getTeamMessages(
      region,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('broadcast')
  @HttpCode(HttpStatus.CREATED)
  async broadcast(
    @Body(new ZodValidationPipe(broadcastSchema)) dto: BroadcastDTO,
    @Query('sender_id') senderId?: string,
    @Query('sender_name') senderName?: string,
  ) {
    const senderIdStr = senderId || '00000000-0000-0000-0000-000000000001';
    const senderNameStr = senderName || 'System';
    return this.chatService.broadcast(dto, senderIdStr, senderNameStr);
  }
}