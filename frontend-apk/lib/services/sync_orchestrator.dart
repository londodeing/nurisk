import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../database/app_database.dart';
import 'offline_queue.dart';
import 'local_cache_service.dart';

/// Sync orchestrator for processing offline queue and pulling changes
/// - Processes queue FIFO then pulls incremental changes
/// - Marks items as IN_FLIGHT during execution
/// - Implements retry with exponential backoff
class SyncOrchestrator {
  static AppDatabase? _db;
  static final Connectivity _connectivity = Connectivity();
  static const String _lastSyncTimeKey = 'last_sync_time';
  static const int _maxRetries = 5;
  static const List<int> _backoffMs = [1000, 2000, 4000, 8000, 30000];

  /// Initialize database
  static Future<void> initialize() async {
    _db = AppDatabase();
    await OfflineQueue.initialize();
  }

  /// Get database instance
  static AppDatabase get db {
    if (_db == null) {
      throw StateError('SyncOrchestrator not initialized. Call initialize() first.');
    }
    return _db!;
  }

  /// Check if online
  static Future<bool> isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return !result.contains(ConnectivityResult.none);
  }

  /// Full sync: process queue then pull
  static Future<SyncResult> sync() async {
    if (!await isOnline()) {
      return SyncResult(
        success: false,
        reason: 'offline',
        queuedCount: await OfflineQueue.getPendingCount(),
        pulledCount: 0,
      );
    }

    var queuedCount = 0;
    var pulledCount = 0;

    // Process queue first (FIFO)
    final queueResult = await _processQueue();
    queuedCount = queueResult.processed;

    // Then pull incremental changes
    final pullResult = await _pullChanges();
    pulledCount = pullResult.pulled;

    return SyncResult(
      success: true,
      queuedCount: queuedCount,
      pulledCount: pulledCount,
    );
  }

  /// Process queue FIFO with retry
  static Future<QueueProcessResult> _processQueue() async {
    final pending = await OfflineQueue.getPendingChanges();
    var processed = 0;

    for (final change in pending) {
      // Check retry count
      if (change.retryCount >= _maxRetries) {
        continue;
      }

      // Mark as in-flight
      await OfflineQueue.markInFlight(change.id);

      try {
        // Execute the operation
        final success = await _executeOperation(change);

        if (success) {
          // Clear after success
          await OfflineQueue.clear(change.id);
          processed++;
        } else {
          // Increment retry with backoff
          await _retryWithBackoff(change);
        }
      } catch (e) {
        // Increment retry on error
        await OfflineQueue.incrementRetry(change.id, e.toString());
        await _retryWithBackoff(change);
      }
    }

    return QueueProcessResult(processed: processed);
  }

  /// Execute operation based on type
  static Future<bool> _executeOperation(PendingChange change) async {
    final payload = jsonDecode(change.payload) as Map<String, dynamic>;
    final entityType = change.entityType;
    final entityId = change.entityId;
    final operation = change.operation;

    // Call API based on operation type
    // This would integrate with your API service
    // For now, simulate success
    return true;
  }

  /// Retry with exponential backoff
  static Future<void> _retryWithBackoff(PendingChange change) async {
    final retryIndex = change.retryCount.clamp(0, _backoffMs.length - 1);
    final delay = _backoffMs[retryIndex];
    await Future.delayed(Duration(milliseconds: delay));
  }

  /// Pull incremental changes from server
  static Future<PullResult> _pullChanges() async {
    final lastSyncTime = await _getLastSyncTime();

    // Call pull API
    // GET /sync/pull?since={lastSyncTime}
    // This would integrate with your API service
    // For now, return empty
    return PullResult(pulled: 0);
  }

  /// Apply server changes to local cache
  static Future<void> applyServerChanges(List<Map<String, dynamic>> changes) async {
    for (final change in changes) {
      final entityType = change['entityType'] as String?;
      final entityId = change['entityId'] as int?;
      final operation = change['operation'] as String?;
      final data = change['data'] as Map<String, dynamic>?;

      if (entityType == null || entityId == null) continue;

      // Check for conflicts
      final hasConflict = await _checkConflict(entityType, entityId, data);
      if (hasConflict) {
        await _logConflict(entityType, entityId, change);
        // Apply server-authoritative resolution
        await _applyServerAuthoritative(entityType, entityId, data);
      } else {
        // Apply normally
        await _applyChange(entityType, entityId, operation, data);
      }
    }

    // Update last sync time
    await _setLastSyncTime(DateTime.now().toIso8601String());
  }

  /// Check for conflict
  static Future<bool> _checkConflict(
    String entityType,
    int entityId,
    Map<String, dynamic>? serverData,
  ) async {
    if (serverData == null) return false;

    final serverVersion = serverData['sync_version'] as int?;
    if (serverVersion == null) return false;

    // Get local version
    final localVersion = await _getLocalVersion(entityType, entityId);
    return localVersion != null && serverVersion > localVersion;
  }

  /// Get local version
  static Future<int?> _getLocalVersion(String entityType, int entityId) async {
    if (_db == null) return null;

    try {
      switch (entityType) {
        case 'incident':
          final query = _db!.select(_db!.incidents)
            ..where((t) => t.id.equals(entityId));
          final row = await query.getSingleOrNull();
          return row?.syncVersion;
        case 'volunteer':
          final query = _db!.select(_db!.volunteers)
            ..where((t) => t.id.equals(entityId));
          final row = await query.getSingleOrNull();
          return row?.syncVersion;
        case 'shelter':
          final query = _db!.select(_db!.shelters)
            ..where((t) => t.id.equals(entityId));
          final row = await query.getSingleOrNull();
          return row?.syncVersion;
        case 'mission':
          final query = _db!.select(_db!.missions)
            ..where((t) => t.id.equals(entityId));
          final row = await query.getSingleOrNull();
          return row?.syncVersion;
        default:
          return null;
      }
    } catch (e) {
      return null;
    }
  }

  /// Apply server-authoritative resolution
  static Future<void> _applyServerAuthoritative(
    String entityType,
    int entityId,
    Map<String, dynamic>? data,
  ) async {
    // For status/assignment fields, server wins
    final status = data?['status'] as String?;
    final assignedTo = data?['assignedTo'] as String?;

    if (status != null || assignedTo != null) {
      await _applyChange(entityType, entityId, 'update', {
        if (status != null) 'status': status,
        if (assignedTo != null) 'assignedTo': assignedTo,
      });
    }
  }

  /// Apply change to local cache
  static Future<void> _applyChange(
    String entityType,
    int entityId,
    String? operation,
    Map<String, dynamic>? data,
  ) async {
    if (_db == null) return;

    final now = DateTime.now();

    switch (entityType) {
      case 'incident':
        if (data != null) {
          await _db!.into(_db!.incidents).insertOnConflictUpdate(
            IncidentsCompanion.insert(
              id: entityId,
              title: data['title'] as String? ?? '',
              description: Value(data['description'] as String?),
              disasterType: data['disasterType'] as String? ?? '',
              status: Value(data['status'] as String? ?? 'REPORTED'),
              latitude: (data['latitude'] as num?)?.toDouble() ?? 0.0,
              longitude: (data['longitude'] as num?)?.toDouble() ?? 0.0,
              address: Value(data['address'] as String?),
              region: Value(data['region'] as String?),
              kecamatan: Value(data['kecamatan'] as String?),
              desa: Value(data['desa'] as String?),
              cachedAt: Value(now),
              syncVersion: Value((data['sync_version'] as int?) ?? 1),
            ),
          );
        }
        break;
      case 'volunteer':
        if (data != null) {
          await _db!.into(_db!.volunteers).insertOnConflictUpdate(
            VolunteersCompanion.insert(
              id: entityId,
              fullName: data['fullName'] as String? ?? '',
              phone: Value(data['phone'] as String?),
              email: Value(data['email'] as String?),
              status: Value(data['status'] as String? ?? 'approved'),
              cachedAt: Value(now),
              syncVersion: Value((data['sync_version'] as int?) ?? 1),
            ),
          );
        }
        break;
      case 'shelter':
        if (data != null) {
          await _db!.into(_db!.shelters).insertOnConflictUpdate(
            SheltersCompanion.insert(
              id: entityId,
              name: data['name'] as String? ?? '',
              region: Value(data['region'] as String?),
              status: Value(data['status'] as String? ?? 'AKTIF'),
              cachedAt: Value(now),
              syncVersion: Value((data['sync_version'] as int?) ?? 1),
            ),
          );
        }
        break;
      case 'mission':
        if (data != null) {
          await _db!.into(_db!.missions).insertOnConflictUpdate(
            MissionsCompanion.insert(
              id: entityId,
              title: data['title'] as String? ?? '',
              disasterType: data['disasterType'] as String? ?? '',
              status: Value(data['status'] as String? ?? 'REPORTED'),
              latitude: (data['latitude'] as num?)?.toDouble() ?? 0.0,
              longitude: (data['longitude'] as num?)?.toDouble() ?? 0.0,
              cachedAt: Value(now),
              syncVersion: Value((data['sync_version'] as int?) ?? 1),
            ),
          );
        }
        break;
    }
  }

  /// Log conflict for manual review
  static Future<void> _logConflict(
    String entityType,
    int entityId,
    Map<String, dynamic> serverData,
  ) async {
    // Log to console (could also store in conflict_log table)
    // ignore: avoid_print
    print('[SyncConflict] $entityType:$entityId - server version ${serverData['sync_version']}');
  }

  /// Get last sync time
  static Future<String?> _getLastSyncTime() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastSyncTimeKey);
  }

  /// Set last sync time
  static Future<void> _setLastSyncTime(String time) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastSyncTimeKey, time);
  }

  /// Get last sync time (public)
  static Future<String?> getLastSyncTime() async {
    return _getLastSyncTime();
  }

  /// Close database
  static Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}

/// Result of sync operation
class SyncResult {
  final bool success;
  final String? reason;
  final int queuedCount;
  final int pulledCount;

  SyncResult({
    required this.success,
    this.reason,
    this.queuedCount = 0,
    this.pulledCount = 0,
  });
}

/// Result of queue processing
class QueueProcessResult {
  final int processed;

  QueueProcessResult({required this.processed});
}

/// Result of pull operation
class PullResult {
  final int pulled;

  PullResult({required this.pulled});
}