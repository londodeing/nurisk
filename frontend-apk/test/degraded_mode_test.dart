import 'package:flutter_test/flutter_test.dart';
import 'package:nurisk_frontend_mobile/providers/degraded_mode_provider.dart';

void main() {
  group('DegradedModeNotifier', () {
    late DegradedModeNotifier notifier;

    setUp(() {
      notifier = DegradedModeNotifier();
    });

    tearDown(() {
      notifier.dispose();
    });

    test('initial state is online', () {
      expect(notifier.isOffline, false);
      expect(notifier.isInitialized, false);
    });

    test('setOffline changes state', () {
      notifier.setOffline(true);
      expect(notifier.isOffline, true);
      expect(notifier.lastOnline, isNotNull);

      notifier.setOffline(false);
      expect(notifier.isOffline, false);
      expect(notifier.lastOnline, isNull);
    });

    test('statusMessage returns correct message', () {
      // Online
      notifier.setOffline(false);
      expect(notifier.statusMessage, 'Online');

      // Offline - just now
      notifier.setOffline(true);
      expect(notifier.statusMessage, 'Offline (just now)');
    });

    test('shouldDisableMapTiles returns true when offline', () {
      notifier.setOffline(true);
      expect(notifier.shouldDisableMapTiles, true);

      notifier.setOffline(false);
      expect(notifier.shouldDisableMapTiles, false);
    });

    test('shouldDisableRealtime returns true when offline', () {
      notifier.setOffline(true);
      expect(notifier.shouldDisableRealtime, true);

      notifier.setOffline(false);
      expect(notifier.shouldDisableRealtime, false);
    });

    test('shouldShowQueueBadge returns false when no pending', () {
      notifier.setOffline(true);
      expect(notifier.shouldShowQueueBadge, false);
    });
  });

  group('DegradedModeFeatures', () {
    test('extension methods work correctly', () {
      final notifier = DegradedModeNotifier();
      
      // When online
      notifier.setOffline(false);
      expect(notifier.shouldDisableMapTiles, false);
      expect(notifier.shouldDisableRealtime, false);
      
      // When offline
      notifier.setOffline(true);
      expect(notifier.shouldDisableMapTiles, true);
      expect(notifier.shouldDisableRealtime, true);
      
      notifier.dispose();
    });
  });
}