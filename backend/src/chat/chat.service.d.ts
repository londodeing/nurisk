import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import { ChatRepository } from './chat.repository';
import { PrismaService } from '../prisma/prisma.service';
import { sendMessageSchema, broadcastSchema } from '@nurisk/validation/chat';
export { sendMessageSchema, broadcastSchema };
export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
export type BroadcastDTO = z.infer<typeof broadcastSchema>;
export declare class ChatService {
    private chatRepository;
    private eventEmitter;
    private prisma;
    constructor(chatRepository: ChatRepository, eventEmitter: EventEmitter2, prisma: PrismaService);
    getConversation(incidentId: string, type?: string): Promise<any>;
    getMessages(incidentId: string, limit?: number, offset?: number): Promise<any>;
    sendMessage(dto: SendMessageDTO, senderId: string, senderName: string): Promise<any>;
    markAsRead(messageId: string, userId: string): Promise<any>;
    getTeamMessages(region: string, limit?: number): Promise<any>;
    broadcast(dto: BroadcastDTO, senderId: string, senderName: string): Promise<any>;
}
//# sourceMappingURL=chat.service.d.ts.map