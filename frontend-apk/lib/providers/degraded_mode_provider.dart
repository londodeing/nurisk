import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import '../services/offline_queue.dart';

/// Degraded mode provider for connectivity monitoring
/// - Monitors network state using connectivity_plus
/// - Emits state through BLoC stream
/// - Shows persistent offline banner when connection lost
class DegradedModeNotifier extends ChangeNotifier {
  final Connectivity _connectivity = Connectivity();
  
  bool _isOffline = false;
  bool _isInitialized = false;
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  
  // Queue count from offline queue
  int _pendingCount = 0;
  DateTime? _lastOnline;

  /// Check if offline mode
  bool get isOffline => _isOffline;
  
  /// Get pending sync count
  int get pendingCount => _pendingCount;
  
  /// Get last online timestamp
  DateTime? get lastOnline => _lastOnline;
  
  /// Check if initialized
  bool get isInitialized => _isInitialized;

  /// Initialize and start listening
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    await _checkConnectivity();
    
    _subscription = _connectivity.onConnectivityChanged.listen(
      _onConnectivityChanged,
      onError: (error) {
        _setOffline(true);
      },
    );
    
    _isInitialized = true;
    notifyListeners();
  }

  /// Check current connectivity
  Future<void> _checkConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    _onConnectivityChanged(result);
  }

  /// Handle connectivity change
  void _onConnectivityChanged(List<ConnectivityResult> result) {
    final wasOffline = _isOffline;
    _isOffline = result.contains(ConnectivityResult.none);
    
    if (_isOffline && !wasOffline) {
      // Just went offline
      _lastOnline = DateTime.now();
    } else if (!_isOffline && wasOffline) {
      // Just came back online
      _lastOnline = null;
    }
    
    // Update offline queue state
    OfflineQueue.setOffline(_isOffline);
    
    notifyListeners();
  }

  /// Set offline mode manually (for testing)
  void setOffline(bool value) {
    _setOffline(value);
  }

  /// Internal set offline
  void _setOffline(bool value) {
    if (_isOffline != value) {
      _isOffline = value;
      if (value) {
        _lastOnline = DateTime.now();
      } else {
        _lastOnline = null;
      }
      OfflineQueue.setOffline(value);
      notifyListeners();
    }
  }

  /// Update pending count from offline queue
  Future<void> updatePendingCount() async {
    try {
      _pendingCount = await OfflineQueue.getPendingCount();
      notifyListeners();
    } catch (e) {
      _pendingCount = 0;
    }
  }

  /// Force refresh connectivity check
  Future<void> refresh() async {
    await _checkConnectivity();
  }

  /// Get status message
  String get statusMessage {
    if (!_isOffline) {
      return 'Online';
    }
    
    if (_lastOnline != null) {
      final duration = DateTime.now().difference(_lastOnline!);
      if (duration.inMinutes < 1) {
        return 'Offline (just now)';
      } else if (duration.inMinutes < 60) {
        return 'Offline (${duration.inMinutes}m)';
      } else if (duration.inHours < 24) {
        return 'Offline (${duration.inHours}h)';
      } else {
        return 'Offline (${duration.inDays}d)';
      }
    }
    
    return 'Offline';
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

/// Extension for checking if features should be disabled
extension DegradedModeFeatures on DegradedModeNotifier {
  /// Check if map tiles should be disabled (use cached only)
  bool get shouldDisableMapTiles => _isOffline;
  
  /// Check if real-time features should be disabled
  bool get shouldDisableRealtime => _isOffline;
  
  /// Check if we should show queue badge
  bool get shouldShowQueueBadge => _pendingCount > 0;
}