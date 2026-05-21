import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/offline_queue_provider.dart';

/// Offline indicator banner
/// - Shows connection status and queue count
/// - Yellow banner: Offline with pending sync
/// - Red banner: No connection
class OfflineBanner extends StatefulWidget {
  final Widget child;

  const OfflineBanner({
    super.key,
    required this.child,
  });

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  bool _isOffline = false;
  bool _hasPendingActions = false;
  int _queueCount = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _showBanner() {
    _controller.forward();
  }

  void _hideBanner() {
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OfflineQueueNotifier>(
      builder: (context, offlineQueue, child) {
        final isOffline = offlineQueue.isOffline;
        final queueCount = offlineQueue.pendingCount;

        // Show/hide banner based on state changes
        if (isOffline && !_isOffline) {
          _showBanner();
        } else if (!isOffline && _isOffline) {
          _hideBanner();
        }

        _isOffline = isOffline;
        _queueCount = queueCount;

        return Stack(
          children: [
            widget.child,
            // Banner
            SlideTransition(
              position: _slideAnimation,
              child: _buildBanner(context, isOffline, queueCount),
            ),
          ],
        );
      },
    );
  }

  Widget _buildBanner(BuildContext context, bool isOffline, int queueCount) {
    if (!isOffline && queueCount == 0) {
      return const SizedBox.shrink();
    }

    final Color backgroundColor;
    final Color textColor;
    final IconData icon;
    final String message;

    if (isOffline) {
      // Red banner - no connection
      backgroundColor = Colors.red[700]!;
      textColor = Colors.white;
      icon = Icons.signal_wifi_off;
      message = 'Tidak ada koneksi';
    } else if (queueCount > 0) {
      // Yellow banner - offline with pending sync
      backgroundColor = Colors.yellow[700]!;
      textColor = Colors.black;
      icon = Icons.cloud_queue;
      message = 'Offline — $queueCount aksi menunggu sinkronisasi';
    } else {
      return const SizedBox.shrink();
    }

    return SafeArea(
      bottom: false,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        color: backgroundColor,
        child: Row(
          children: [
            Icon(icon, color: textColor, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            if (queueCount > 0)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: textColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$queueCount',
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Compact offline indicator for app bar
class OfflineIndicator extends StatelessWidget {
  const OfflineIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<OfflineQueueNotifier>(
      builder: (context, offlineQueue, child) {
        if (!offlineQueue.isOffline && offlineQueue.pendingCount == 0) {
          return const SizedBox.shrink();
        }

        final isOffline = offlineQueue.isOffline;
        final queueCount = offlineQueue.pendingCount;

        if (isOffline) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red[700],
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.signal_wifi_off, color: Colors.white, size: 16),
                SizedBox(width: 4),
                Text(
                  'Offline',
                  style: TextStyle(color: Colors.white, fontSize: 12),
                ),
              ],
            ),
          );
        }

        if (queueCount > 0) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.yellow[700],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.cloud_queue, color: Colors.black, size: 16),
                const SizedBox(width: 4),
                Text(
                  '$queueCount',
                  style: const TextStyle(color: Colors.black, fontSize: 12),
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}

/// Connection status chip
class ConnectionStatusChip extends StatelessWidget {
  const ConnectionStatusChip({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<OfflineQueueNotifier>(
      builder: (context, offlineQueue, child) {
        final isOffline = offlineQueue.isOffline;
        final queueCount = offlineQueue.pendingCount;

        if (isOffline) {
          return Chip(
            avatar: const Icon(Icons.signal_wifi_off, size: 18),
            label: const Text('Offline'),
            backgroundColor: Colors.red[100],
            labelStyle: TextStyle(color: Colors.red[700]),
          );
        }

        if (queueCount > 0) {
          return Chip(
            avatar: const Icon(Icons.cloud_queue, size: 18),
            label: Text('$queueCount tertunda'),
            backgroundColor: Colors.yellow[100],
          );
        }

        return Chip(
          avatar: const Icon(Icons.cloud_done, size: 18),
          label: const Text('Tersinkronisasi'),
          backgroundColor: Colors.green[100],
        );
      },
    );
  }
}