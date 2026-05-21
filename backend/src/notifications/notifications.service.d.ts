import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import { NotificationsRepository } from './notifications.repository';
import { createNotificationSchema, broadcastNotificationSchema } from '@nurisk/validation/notification';
export { createNotificationSchema };
export { broadcastNotificationSchema as broadcastSchema };
export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;
export type BroadcastDTO = z.infer<typeof broadcastNotificationSchema>;
export declare class NotificationsService {
    private notificationsRepository;
    private eventEmitter;
    constructor(notificationsRepository: NotificationsRepository, eventEmitter: EventEmitter2);
    create(dto: CreateNotificationDTO): Promise<any>;
    findById(id: string): Promise<any>;
    findAll(userId: string, role: string, region?: string, limit?: number): Promise<any>;
    markAsRead(id: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    broadcast(dto: BroadcastDTO): Promise<any>;
    getUnreadCount(userId: string, role: string, region?: string): Promise<any>;
}
//# sourceMappingURL=notifications.service.d.ts.map