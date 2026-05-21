import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/incident_repository.dart';
import '../services/api_service.dart';

/// Incidents Provider
final incidentRepositoryProvider = Provider<IncidentRepository>((ref) {
  return IncidentRepository();
});

final incidentsProvider = StateNotifierProvider<IncidentsNotifier, AsyncValue<List<Incident>>>((ref) {
  final repository = ref.watch(incidentRepositoryProvider);
  return IncidentsNotifier(repository);
});

class IncidentsNotifier extends StateNotifier<AsyncValue<List<Incident>>> {
  final IncidentRepository _repository;
  IncidentFilters? _currentFilters;

  IncidentsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadIncidents();
  }

  Future<void> loadIncidents({IncidentFilters? filters}) async {
    _currentFilters = filters;
    state = const AsyncValue.loading();
    try {
      final incidents = await _repository.getIncidents(filters: filters);
      if (incidents.isEmpty) {
        state = const AsyncValue.data(<Incident>[]);
      } else {
        state = AsyncValue.data(incidents);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await loadIncidents(filters: _currentFilters);
  }

  Future<void> applyFilters(IncidentFilters filters) async {
    await loadIncidents(filters: filters);
  }

  Future<void> clearFilters() async {
    _currentFilters = null;
    await loadIncidents();
  }
}

final publicIncidentsProvider = StateNotifierProvider<PublicIncidentsNotifier, AsyncValue<List<Incident>>>((ref) {
  final repository = ref.watch(incidentRepositoryProvider);
  return PublicIncidentsNotifier(repository);
});

class PublicIncidentsNotifier extends StateNotifier<AsyncValue<List<Incident>>> {
  final IncidentRepository _repository;

  PublicIncidentsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadPublicIncidents();
  }

  Future<void> loadPublicIncidents({IncidentFilters? filters}) async {
    state = const AsyncValue.loading();
    try {
      final incidents = await _repository.getPublicIncidents(filters: filters);
      if (incidents.isEmpty) {
        state = const AsyncValue.data(<Incident>[]);
      } else {
        state = AsyncValue.data(incidents);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await loadPublicIncidents();
  }
}

final incidentDetailProvider = FutureProvider.family<Incident, int>((ref, id) async {
  final repository = ref.watch(incidentRepositoryProvider);
  return repository.getIncidentById(id);
});

final incidentGeoJsonProvider = StateNotifierProvider<IncidentGeoJsonNotifier, AsyncValue<List<IncidentGeoJson>>>((ref) {
  final repository = ref.watch(incidentRepositoryProvider);
  return IncidentGeoJsonNotifier(repository);
});

class IncidentGeoJsonNotifier extends StateNotifier<AsyncValue<List<IncidentGeoJson>>> {
  final IncidentRepository _repository;
  BoundingBox? _currentBox;

  IncidentGeoJsonNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadGeoJson();
  }

  Future<void> loadGeoJson({BoundingBox? bbox}) async {
    _currentBox = bbox;
    state = const AsyncValue.loading();
    try {
      final geoJson = await _repository.getIncidentGeoJson(bbox: bbox);
      if (geoJson.isEmpty) {
        state = const AsyncValue.data(<IncidentGeoJson>[]);
      } else {
        state = AsyncValue.data(geoJson);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await loadGeoJson(bbox: _currentBox);
  }

  Future<void> updateBoundingBox(BoundingBox bbox) async {
    await loadGeoJson(bbox: bbox);
  }
}

final analyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ApiService();
  final response = await api.getAnalyticsSummary();
  return response.data;
});

class ForecastParams {
  final int days;
  final String? model;
  ForecastParams({required this.days, this.model});
}

final forecastProvider = FutureProvider.family<Map<String, dynamic>, ForecastParams>((ref, params) async {
  final api = ApiService();
  final response = await api.getForecast(days: params.days, model: params.model);
  return response.data;
});

extension IncidentsExtension on AsyncValue<List<Incident>> {
  bool get isEmpty => valueOrNull?.isEmpty ?? false;
  bool get isNotEmpty => valueOrNull?.isNotEmpty ?? false;
  int get length => valueOrNull?.length ?? 0;
}