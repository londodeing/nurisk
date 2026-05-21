import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';

import { NotificationsRepository } from './notifications.repository';

import type { Notification, NotificationFilter, NotificationStatistics } from '@nurisk/shared-types';
import {
  createNotificationSchema,
  broadcastNotificationSchema,
} from '@nurisk/validation/notification';
export { createNotificationSchema };
export { broadcastNotificationSchema as broadcastSchema };

export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;
export type BroadcastDTO = z.infer<typeof broadcastNotificationSchema>;

export class NotificationsService {
  constructor(
    private notificationsRepository: NotificationsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateNotificationDTO): Promise<any> {
    const parsed = createNotificationSchema.parse(dto);

    const notification = await this.notificationsRepository.create({
      ...parsed,
      body: parsed.message || '',
    });

    this.eventEmitter.emit('notification.created', notification);

    return {
      success: true,
      message: 'Notification berhasil dibuat',
      data: notification,
    };
  }

  async findById(id: string): Promise<any> {
    const notification = await this.notificationsRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification tidak ditemukan');
    }

    return {
      success: true,
      data: notification,
    };
  }

  async findAll(userId: string, role: string, region?: string, limit?: number): Promise<any> {
    const notifications = await this.notificationsRepository.findAll(userId, role, region, limit);

    return {
      success: true,
      data: notifications,
      count: notifications.length,
    };
  }

  async markAsRead(id: string, userId: string): Promise<any> {
    await this.notificationsRepository.markAsRead(id, userId);

    return {
      success: true,
      message: 'Notification ditandai sudah dibaca',
    };
  }

  async markAllAsRead(userId: string): Promise<any> {
    await this.notificationsRepository.markAllAsRead(userId);

    return {
      success: true,
      message: 'Semua notification ditandai sudah dibaca',
    };
  }

  async broadcast(dto: BroadcastDTO): Promise<any> {
    const parsed = broadcastNotificationSchema.parse(dto);

    const notification = await this.notificationsRepository.broadcast(parsed);

    this.eventEmitter.emit('notification.broadcast', notification);

    return {
      success: true,
      message: 'Broadcast berhasil dikirim',
      data: notification,
    };
  }

  async getUnreadCount(userId: string, role: string, region?: string): Promise<any> {
    const count = await this.notificationsRepository.getUnreadCount(userId, role, region);

    return {
      success: true,
      count,
    };
  }
}