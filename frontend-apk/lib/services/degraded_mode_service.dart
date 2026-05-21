import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/degraded_mode_provider.dart';
import '../providers/offline_queue_provider.dart';

/// Degraded mode helper for feature flags
/// - Disables map tile loading when offline (use cached tiles)
/// - Disables real-time features (chat, live feed)
/// - Shows queue count badge with pending sync count
class DegradedModeHelper {
  /// Check if map tiles should be disabled
  static bool shouldDisableMapTiles(BuildContext context) {
    try {
      final notifier = context.read<DegradedModeNotifier>();
      return notifier.isOffline;
    } catch (_) {
      return false;
    }
  }

  /// Check if real-time features should be disabled
  static bool shouldDisableRealtime(BuildContext context) {
    try {
      final notifier = context.read<DegradedModeNotifier>();
      return notifier.isOffline;
    } catch (_) {
      return false;
    }
  }

  /// Check if queue badge should be shown
  static bool shouldShowQueueBadge(BuildContext context) {
    try {
      final notifier = context.read<DegradedModeNotifier>();
      return notifier.pendingCount > 0;
    } catch (_) {
      return false;
    }
  }

  /// Get pending count
  static int getPendingCount(BuildContext context) {
    try {
      final notifier = context.read<DegradedModeNotifier>();
      return notifier.pendingCount;
    } catch (_) {
      return 0;
    }
  }

  /// Build disabled overlay for feature
  static Widget buildDisabledOverlay(
    BuildContext context, {
    required Widget child,
    String? message,
  }) {
    if (!shouldDisableRealtime(context)) {
      return child;
    }

    return Stack(
      children: [
        child,
        Positioned.fill(
          child: Container(
            color: Colors.black38,
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
                    const SizedBox(height: 8),
                    Text(
                      message ?? 'Requires internet connection',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Wrap list screen with cache-first data access
  static Widget wrapListScreen({
    required BuildContext context,
    required Widget child,
    DateTime? lastUpdated,
  }) {
    return Stack(
      children: [
        child,
        if (lastUpdated != null)
          Positioned(
            bottom: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Updated: ${_formatTime(lastUpdated)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                ),
              ),
            ),
          ),
      ],
    );
  }

  /// Format time for display
  static String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);

    if (diff.inMinutes < 1) {
      return 'just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return '${diff.inDays}d ago';
    }
  }
}

/// Widget wrapper for offline-disabled features
class OfflineDisabledWrapper extends StatelessWidget {
  final Widget child;
  final String message;

  const OfflineDisabledWrapper({
    super.key,
    required this.child,
    this.message = 'Requires internet connection',
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<DegradedModeNotifier>(
      builder: (context, notifier, child) {
        if (!notifier.isOffline) {
          return child as Widget;
        }

        return Stack(
          children: [
            child as Widget,
            Positioned.fill(
              child: Container(
                color: Colors.black38,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
                        const SizedBox(height: 8),
                        Text(
                          message,
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// Badge widget for pending queue count
class QueueCountBadge extends StatelessWidget {
  final Widget child;

  const QueueCountBadge({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<DegradedModeNotifier>(
      builder: (context, notifier, child) {
        final count = notifier.pendingCount;
        if (count <= 0) {
          return child as Widget;
        }

        return Badge(
          label: Text(count > 99 ? '99+' : count.toString()),
          child: child,
        );
      },
    );
  }
}