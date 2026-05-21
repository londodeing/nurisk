/**
 * Mesh Network Manager
 * ==================
 * Handles peer-to-peer mesh networking for offline communication
 */

import { EventEmitter } from 'events';

export type MeshMessageType = 'DATA' | 'SYNC_REQUEST' | 'SYNC_RESPONSE' | 'PING' | 'PONG';

export interface MeshPeer {
  id: string;
  address: string;
  port: number;
  signalStrength: number;
  lastSeen: Date;
  capabilities: string[];
  connected: boolean;
}

export interface MeshMessage {
  id: string;
  type: MeshMessageType;
  senderId: string;
  recipientId?: string;
  payload: Record<string, unknown>;
  ttl: number;
  timestamp: Date;
  hop: number;
}

export interface MeshNetworkConfig {
  serviceType: string;
  maxPeers: number;
  pingInterval: number;
  connectionTimeout: number;
  maxHops: number;
}

const DEFAULT_CONFIG: MeshNetworkConfig = {
  serviceType: '_nurisk._tcp',
  maxPeers: 10,
  pingInterval: 30000,
  connectionTimeout: 10000,
  maxHops: 3,
};

/**
 * Mesh Network Manager
 */
export class MeshNetworkManager extends EventEmitter {
  private config: MeshNetworkConfig;
  private peers: Map<string, MeshPeer> = new Map();
  private messageQueue: MeshMessage[] = [];
  private deviceId: string;
  private running: boolean = false;

  constructor(deviceId: string, config?: Partial<MeshNetworkConfig>) {
    super();
    this.deviceId = deviceId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start mesh networking
   */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Start peer discovery
    this.startPeerDiscovery();

    // Start ping interval
    this.startPingInterval();

    // Start message processing
    this.processMessageQueue();

    this.emit('started');
  }

  /**
   * Stop mesh networking
   */
  async stop(): Promise<void> {
    this.running = false;

    // Disconnect all peers
    for (const peer of this.peers.values()) {
      await this.disconnectPeer(peer.id);
    }

    this.emit('stopped');
  }

  /**
   * Get connected peers
   */
  getPeers(): MeshPeer[] {
    return Array.from(this.peers.values()).filter(p => p.connected);
  }

  /**
   * Send message to peer
   */
  async sendMessage(peerId: string, message: Omit<MeshMessage, 'id' | 'senderId' | 'timestamp' | 'hop'>): Promise<boolean> {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.connected) {
      return false;
    }

    const fullMessage: MeshMessage = {
      ...message,
      id: this.generateId(),
      senderId: this.deviceId,
      timestamp: new Date(),
      hop: 0,
    };

    return this.sendToPeer(peer, fullMessage);
  }

  /**
   * Broadcast message to all peers
   */
  async broadcast(message: Omit<MeshMessage, 'id' | 'senderId' | 'timestamp' | 'hop'>): Promise<number> {
    const connectedPeers = this.getPeers();
    let sent = 0;

    for (const peer of connectedPeers) {
      const success = await this.sendMessage(peer.id, message);
      if (success) sent++;
    }

    return sent;
  }

  /**
   * Forward message through mesh
   */
  async forwardMessage(message: MeshMessage, excludePeerId?: string): Promise<void> {
    if (message.hop >= this.config.maxHops) {
      return; // TTL exceeded
    }

    const connectedPeers = this.getPeers().filter(p => p.id !== excludePeerId);

    for (const peer of connectedPeers) {
      const forwardedMessage: MeshMessage = {
        ...message,
        hop: message.hop + 1,
      };

      await this.sendToPeer(peer, forwardedMessage);
    }
  }

  /**
   * Add peer to mesh
   */
  addPeer(peer: MeshPeer): void {
    const existing = this.peers.get(peer.id);
    if (existing) {
      // Update existing peer
      existing.signalStrength = peer.signalStrength;
      existing.lastSeen = peer.lastSeen;
      existing.capabilities = peer.capabilities;
    } else {
      // Add new peer
      this.peers.set(peer.id, peer);
      this.emit('peerDiscovered', peer);
    }
  }

  /**
   * Remove peer from mesh
   */
  removePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      this.peers.delete(peerId);
      this.emit('peerLost', peer);
    }
  }

  /**
   * Connect to peer
   */
  private async connectPeer(peer: MeshPeer): Promise<boolean> {
    try {
      // In real implementation, use platform APIs
      peer.connected = true;
      peer.lastSeen = new Date();
      this.emit('peerConnected', peer);
      return true;
    } catch (error) {
      peer.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from peer
   */
  private async disconnectPeer(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.connected = false;
      this.emit('peerDisconnected', peer);
    }
  }

  /**
   * Send message to peer
   */
  private async sendToPeer(peer: MeshPeer, message: MeshMessage): Promise<boolean> {
    try {
      // In real implementation, use WebRTC or socket
      this.emit('messageSent', { peer, message });
      return true;
    } catch (error) {
      this.emit('messageFailed', { peer, message, error });
      return false;
    }
  }

  /**
   * Start peer discovery
   */
  private startPeerDiscovery(): void {
    // In real implementation, use Wifi Direct / BLE discovery
    this.emit('discovering');
  }

  /**
   * Start ping interval
   */
  private startPingInterval(): void {
    setInterval(async () => {
      if (!this.running) return;

      for (const peer of this.peers.values()) {
        if (peer.connected) {
          await this.sendMessage(peer.id, {
            type: 'PING',
            payload: {},
            ttl: this.config.maxHops,
          });
        }
      }
    }, this.config.pingInterval);
  }

  /**
   * Process message queue
   */
  private processMessageQueue(): void {
    setInterval(async () => {
      if (!this.running || this.messageQueue.length === 0) return;

      const message = this.messageQueue.shift();
      if (message) {
        await this.handleMessage(message);
      }
    }, 1000);
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: MeshMessage): Promise<void> {
    // Don't process own messages
    if (message.senderId === this.deviceId) {
      return;
    }

    this.emit('messageReceived', message);

    switch (message.type) {
      case 'PING':
        // Respond with pong
        await this.sendMessage(message.senderId, {
          type: 'PONG',
          payload: {},
          ttl: message.ttl,
          recipientId: message.senderId,
        });
        break;

      case 'PONG':
        // Update peer last seen
        const peer = this.peers.get(message.senderId);
        if (peer) {
          peer.lastSeen = new Date();
        }
        break;

      case 'DATA':
      case 'SYNC_REQUEST':
      case 'SYNC_RESPONSE':
        // Forward to other peers if TTL allows
        if (message.ttl > 0) {
          await this.forwardMessage(message, message.senderId);
        }
        break;
    }
  }

  /**
   * Queue message for processing
   */
  queueMessage(message: MeshMessage): void {
    this.messageQueue.push(message);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get network statistics
   */
  getStats(): {
    totalPeers: number;
    connectedPeers: number;
    queuedMessages: number;
  } {
    return {
      totalPeers: this.peers.size,
      connectedPeers: this.getPeers().length,
      queuedMessages: this.messageQueue.length,
    };
  }
}

// Export for CommonJS
export { MeshNetworkManager };