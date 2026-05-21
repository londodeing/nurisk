import { io, Socket } from 'socket.io-client';

type EventHandler = (...args: unknown[]) => void;

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

interface SocketEventMap {
  join_user: { userId: string; role: string };
  emergency_broadcast: { incidentId: string };
  new_message: { id: string; conversationId: string; senderId: string; content: string; createdAt: string };
  notification: { id: string; title: string; body: string; type: string };
  emergency_alert: { title: string; body: string };
  incident_update: { incidentId: string; data: Record<string, unknown> };
  typing: { conversationId: string; userId: string; isTyping: boolean };
}

class SocketManager {
  private socket: Socket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private isConnecting = false;
  private _status: ConnectionStatus = 'disconnected';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  connect() {
    if (this.socket?.connected) return;
    if (this.isConnecting) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[Socket] No auth token, skipping connection');
      return;
    }

    const user = localStorage.getItem('user');
    let userId = '';
    let userRole = '';
    if (user) {
      try {
        const parsed = JSON.parse(user);
        userId = parsed.id || '';
        userRole = parsed.role || '';
      } catch {
        // ignore parse error
      }
    }

    this.isConnecting = true;
    this.setStatus('connecting');

    this.socket = io(import.meta.env.VITE_WS_URL || '/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.baseReconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.setStatus('connected');

      if (userId && userRole) {
        this.emit('join_user', { userId, role: userRole });
      }

      this.emit('socket:connected', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.setStatus(reason === 'io.clientDisconnect' ? 'disconnected' : 'reconnecting');
      this.emit('socket:disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      this.setStatus('reconnecting');

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        this.disconnect();
        this.setStatus('disconnected');
      }
    });

    this.socket.on('reconnect_attempt', () => {
      this.setStatus('reconnecting');
    });

    this.socket.on('reconnect', () => {
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      if (userId && userRole) {
        this.emit('join_user', { userId, role: userRole });
      }
    });

    this.handlers.forEach((handlerSet, event) => {
      handlerSet.forEach((handler) => {
        this.socket?.on(event, handler as EventHandler);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.setStatus('disconnected');
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  offAll(event?: string) {
    if (event) {
      this.handlers.delete(event);
      this.socket?.off(event);
    } else {
      this.handlers.clear();
      this.socket?.removeAllListeners();
    }
  }

  emit(event: string, ...args: unknown[]) {
    this.socket?.emit(event, ...args);
  }

  joinRoom(room: string) {
    this.emit('room:join', room);
  }

  leaveRoom(room: string) {
    this.emit('room:leave', room);
  }

  emitTyping(conversationId: string, isTyping: boolean) {
    const user = localStorage.getItem('user');
    let userId = '';
    if (user) {
      try {
        userId = JSON.parse(user).id || '';
      } catch {
        // ignore
      }
    }
    this.emit('typing', { conversationId, userId, isTyping });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketManager = new SocketManager();

let previousToken: string | null = null;

export function initSocket() {
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    if (token && token !== previousToken) {
      previousToken = token;
      socketManager.connect();
    } else if (!token && previousToken) {
      previousToken = null;
      socketManager.disconnect();
    }
  };

  checkAuth();

  window.addEventListener('storage', (e) => {
    if (e.key === 'auth_token') {
      checkAuth();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !socketManager.isConnected()) {
      checkAuth();
    }
  });
}

export type { SocketEventMap, EventHandler };
export default socketManager;
