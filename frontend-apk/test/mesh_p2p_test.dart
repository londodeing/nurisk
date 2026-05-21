import 'package:flutter_test/flutter_test.dart';
import 'package:nurisk_frontend_mobile/services/mesh_p2p_service.dart';

void main() {
  group('MeshMessage', () {
    test('creates with correct defaults', () {
      final message = MeshMessage(
        id: 'test-1',
        type: MeshMessageType.DATA,
        payload: {'key': 'value'},
      );

      expect(message.id, 'test-1');
      expect(message.type, MeshMessageType.DATA);
      expect(message.hopCount, 0);
      expect(message.maxHops, 5);
    });

    test('serializes to JSON correctly', () {
      final message = MeshMessage(
        id: 'test-1',
        type: MeshMessageType.SYNC_REQ,
        senderId: 'device-1',
        payload: {'incidentId': 123},
      );

      final json = message.toJson();

      expect(json['id'], 'test-1');
      expect(json['type'], 'SYNC_REQ');
      expect(json['senderId'], 'device-1');
      expect(json['payload']['incidentId'], 123);
      expect(json['hopCount'], 0);
      expect(json['maxHops'], 5);
    });

    test('deserializes from JSON correctly', () {
      final json = {
        'id': 'test-1',
        'type': 'SYNC_RESP',
        'senderId': 'device-2',
        'recipientId': 'device-1',
        'payload': {'data': 'value'},
        'hopCount': 2,
        'maxHops': 5,
        'timestamp': '2024-01-01T00:00:00.000Z',
      };

      final message = MeshMessage.fromJson(json);

      expect(message.id, 'test-1');
      expect(message.type, MeshMessageType.SYNC_RESP);
      expect(message.senderId, 'device-2');
      expect(message.recipientId, 'device-1');
      expect(message.hopCount, 2);
    });

    test('incrementHop increases hop count', () {
      final message = MeshMessage(
        id: 'test-1',
        type: MeshMessageType.DATA,
        payload: {},
      );

      final forwarded = message.incrementHop();

      expect(forwarded.hopCount, 1);
      expect(forwarded.id, message.id);
    });

    test('isTtlExpired returns true when hopCount >= maxHops', () {
      final message = MeshMessage(
        id: 'test-1',
        type: MeshMessageType.DATA,
        payload: {},
        hopCount: 5,
        maxHops: 5,
      );

      expect(message.isTtlExpired, true);
    });

    test('isTtlExpired returns false when hopCount < maxHops', () {
      final message = MeshMessage(
        id: 'test-1',
        type: MeshMessageType.DATA,
        payload: {},
        hopCount: 3,
        maxHops: 5,
      );

      expect(message.isTtlExpired, false);
    });
  });

  group('MeshPeer', () {
    test('creates with required fields', () {
      final peer = MeshPeer(
        id: 'peer-1',
        name: 'Test Device',
        connectedAt: DateTime(2024, 1, 1),
      );

      expect(peer.id, 'peer-1');
      expect(peer.name, 'Test Device');
      expect(peer.connectedAt, DateTime(2024, 1, 1));
    });

    test('creates with optional fields', () {
      final peer = MeshPeer(
        id: 'peer-1',
        name: 'Test Device',
        connectedAt: DateTime(2024, 1, 1),
        signalStrength: -50,
        lastSeen: DateTime(2024, 1, 2),
      );

      expect(peer.signalStrength, -50);
      expect(peer.lastSeen, DateTime(2024, 1, 2));
    });
  });

  group('MeshMessageType', () {
    test('has all expected types', () {
      expect(MeshMessageType.values, contains(MeshMessageType.DATA));
      expect(MeshMessageType.values, contains(MeshMessageType.SYNC_REQ));
      expect(MeshMessageType.values, contains(MeshMessageType.SYNC_RESP));
      expect(MeshMessageType.values, contains(MeshMessageType.PING));
      expect(MeshMessageType.values, contains(MeshMessageType.ACK));
    });
  });
}