import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    console.log('[GATEWAY] Socket.IO initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token || client.handshake.query.token;

    if (!token) {
      console.log(`[GATEWAY] Client ${client.id} disconnected: No token`);
      client.disconnect();
      return;
    }

    try {
      const decoded = this.jwtService.verify(token);
      (client as any).user = decoded;
      console.log(`[GATEWAY] Client connected: ${client.id} (user ${decoded.id})`);

      // Join user's personal room
      if (decoded.id) {
        client.join(`user_${decoded.id}`);
      }
    } catch (err) {
      console.log(`[GATEWAY] Client ${client.id} disconnected: Invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[GATEWAY] Client disconnected: ${client.id}`);
  }

  // ========== INCIDENT EVENTS ==========

  @SubscribeMessage('join_incident')
  handleJoinIncident(client: Socket, incidentId: number) {
    if (!incidentId) return;
    client.join(`incident_${incidentId}`);
    console.log(`[GATEWAY] ${client.id} joined incident_${incidentId}`);
    return { event: 'joined', data: `incident_${incidentId}` };
  }

  @SubscribeMessage('leave_incident')
  handleLeaveIncident(client: Socket, incidentId: number) {
    if (!incidentId) return;
    client.leave(`incident_${incidentId}`);
    return { event: 'left', data: `incident_${incidentId}` };
  }

  // ========== REGION EVENTS ==========

  @SubscribeMessage('join_region')
  handleJoinRegion(client: Socket, regionId: string) {
    if (!regionId) return;
    client.join(`region_${regionId}`);
    console.log(`[GATEWAY] ${client.id} joined region_${regionId}`);
    return { event: 'joined', data: `region_${regionId}` };
  }

  @SubscribeMessage('leave_region')
  handleLeaveRegion(client: Socket, regionId: string) {
    if (!regionId) return;
    client.leave(`region_${regionId}`);
    return { event: 'left', data: `region_${regionId}` };
  }

  // ========== NOTIFICATION EVENTS ==========

  @SubscribeMessage('join_notifications')
  handleJoinNotifications(client: Socket) {
    client.join('notifications');
    return { event: 'joined', data: 'notifications' };
  }

  // ========== TACTICAL AWARENESS (F01) ==========

  @SubscribeMessage('subscribe:tactical')
  handleSubscribeTactical(client: Socket, regionId: string) {
    if (!regionId) return;
    client.join(`tactical_${regionId}`);
    console.log(`[GATEWAY] ${client.id} subscribed to tactical_${regionId}`);
    return { event: 'joined', data: `tactical_${regionId}` };
  }

  @SubscribeMessage('unsubscribe:tactical')
  handleUnsubscribeTactical(client: Socket, regionId: string) {
    if (!regionId) return;
    client.leave(`tactical_${regionId}`);
    return { event: 'left', data: `tactical_${regionId}` };
  }

  // ========== CHAT ROOMS (T02) ==========

  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, conversationId: number) {
    if (!conversationId) return;
    client.join(`conversation_${conversationId}`);
    console.log(`[GATEWAY] ${client.id} joined conversation_${conversationId}`);
    return { event: 'joined', data: `conversation_${conversationId}` };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, conversationId: number) {
    if (!conversationId) return;
    client.leave(`conversation_${conversationId}`);
    return { event: 'left', data: `conversation_${conversationId}` };
  }

  // ========== TYPING EVENT (T02) ==========

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { conversationId: number; userId: number }) {
    if (!payload?.conversationId || !payload?.userId) return;
    client
      .to(`conversation_${payload.conversationId}`)
      .emit('chat.conversation.typing', { userId: payload.userId });
    return { event: 'typing', data: payload };
  }

  // ========== BROADCAST METHODS ==========

  broadcastToIncident(incidentId: number, event: string, data: any) {
    this.server.to(`incident_${incidentId}`).emit(event, data);
  }

  broadcastToRegion(regionId: string, event: string, data: any) {
    this.server.to(`region_${regionId}`).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  // ========== NOTIFICATION BROADCASTS ==========

  emitNotification(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
    this.server.to('notifications').emit('notification', notification);
  }

  // ========== TACTICAL UPDATE ==========

  emitTacticalUpdate(regionId: string, snapshot: any) {
    this.server.to(`tactical_${regionId}`).emit('tactical.update', snapshot);
  }
}