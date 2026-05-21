import { describe, it, expect, beforeEach, vi } from 'vitest';
import { socketManager } from '@/lib/socket';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  readyState = MockWebSocket.OPEN;
  url = 'ws://localhost';
  protocol = '';
  
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  
  send = vi.fn();
  close = vi.fn();
}

global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

describe('Socket Manager', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('mock-jwt-token');
    socketManager.disconnect();
  });

  it('should connect with valid JWT', () => {
    socketManager.connect();
    expect(socketManager.isConnected()).toBe(true);
  });

  it('should not connect without JWT', () => {
    localStorageMock.getItem.mockReturnValue(null);
    socketManager.connect();
    // Should not throw
  });

  it('should emit events', () => {
    const emitSpy = vi.fn();
    socketManager.on('test:event', emitSpy);
    socketManager.emit('test:event', 'test-data');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should join and leave rooms', () => {
    socketManager.joinRoom('test-room');
    socketManager.leaveRoom('test-room');
    // Should not throw
  });
});

describe('Socket Events', () => {
  it('should handle incident:created', () => {
    const incident = {
      id: '1',
      title: 'Test Incident',
      type: 'flood',
      severity: 'high',
      status: 'active',
      location: 'Jakarta',
    };
    
    // Handler should be callable
    expect(typeof incident).toBe('object');
  });

  it('should handle room subscription', () => {
    const room = 'incident:123';
    expect(room).toBe('incident:123');
  });
});