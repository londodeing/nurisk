import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';

import { ChatRepository } from './chat.repository';
import { PrismaService } from '../prisma/prisma.service';

import type { Conversation, Message, ChatFilter, SendMessageRequest } from '@nurisk/shared-types';
import { sendMessageSchema, broadcastSchema } from '@nurisk/validation/chat';
export { sendMessageSchema, broadcastSchema };

export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
export type BroadcastDTO = z.infer<typeof broadcastSchema>;

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  async getConversation(incidentId: string, type: string = 'incident'): Promise<any> {
    const conversation = await this.chatRepository.getOrCreateConversation(incidentId, type);

    return {
      success: true,
      data: conversation,
    };
  }

  async getMessages(incidentId: string, limit?: number, offset?: number): Promise<any> {
    const conversation = await this.chatRepository.getOrCreateConversation(incidentId);
    const messages = await this.chatRepository.getMessages(conversation.id, limit, offset);

    return {
      success: true,
      data: messages,
    };
  }

  async sendMessage(dto: SendMessageDTO, senderId: string, senderName: string): Promise<any> {
    const parsed = sendMessageSchema.parse(dto);
    const { conversationId, messageType, content, location, mediaUrl } = parsed;

    // Get conversation by ID (not by incident)
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const msg = await this.chatRepository.createMessage({
      conversationId: conversation.id,
      senderId,
      message: content,
      messageType,
      location,
      mediaUrl,
    });

    this.eventEmitter.emit('chat.message', {
      conversationId: conversation.id,
      message: msg,
    });

    return {
      success: true,
      message: 'Pesan berhasil dikirim',
      data: msg,
    };
  }

  async markAsRead(messageId: string, userId: string): Promise<any> {
    await this.chatRepository.markAsRead(messageId, userId);

    return {
      success: true,
      message: 'Pesan ditandai sudah dibaca',
    };
  }

  async getTeamMessages(region: string, limit?: number): Promise<any> {
    const messages = await this.chatRepository.getTeamMessages(region, limit);

    return {
      success: true,
      data: messages,
    };
  }

  async broadcast(dto: BroadcastDTO, senderId: string, senderName: string): Promise<any> {
    const parsed = broadcastSchema.parse(dto);
    const { region, message, target_role } = parsed;

    const result = await this.chatRepository.broadcast({
      region,
      senderId,
      senderName,
      message: message,
      targetRole: target_role,
    });

    this.eventEmitter.emit('chat.broadcast', {
      region,
      message: result,
    });

    return {
      success: true,
      message: 'Broadcast berhasil dikirim',
      data: result,
    };
  }
}