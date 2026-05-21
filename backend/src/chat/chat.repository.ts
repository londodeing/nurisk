import { Injectable } from '@nestjs/common';
import { Prisma, ChatConversation, ChatMessage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(incidentId: string, type: string = 'incident') {
    const existing = await this.prisma.chatConversation.findFirst({
      where: { incidentId, type: type as any },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.chatConversation.create({
      data: {
        incidentId,
        type: type as any,
      },
    });
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, username: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    message: string;
    messageType?: string;
    location?: { lat: number; lng: number };
    mediaUrl?: string;
    readBy?: string[];
  }) {
    return this.prisma.chatMessage.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        message: data.message,
        messageType: (data.messageType as any) || 'TEXT',
        location: data.location,
        mediaUrl: data.mediaUrl,
        readBy: data.readBy || [data.senderId],
      },
      include: { sender: { select: { id: true, username: true, fullName: true } } },
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (message && !message.readBy.includes(userId)) {
      await this.prisma.chatMessage.update({
        where: { id: messageId },
        data: { readBy: { push: userId } },
      });
    }
  }

  async getTeamMessages(region: string, limit: number = 50): Promise<any[]> {
    // Team messages would need a separate table or use notifications
    // This is a placeholder - would need model definition
    return [];
  }

  async createTeamMessage(data: {
    region: string;
    senderId: string;
    senderName: string;
    message: string;
  }) {
    // Team messages would need a separate table or use notifications
    // This is a placeholder - would need model definition
    return { id: Date.now().toString(), ...data };
  }

  async broadcast(data: {
    region: string;
    senderId: string;
    senderName: string;
    message: string;
    targetRole?: string;
  }) {
    // Create notification for broadcast
    return this.prisma.notification.create({
      data: {
        title: `Broadcast dari ${data.senderName}`,
        body: data.message,
        targetRole: data.targetRole,
        targetRegion: data.region,
        type: 'broadcast',
        status: 'PENDING',
      },
    });
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';