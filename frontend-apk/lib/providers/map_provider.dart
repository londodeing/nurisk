import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/incident_repository.dart';

/// Map Provider
/// =============
/// GeoJSON and map state management

// ==========================================================
// Repository Provider
// ==========================================================

final mapIncidentRepositoryProvider = Provider<IncidentRepository>((ref) {
  return IncidentRepository();
});

// ==========================================================
// Map Incidents (GeoJSON)
// ==========================================================

final mapIncidentsProvider = StateNotifierProvider<MapIncidentsNotifier, AsyncValue<List<IncidentGeoJson>>>((ref) {
  final repository = ref.watch(mapIncidentRepositoryProvider);
  return MapIncidentsNotifier(repository);
});

class MapIncidentsNotifier extends StateNotifier<AsyncValue<List<IncidentGeoJson>>> {
  final IncidentRepository _repository;
  BoundingBox? _currentBox;

  MapIncidentsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadMapIncidents();
  }

  /// Load incidents for map view
  Future<void> loadMapIncidents({BoundingBox? bbox}) async {
    _currentBox = bbox;
    state = const AsyncValue.loading();
    try {
      final incidents = await _repository.getIncidentGeoJson(bbox: bbox);
      if (incidents.isEmpty) {
        state = const AsyncValue.data(<IncidentGeoJson>[]);
      } else {
        state = AsyncValue.data(incidents);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Refresh map incidents
  Future<void> refresh() async {
    await loadMapIncidents(bbox: _currentBox);
  }

  /// Update bounding box and reload
  Future<void> updateBoundingBox(BoundingBox bbox) async {
    await loadMapIncidents(bbox: bbox);
  }

  /// Clear and reload all
  Future<void> clearAndReload() async {
    _currentBox = null;
    await loadMapIncidents();
  }
}

// ==========================================================
// Map Bounds
// ==========================================================

final mapBoundsProvider = StateProvider<BoundingBox?>((ref) => null);

// ==========================================================
// Selected Incident
// ==========================================================

final selectedMapIncidentProvider = StateProvider<IncidentGeoJson?>((ref) => null);

// ==========================================================
// Map Filter State
// ==========================================================

class MapFilterState {
  final List<String> selectedDisasterTypes;
  final List<String> selectedStatuses;
  final DateTime? fromDate;
  final DateTime? toDate;

  const MapFilterState({
    this.selectedDisasterTypes = const [],
    this.selectedStatuses = const [],
    this.fromDate,
    this.toDate,
  });

  MapFilterState copyWith({
    List<String>? selectedDisasterTypes,
    List<String>? selectedStatuses,
    DateTime? fromDate,
    DateTime? toDate,
  }) {
    return MapFilterState(
      selectedDisasterTypes: selectedDisasterTypes ?? this.selectedDisasterTypes,
      selectedStatuses: selectedStatuses ?? this.selectedStatuses,
      fromDate: fromDate ?? this.fromDate,
      toDate: toDate ?? this.toDate,
    );
  }

  bool get hasFilters =>
      selectedDisasterTypes.isNotEmpty ||
      selectedStatuses.isNotEmpty ||
      fromDate != null ||
      toDate != null;
}

final mapFilterProvider = StateProvider<MapFilterState>((ref) => const MapFilterState());

// ==========================================================
// Map Loading State
// ==========================================================

final isMapLoadingProvider = Provider<bool>((ref) {
  final incidents = ref.watch(mapIncidentsProvider);
  return incidents.isLoading;
});

// ==========================================================
// Map Error State
// ==========================================================

final mapErrorProvider = Provider<String?>((ref) {
  final incidents = ref.watch(mapIncidentsProvider);
  return incidents.error?.toString();
});

// ==========================================================
// Incident Count by Type
// ==========================================================

final incidentCountByTypeProvider = Provider<Map<String, int>>((ref) {
  final incidents = ref.watch(mapIncidentsProvider);
  final data = incidents.valueOrNull;
  if (data == null) return {};

  final counts = <String, int>{};
  for (final incident in data) {
    counts[incident.disasterType] = (counts[incident.disasterType] ?? 0) + 1;
  }
  return counts;
});

// ==========================================================
// Incident Count by Status
// ==========================================================

final incidentCountByStatusProvider = Provider<Map<String, int>>((ref) {
  final incidents = ref.watch(mapIncidentsProvider);
  final data = incidents.valueOrNull;
  if (data == null) return {};

  final counts = <String, int>{};
  for (final incident in data) {
    counts[incident.status] = (counts[incident.status] ?? 0) + 1;
  }
  return counts;
});