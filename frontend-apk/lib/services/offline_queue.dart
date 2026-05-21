import 'dart:convert';
import 'package:drift/drift.dart';
import '../database/app_database.dart';

/// Offline queue for persisting mutations when offline
/// - Persists to pending_changes table
/// - Assigns UUID for idempotent replay
/// - Orders by created_at timestamp
class OfflineQueue {
  static AppDatabase? _db;
  static bool _isOffline = false;

  /// Check if offline mode
  static bool get isOffline => _isOffline;

  /// Get pending count
  static int get pendingCount => 0;

  /// Set offline mode
  static void setOffline(bool value) {
    _isOffline = value;
  }

  /// Initialize database
  static Future<void> initialize() async {
    _db = AppDatabase();
  }

  /// Get database instance
  static AppDatabase get db {
    if (_db == null) {
      throw StateError('OfflineQueue not initialized. Call initialize() first.');
    }
    return _db!;
  }

  /// Add operation to queue
  static Future<void> enqueue({
    required String entityType,
    required int entityId,
    required String operation,
    required Map<String, dynamic> payload,
    String? idempotencyKey,
  }) async {
    if (_db == null) return;

    // Generate UUID if not provided
    final uuid = idempotencyKey ?? _generateUUID();

    await _db!.into(_db!.pendingChanges).insert(
      PendingChangesCompanion.insert(
        entityType: entityType,
        entityId: entityId,
        operation: operation,
        payload: jsonEncode({
          ...payload,
          '_idempotencyKey': uuid,
        }),
        createdAt: Value(DateTime.now()),
      ),
    );
  }

  /// Get all pending changes ordered by created_at
  static Future<List<PendingChange>> getPendingChanges() async {
    if (_db == null) return [];

    final query = _db!.select(_db!.pendingChanges)
      ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]);

    return query.get();
  }

  /// Get pending changes count
  static Future<int> getPendingCount() async {
    if (_db == null) return 0;

    final query = _db!.select(_db!.pendingChanges);
    final rows = await query.get();
    return rows.length;
  }

  /// Mark change as in-flight (processing)
  static Future<void> markInFlight(int id) async {
    if (_db == null) return;

    await (_db!.update(_db!.pendingChanges)
          ..where((t) => t.id.equals(id)))
        .write(
      PendingChangesCompanion(
        retryCount: const Value(1),
      ),
    );
  }

  /// Increment retry count
  static Future<void> incrementRetry(int id, String? errorMessage) async {
    if (_db == null) return;

    final query = _db!.select(_db!.pendingChanges)
      ..where((t) => t.id.equals(id));

    final existing = await query.getSingleOrNull();
    if (existing == null) return;

    await (_db!.update(_db!.pendingChanges)
          ..where((t) => t.id.equals(id)))
        .write(
      PendingChangesCompanion(
        retryCount: Value(existing.retryCount + 1),
        errorMessage: Value(errorMessage),
      ),
    );
  }

  /// Clear pending change after successful sync
  static Future<void> clear(int id) async {
    if (_db == null) return;

    await (_db!.delete(_db!.pendingChanges)
          ..where((t) => t.id.equals(id)))
        .go();
  }

  /// Clear all pending changes
  static Future<void> clearAll() async {
    if (_db == null) return;

    await _db!.delete(_db!.pendingChanges).go();
  }

  /// Get pending count
  static Future<int> getPendingCount() async {
    if (_db == null) return 0;

    final query = _db!.select(_db!.pendingChanges);
    final results = await query.get();
    return results.length;
  }

  /// Get idempotency key from payload
  static String? getIdempotencyKey(Map<String, dynamic> payload) {
    return payload['_idempotencyKey'] as String?;
  }

  /// Generate UUID v4
  static String _generateUUID() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final random = DateTime.now().microsecond;
    return '${now.toRadixString(16)}-${random.toRadixString(16)}-4${_randomHex(12)}-${_randomHex(4)}-${_randomHex(16)}';
  }

  static String _randomHex(int length) {
    final buffer = StringBuffer();
    for (var i = 0; i < length; i++) {
      buffer.write((15 & 0xF).toRadixString(16));
    }
    return buffer.toString();
  }

  /// Close database
  static Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}