import { BroadcastDTO, CreateNotificationDTO, NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    create(dto: CreateNotificationDTO): Promise<any>;
    findAll(userId: string, role: string, region?: string, limit?: string): Promise<any>;
    findById(id: string): Promise<any>;
    markAsRead(id: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    broadcast(dto: BroadcastDTO): Promise<any>;
    getUnreadCount(userId: string, role: string, region?: string): Promise<any>;
}
//# sourceMappingURL=notifications.controller.d.ts.map