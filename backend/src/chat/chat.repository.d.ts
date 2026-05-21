import { Prisma, ChatMessage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class ChatRepository {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateConversation(incidentId: string, type?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        type: import("@prisma/client").$Enums.ChatType | null;
        incidentId: string | null;
        lastMessageAt: Date | null;
    }>;
    getMessages(conversationId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
    createMessage(data: {
        conversationId: string;
        senderId: string;
        message: string;
        messageType?: string;
        location?: {
            lat: number;
            lng: number;
        };
        mediaUrl?: string;
        readBy?: string[];
    }): Promise<{
        sender: {
            id: string;
            fullName: string | null;
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        message: string | null;
        conversationId: string;
        messageType: import("@prisma/client").$Enums.MessageType | null;
        senderId: string;
        fileUrl: string | null;
        readBy: string[];
    }>;
    markAsRead(messageId: string, userId: string): Promise<void>;
    getTeamMessages(region: string, limit?: number): Promise<any[]>;
    createTeamMessage(data: {
        region: string;
        senderId: string;
        senderName: string;
        message: string;
    }): Promise<{
        region: string;
        senderId: string;
        senderName: string;
        message: string;
        id: string;
    }>;
    broadcast(data: {
        region: string;
        senderId: string;
        senderName: string;
        message: string;
        targetRole?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        status: import("@prisma/client").$Enums.NotificationStatus | null;
        userId: string | null;
        type: string | null;
        data: Prisma.JsonValue | null;
        incidentId: string | null;
        body: string | null;
        targetRole: string | null;
        targetRegion: string | null;
        sentAt: Date | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
}
//# sourceMappingURL=chat.repository.d.ts.map