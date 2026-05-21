import { Injectable } from '@nestjs/common';
import { Prisma, Notification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    body: string;
    targetRole?: string;
    targetRegion?: string;
    incidentId?: string;
    type?: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        body: data.body,
        targetRole: data.targetRole,
        targetRegion: data.targetRegion,
        incidentId: data.incidentId,
        type: data.type || 'broadcast',
        status: 'PENDING',
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async findAll(
    userId: string,
    role: string,
    region?: string,
    limit: number = 50
  ): Promise<Notification[]> {
    const where: Prisma.NotificationWhereInput = {
      OR: [
        { targetRole: null },
        { targetRole: role },
      ],
    };

    if (region) {
      where.AND = {
        OR: [
          { targetRegion: null },
          { targetRegion: { contains: region, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async broadcast(data: {
    title: string;
    body: string;
    targetRole?: string;
    targetRegion?: string;
    incidentId?: string;
  }): Promise<Notification> {
    return this.create({
      ...data,
      type: 'broadcast',
    });
  }

  async getUnreadCount(
    userId: string,
    role: string,
    region?: string
  ): Promise<number> {
    const where: Prisma.NotificationWhereInput = {
      isRead: false,
      OR: [
        { targetRole: null },
        { targetRole: role },
      ],
    };

    if (region) {
      where.AND = {
        OR: [
          { targetRegion: null },
          { targetRegion: { contains: region, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.notification.count({ where });
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';