import { BroadcastDTO, SendMessageDTO, ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getConversation(incidentId: string): Promise<any>;
    getMessages(incidentId: string, limit?: string, offset?: string): Promise<any>;
    sendMessage(dto: SendMessageDTO, senderId?: string, senderName?: string): Promise<any>;
    markAsRead(messageId: string, userId: string): Promise<any>;
    getTeamMessages(region: string, limit?: string): Promise<any>;
    broadcast(dto: BroadcastDTO, senderId?: string, senderName?: string): Promise<any>;
}
//# sourceMappingURL=chat.controller.d.ts.map