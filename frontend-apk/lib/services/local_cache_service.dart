import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import '../database/app_database.dart';

/// Local cache service with multiple cache strategies
/// - getOrFetch: returns cached data or fetches from network
/// - cacheFirst: returns cached then refreshes in background
/// - networkFirst: tries network then falls back to cache
class LocalCacheService {
  static AppDatabase? _db;
  static final Connectivity _connectivity = Connectivity();

  /// Initialize database
  static Future<void> initialize() async {
    _db = AppDatabase();
  }

  /// Get database instance
  static AppDatabase get db {
    if (_db == null) {
      throw StateError('LocalCacheService not initialized. Call initialize() first.');
    }
    return _db!;
  }

  /// Check if online
  static Future<bool> isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return !result.contains(ConnectivityResult.none);
  }

  /// Get incidents with cache strategy
  static Future<List<Incident>> getIncidents({
    required Future<List<Incident>> Function() fetchFn,
    int ttl = 300,
    String? region,
  }) async {
    final cached = await _getIncidentsFromCache(region, ttl);
    if (cached.isNotEmpty) {
      return cached;
    }

    if (await isOnline()) {
      final data = await fetchFn();
      if (data.isNotEmpty) {
        await _saveIncidents(data);
      }
      return data;
    }

    return cached;
  }

  /// Cache first strategy for incidents
  static Future<List<Incident>> cacheFirstIncidents({
    required Future<List<Incident>> Function() fetchFn,
    int ttl = 300,
    String? region,
  }) async {
    final cached = await _getIncidentsFromCache(region, ttl);

    // Refresh in background
    if (await isOnline()) {
      Future(() async {
        try {
          final data = await fetchFn();
          if (data.isNotEmpty) {
            await _saveIncidents(data);
          }
        } catch (_) {}
      });
    }

    return cached;
  }

  /// Network first strategy for incidents
  static Future<List<Incident>> networkFirstIncidents({
    required Future<List<Incident>> Function() fetchFn,
    int ttl = 300,
    String? region,
  }) async {
    if (await isOnline()) {
      try {
        final data = await fetchFn();
        if (data.isNotEmpty) {
          await _saveIncidents(data);
        }
        return data;
      } catch (_) {
        // Fall through to cache
      }
    }

    return await _getIncidentsFromCache(region, ttl * 2);
  }

  /// Get volunteers with cache
  static Future<List<Volunteer>> getVolunteers({
    required Future<List<Volunteer>> Function() fetchFn,
    int ttl = 3600,
    String? region,
  }) async {
    final cached = await _getVolunteersFromCache(region, ttl);
    if (cached.isNotEmpty) {
      return cached;
    }

    if (await isOnline()) {
      final data = await fetchFn();
      if (data.isNotEmpty) {
        await _saveVolunteers(data);
      }
      return data;
    }

    return cached;
  }

  /// Get shelters with cache
  static Future<List<Shelter>> getShelters({
    required Future<List<Shelter>> Function() fetchFn,
    int ttl = 600,
    int? incidentId,
  }) async {
    final cached = await _getSheltersFromCache(incidentId, ttl);
    if (cached.isNotEmpty) {
      return cached;
    }

    if (await isOnline()) {
      final data = await fetchFn();
      if (data.isNotEmpty) {
        await _saveShelters(data);
      }
      return data;
    }

    return cached;
  }

  /// Get missions with cache
  static Future<List<Mission>> getMissions({
    required Future<List<Mission>> Function() fetchFn,
    int ttl = 300,
    String? region,
  }) async {
    final cached = await _getMissionsFromCache(region, ttl);
    if (cached.isNotEmpty) {
      return cached;
    }

    if (await isOnline()) {
      final data = await fetchFn();
      if (data.isNotEmpty) {
        await _saveMissions(data);
      }
      return data;
    }

    return cached;
  }

  /// Get historical disasters with cache
  static Future<List<HistoricalDisaster>> getHistoricalDisasters({
    required Future<List<HistoricalDisaster>> Function() fetchFn,
    int ttl = 86400,
    String? region,
  }) async {
    final cached = await _getHistoricalFromCache(region, ttl);
    if (cached.isNotEmpty) {
      return cached;
    }

    if (await isOnline()) {
      final data = await fetchFn();
      if (data.isNotEmpty) {
        await _saveHistorical(data);
      }
      return data;
    }

    return cached;
  }

  // Private cache helpers
  static Future<List<Incident>> _getIncidentsFromCache(String? region, int ttl) async {
    if (_db == null) return [];

    try {
      final query = _db!.select(_db!.incidents);
      if (region != null) {
        query.where((t) => t.region.equals(region));
      }

      final rows = await query.get();
      final valid = rows.where((r) {
        if (r.cachedAt == null) return false;
        return DateTime.now().difference(r.cachedAt!).inSeconds <= ttl;
      }).toList();

      return valid;
    } catch (e) {
      return [];
    }
  }

  static Future<void> _saveIncidents(List<Incident> data) async {
    if (_db == null) return;
    final now = DateTime.now();

    for (final i in data) {
      await _db!.into(_db!.incidents).insertOnConflictUpdate(
        IncidentsCompanion.insert(
          id: i.id,
          title: i.title,
          description: Value(i.description),
          disasterType: i.disasterType,
          status: Value(i.status),
          latitude: i.latitude,
          longitude: i.longitude,
          address: Value(i.address),
          region: Value(i.region),
          kecamatan: Value(i.kecamatan),
          desa: Value(i.desa),
          affectedPeople: Value(i.affectedPeople),
          casualties: Value(i.casualties),
          evacuated: Value(i.evacuated),
          reportedBy: Value(i.reportedBy),
          reportedAt: Value(i.reportedAt),
          verifiedAt: Value(i.verifiedAt),
          updatedAt: Value(i.updatedAt),
          priorityScore: Value(i.priorityScore),
          priorityLevel: Value(i.priorityLevel),
          isAiGenerated: Value(i.isAiGenerated),
          sourceUrl: Value(i.sourceUrl),
          photoData: Value(i.photoData),
          cachedAt: Value(now),
        ),
      );
    }
  }

  static Future<List<Volunteer>> _getVolunteersFromCache(String? region, int ttl) async {
    if (_db == null) return [];

    try {
      final query = _db!.select(_db!.volunteers);
      if (region != null) {
        query.where((t) => t.regency.equals(region));
      }

      final rows = await query.get();
      final valid = rows.where((r) {
        if (r.cachedAt == null) return false;
        return DateTime.now().difference(r.cachedAt!).inSeconds <= ttl;
      }).toList();

      return valid;
    } catch (e) {
      return [];
    }
  }

  static Future<void> _saveVolunteers(List<Volunteer> data) async {
    if (_db == null) return;
    final now = DateTime.now();

    for (final v in data) {
      await _db!.into(_db!.volunteers).insertOnConflictUpdate(
        VolunteersCompanion.insert(
          id: v.id,
          userId: Value(v.userId),
          fullName: v.fullName,
          phone: Value(v.phone),
          email: Value(v.email),
          birthDate: Value(v.birthDate),
          gender: Value(v.gender),
          bloodType: Value(v.bloodType),
          regency: Value(v.regency),
          district: Value(v.district),
          village: Value(v.village),
          detailAddress: Value(v.detailAddress),
          latitude: Value(v.latitude),
          longitude: Value(v.longitude),
          medicalHistory: Value(v.medicalHistory),
          expertise: Value(v.expertise),
          experience: Value(v.experience),
          status: Value(v.status),
          cachedAt: Value(now),
        ),
      );
    }
  }

  static Future<List<Shelter>> _getSheltersFromCache(int? incidentId, int ttl) async {
    if (_db == null) return [];

    try {
      final query = _db!.select(_db!.shelters);
      if (incidentId != null) {
        query.where((t) => t.incidentId.equals(incidentId));
      }

      final rows = await query.get();
      final valid = rows.where((r) {
        if (r.cachedAt == null) return false;
        return DateTime.now().difference(r.cachedAt!).inSeconds <= ttl;
      }).toList();

      return valid;
    } catch (e) {
      return [];
    }
  }

  static Future<void> _saveShelters(List<Shelter> data) async {
    if (_db == null) return;
    final now = DateTime.now();

    for (final s in data) {
      await _db!.into(_db!.shelters).insertOnConflictUpdate(
        SheltersCompanion.insert(
          id: s.id,
          incidentId: Value(s.incidentId),
          name: s.name,
          region: Value(s.region),
          address: Value(s.address),
          latitude: Value(s.latitude),
          longitude: Value(s.longitude),
          status: Value(s.status),
          score: Value(s.score),
          refugeeCount: Value(s.refugeeCount),
          stockStatus: Value(s.stockStatus),
          contactPerson: Value(s.contactPerson),
          contactPhone: Value(s.contactPhone),
          cachedAt: Value(now),
        ),
      );
    }
  }

  static Future<List<Mission>> _getMissionsFromCache(String? region, int ttl) async {
    if (_db == null) return [];

    try {
      final query = _db!.select(_db!.missions);
      if (region != null) {
        query.where((t) => t.region.equals(region));
      }

      final rows = await query.get();
      final valid = rows.where((r) {
        if (r.cachedAt == null) return false;
        return DateTime.now().difference(r.cachedAt!).inSeconds <= ttl;
      }).toList();

      return valid;
    } catch (e) {
      return [];
    }
  }

  static Future<void> _saveMissions(List<Mission> data) async {
    if (_db == null) return;
    final now = DateTime.now();

    for (final m in data) {
      await _db!.into(_db!.missions).insertOnConflictUpdate(
        MissionsCompanion.insert(
          id: m.id,
          title: m.title,
          description: Value(m.description),
          disasterType: m.disasterType,
          status: Value(m.status),
          latitude: m.latitude,
          longitude: m.longitude,
          address: Value(m.address),
          region: Value(m.region),
          kecamatan: Value(m.kecamatan),
          desa: Value(m.desa),
          affectedPeople: Value(m.affectedPeople),
          assignedTeam: Value(m.assignedTeam),
          commanderName: Value(m.commanderName),
          missionStart: Value(m.missionStart),
          missionEnd: Value(m.missionEnd),
          notes: Value(m.notes),
          cachedAt: Value(now),
        ),
      );
    }
  }

  static Future<List<HistoricalDisaster>> _getHistoricalFromCache(String? region, int ttl) async {
    if (_db == null) return [];

    try {
      final query = _db!.select(_db!.historicalDisasters);
      if (region != null) {
        query.where((t) => t.region.equals(region));
      }

      final rows = await query.get();
      final valid = rows.where((r) {
        if (r.cachedAt == null) return false;
        return DateTime.now().difference(r.cachedAt!).inSeconds <= ttl;
      }).toList();

      return valid;
    } catch (e) {
      return [];
    }
  }

  static Future<void> _saveHistorical(List<HistoricalDisaster> data) async {
    if (_db == null) return;
    final now = DateTime.now();

    for (final h in data) {
      await _db!.into(_db!.historicalDisasters).insertOnConflictUpdate(
        HistoricalDisastersCompanion.insert(
          id: h.id,
          region: h.region,
          disasterType: h.disasterType,
          eventDate: h.eventDate,
          latitude: Value(h.latitude),
          longitude: Value(h.longitude),
          time: Value(h.time),
          cachedAt: Value(now),
        ),
      );
    }
  }

  /// Invalidate cache for entity
  static Future<void> invalidate(String entityType, int entityId) async {
    if (_db == null) return;

    switch (entityType) {
      case 'incident':
        await (_db!.delete(_db!.incidents)
              ..where((t) => t.id.equals(entityId)))
            .go();
        break;
      case 'volunteer':
        await (_db!.delete(_db!.volunteers)
              ..where((t) => t.id.equals(entityId)))
            .go();
        break;
      case 'shelter':
        await (_db!.delete(_db!.shelters)
              ..where((t) => t.id.equals(entityId)))
            .go();
        break;
      case 'mission':
        await (_db!.delete(_db!.missions)
              ..where((t) => t.id.equals(entityId)))
            .go();
        break;
    }
  }

  /// Check if cache is expired
  static bool isCacheExpired(DateTime? cachedAt, int ttl) {
    if (cachedAt == null) return true;
    final age = DateTime.now().difference(cachedAt).inSeconds;
    return age > ttl;
  }

  /// Purge stale entries
  static Future<void> purgeStaleEntries(int retentionSeconds) async {
    if (_db == null) return;

    final cutoff = DateTime.now().subtract(Duration(seconds: retentionSeconds));

    await (_db!.delete(_db!.incidents)
          ..where((t) => t.cachedAt.isSmallerThanValue(cutoff)))
        .go();

    await (_db!.delete(_db!.volunteers)
          ..where((t) => t.cachedAt.isSmallerThanValue(cutoff)))
        .go();

    await (_db!.delete(_db!.shelters)
          ..where((t) => t.cachedAt.isSmallerThanValue(cutoff)))
        .go();

    await (_db!.delete(_db!.missions)
          ..where((t) => t.cachedAt.isSmallerThanValue(cutoff)))
        .go();

    await (_db!.delete(_db!.historicalDisasters)
          ..where((t) => t.cachedAt.isSmallerThanValue(cutoff)))
        .go();
  }

  /// Add pending change for offline sync
  static Future<void> addPendingChange({
    required String entityType,
    required int entityId,
    required String operation,
    required Map<String, dynamic> payload,
  }) async {
    if (_db == null) return;

    await _db!.into(_db!.pendingChanges).insert(
      PendingChangesCompanion.insert(
        entityType: entityType,
        entityId: entityId,
        operation: operation,
        payload: jsonEncode(payload),
        createdAt: Value(DateTime.now()),
      ),
    );
  }

  /// Get pending changes
  static Future<List<PendingChange>> getPendingChanges() async {
    if (_db == null) return [];
    return _db!.select(_db!.pendingChanges).get();
  }

  /// Clear pending change
  static Future<void> clearPendingChange(int id) async {
    if (_db == null) return;
    await (_db!.delete(_db!.pendingChanges)
          ..where((t) => t.id.equals(id)))
        .go();
  }

  /// Close database
  static Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}