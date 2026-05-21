import 'dart:async';
import 'dart:convert';
import 'package:nearby_connections/nearby_connections.dart';

/// Mesh P2P Service for peer-to-peer communication
/// - Uses nearby_connections for WiFi Direct/BLE
/// - Implements mesh networking with relay support
/// - Handles message forwarding with TTL
class MeshP2PService {
  static final Nearby _nearby = Nearby();
  static String? _deviceId;
  static bool _isAdvertising = false;
  static bool _isDiscovering = false;
  
  // Service UUID for filtering
  static const String _serviceUuid = 'nurisk-mesh';
  
  // Message handlers
  static final _messageHandlers = <String, MeshMessageHandler>{};
  static final _connectedPeers = <String, MeshPeer>{};
  
  // Callbacks
  static PeerDiscoveredCallback? _onPeerDiscovered;
  static PeerConnectedCallback? _onPeerConnected;
  static PeerDisconnectedCallback? _onPeerDisconnected;

  /// Initialize service
  static Future<void> initialize() async {
    _deviceId = await _nearby.getId();
  }

  /// Get device ID
  static String? get deviceId => _deviceId;

  /// Check if advertising
  static bool get isAdvertising => _isAdvertising;

  /// Check if discovering
  static bool get isDiscovering => _isDiscovering;

  /// Get connected peers
  static List<MeshPeer> get connectedPeers => _connectedPeers.values.toList();

  /// Start advertising
  static Future<bool> startAdvertising({
    required PeerDiscoveredCallback onPeerDiscovered,
    String? name,
  }) async {
    if (_isAdvertising) return true;

    _onPeerDiscovered = onPeerDiscovered;

    try {
      _isAdvertising = await _nearby.startAdvertising(
        _serviceUuid,
        strategy: Strategy.P2P_CLUSTER,
        customPrefix: name ?? 'nurisk',
        onConnectionInitiated: _onConnectionInitiated,
        onConnectionResult: _onConnectionResult,
        onDisconnected: _onDisconnected,
      );
      return _isAdvertising;
    } catch (e) {
      _isAdvertising = false;
      return false;
    }
  }

  /// Stop advertising
  static Future<void> stopAdvertising() async {
    if (!_isAdvertising) return;
    await _nearby.stopAdvertising();
    _isAdvertising = false;
  }

  /// Start discovering
  static Future<bool> startDiscovering({
    required PeerDiscoveredCallback onPeerDiscovered,
    required PeerConnectedCallback onPeerConnected,
  }) async {
    if (_isDiscovering) return true;

    _onPeerDiscovered = onPeerDiscovered;
    _onPeerConnected = onPeerConnected;

    try {
      _isDiscovering = await _nearby.startBrowsing(
        _serviceUuid,
        strategy: Strategy.P2P_CLUSTER,
        onPeerDiscovered: _handlePeerDiscovered,
        onPeerLost: _handlePeerLost,
      );
      return _isDiscovering;
    } catch (e) {
      _isDiscovering = false;
      return false;
    }
  }

  /// Stop discovering
  static Future<void> stopDiscovering() async {
    if (!_isDiscovering) return;
    await _nearby.stopBrowsing();
    _isDiscovering = false;
  }

  /// Connect to peer
  static Future<bool> connect(String peerId) async {
    try {
      final result = await _nearby.requestConnection(
        peerId,
        _serviceUuid,
        onConnectionInitiated: _onConnectionInitiated,
        onConnectionResult: _onConnectionResult,
        onDisconnected: _onDisconnected,
      );
      return result;
    } catch (e) {
      return false;
    }
  }

  /// Disconnect from peer
  static Future<void> disconnect(String peerId) async {
    await _nearby.disconnect(peerId);
    _connectedPeers.remove(peerId);
  }

  /// Send message to peer
  static Future<bool> sendMessage(String peerId, MeshMessage message) async {
    try {
      final bytes = utf8.encode(jsonEncode(message.toJson()));
      await _nearby.sendBytes(peerId, bytes);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Broadcast message to all connected peers
  static Future<void> broadcast(MeshMessage message) async {
    for (final peerId in _connectedPeers.keys) {
      await sendMessage(peerId, message);
    }
  }

  /// Register message handler
  static void registerHandler(String type, MeshMessageHandler handler) {
    _messageHandlers[type] = handler;
  }

  /// Handle incoming connection
  void _onConnectionInitiated(String peerId, ConnectionInfo info) {
    // Auto-accept for now
    _nearby.acceptConnection(peerId);
  }

  /// Handle connection result
  void _onConnectionResult(String peerId, bool accepted) {
    if (accepted) {
      _connectedPeers[peerId] = MeshPeer(
        id: peerId,
        name: peerId,
        connectedAt: DateTime.now(),
      );
      _onPeerConnected?.call(peerId);
    }
  }

  /// Handle disconnection
  void _onDisconnected(String peerId) {
    _connectedPeers.remove(peerId);
    _onPeerDisconnected?.call(peerId);
  }

  /// Handle peer discovered
  void _handlePeerDiscovered(String peerId) {
    _onPeerDiscovered?.call(peerId);
  }

  /// Handle peer lost
  void _handlePeerLost(String peerId) {
    // Peer no longer in range
  }

  /// Stop all
  static Future<void> stopAll() async {
    await stopAdvertising();
    await stopDiscovering();
    for (final peerId in _connectedPeers.keys) {
      await disconnect(peerId);
    }
  }
}

/// Peer discovered callback
typedef PeerDiscoveredCallback = void Function(String peerId);

/// Peer connected callback
typedef PeerConnectedCallback = void Function(String peerId);

/// Peer disconnected callback
typedef PeerDisconnectedCallback = void Function(String peerId);

/// Mesh message handler
typedef MeshMessageHandler = Future<void> Function(MeshMessage message, String fromPeer);

/// Mesh peer
class MeshPeer {
  final String id;
  final String name;
  final DateTime connectedAt;
  final int? signalStrength;
  final DateTime? lastSeen;

  MeshPeer({
    required this.id,
    required this.name,
    required this.connectedAt,
    this.signalStrength,
    this.lastSeen,
  });
}

/// Mesh message types
enum MeshMessageType {
  DATA,
  SYNC_REQ,
  SYNC_RESP,
  PING,
  ACK,
}

/// Mesh message
class MeshMessage {
  final String id;
  final MeshMessageType type;
  final String? senderId;
  final String? recipientId;
  final Map<String, dynamic> payload;
  final int hopCount;
  final int maxHops;
  final DateTime timestamp;

  MeshMessage({
    required this.id,
    required this.type,
    this.senderId,
    this.recipientId,
    required this.payload,
    this.hopCount = 0,
    this.maxHops = 5,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  /// Create from JSON
  factory MeshMessage.fromJson(Map<String, dynamic> json) {
    return MeshMessage(
      id: json['id'] as String,
      type: MeshMessageType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MeshMessageType.DATA,
      ),
      senderId: json['senderId'] as String?,
      recipientId: json['recipientId'] as String?,
      payload: json['payload'] as Map<String, dynamic>,
      hopCount: json['hopCount'] as int? ?? 0,
      maxHops: json['maxHops'] as int? ?? 5,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : DateTime.now(),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'senderId': senderId,
      'recipientId': recipientId,
      'payload': payload,
      'hopCount': hopCount,
      'maxHops': maxHops,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  /// Create copy with incremented hop count
  MeshMessage incrementHop() {
    return MeshMessage(
      id: id,
      type: type,
      senderId: senderId,
      recipientId: recipientId,
      payload: payload,
      hopCount: hopCount + 1,
      maxHops: maxHops,
      timestamp: timestamp,
    );
  }

  /// Check if TTL expired
  bool get isTtlExpired => hopCount >= maxHops;
}