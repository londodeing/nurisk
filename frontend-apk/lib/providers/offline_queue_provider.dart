import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/offline_queue.dart';

/// Offline queue provider for UI state
/// Wraps OfflineQueue as a ChangeNotifier for Consumer widget
class OfflineQueueNotifier extends ChangeNotifier {
  bool _isOffline = false;
  int _pendingCount = 0;
  final Connectivity _connectivity = Connectivity();

  /// Check if offline
  bool get isOffline => _isOffline;

  /// Get pending count
  int get pendingCount => _pendingCount;

  /// Initialize and start listening
  Future<void> initialize() async {
    await OfflineQueue.initialize();
    await _checkConnectivity();
    
    _connectivity.onConnectivityChanged.listen((result) {
      _isOffline = result.contains(ConnectivityResult.none);
      OfflineQueue.setOffline(_isOffline);
      notifyListeners();
    });
  }

  /// Check connectivity
  Future<void> _checkConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    _isOffline = result.contains(ConnectivityResult.none);
    OfflineQueue.setOffline(_isOffline);
    notifyListeners();
  }

  /// Update pending count
  Future<void> updatePendingCount() async {
    _pendingCount = await OfflineQueue.getPendingCount();
    notifyListeners();
  }

  /// Set offline mode manually
  void setOffline(bool value) {
    _isOffline = value;
    OfflineQueue.setOffline(value);
    notifyListeners();
  }
}