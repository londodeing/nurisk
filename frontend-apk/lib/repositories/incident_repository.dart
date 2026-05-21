import '../services/api_service.dart';

/// Incident Repository
/// ===================
/// Repository for incident-related API operations

class IncidentRepository {
  final ApiService _api = ApiService();

  // ==========================================================
  // CRUD Operations
  // ==========================================================

  /// Get all incidents with optional filters
  Future<List<Incident>> getIncidents({IncidentFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getIncidents(params: queryParams);
    final data = response.data['incidents'] ?? response.data;
    if (data is List) {
      return data.map((json) => Incident.fromJson(json)).toList();
    }
    return [];
  }

  /// Get incident by ID
  Future<Incident> getIncidentById(int id) async {
    final response = await _api.getIncidentById(id);
    return Incident.fromJson(response.data);
  }

  /// Create new incident
  Future<Incident> createIncident(IncidentCreate data) async {
    final response = await _api.createIncident(data.toJson());
    return Incident.fromJson(response.data);
  }

  /// Update existing incident
  Future<Incident> updateIncident(int id, IncidentUpdate data) async {
    final response = await _api.updateIncident(id, data.toJson());
    return Incident.fromJson(response.data);
  }

  /// Update incident status
  Future<Incident> updateStatus(int id, String status) async {
    final response = await _api.updateIncidentStatus(id, status);
    return Incident.fromJson(response.data);
  }

  /// Submit assessment for incident
  Future<Incident> submitAssessment(int id, AssessmentData data) async {
    final response = await _api.submitAssessment(id, data.toJson());
    return Incident.fromJson(response.data);
  }

  // ==========================================================
  // GeoJSON for Map
  // ==========================================================

  /// Get incidents as GeoJSON for map marker loading
  /// [bbox] optional bounding box: {minLat, maxLat, minLng, maxLng}
  Future<List<IncidentGeoJson>> getIncidentGeoJson({BoundingBox? bbox}) async {
    final queryParams = <String, dynamic>{};
    if (bbox != null) {
      queryParams.addAll(bbox.toQueryParams());
    }
    final response = await _api.getIncidents(params: queryParams);
    final data = response.data['incidents'] ?? response.data;
    if (data is List) {
      return data.map((json) => IncidentGeoJson.fromJson(json)).toList();
    }
    return [];
  }

  /// Get public incidents (no auth required)
  Future<List<Incident>> getPublicIncidents({IncidentFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getPublicIncidents(params: queryParams);
    final data = response.data['incidents'] ?? response.data;
    if (data is List) {
      return data.map((json) => Incident.fromJson(json)).toList();
    }
    return [];
  }
}

/// Incident Model
class Incident {
  final int id;
  final String title;
  final String description;
  final String disasterType;
  final String status;
  final double latitude;
  final double longitude;
  final String address;
  final String? regency;
  final String? district;
  final String? village;
  final int? casualties;
  final int? affected;
  final int? evacuated;
  final String? reportedBy;
  final DateTime? reportedAt;
  final DateTime? verifiedAt;
  final DateTime? updatedAt;

  Incident({
    required this.id,
    required this.title,
    required this.description,
    required this.disasterType,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.address,
    this.regency,
    this.district,
    this.village,
    this.casualties,
    this.affected,
    this.evacuated,
    this.reportedBy,
    this.reportedAt,
    this.verifiedAt,
    this.updatedAt,
  });

  factory Incident.fromJson(Map<String, dynamic> json) {
    return Incident(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      disasterType: json['disasterType'] ?? json['disaster_type'] ?? '',
      status: json['status'] ?? 'REPORTED',
      latitude: (json['latitude'] ?? json['lat'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? json['lng'] ?? 0).toDouble(),
      address: json['address'] ?? '',
      regency: json['regency'],
      district: json['district'],
      village: json['village'],
      casualties: json['casualties'],
      affected: json['affected'],
      evacuated: json['evacuated'],
      reportedBy: json['reportedBy'] ?? json['reported_by'],
      reportedAt: json['reportedAt'] != null ? DateTime.tryParse(json['reportedAt']) : null,
      verifiedAt: json['verifiedAt'] != null ? DateTime.tryParse(json['verifiedAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'disasterType': disasterType,
        'status': status,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'regency': regency,
        'district': district,
        'village': village,
        'casualties': casualties,
        'affected': affected,
        'evacuated': evacuated,
        'reportedBy': reportedBy,
        'reportedAt': reportedAt?.toIso8601String(),
        'verifiedAt': verifiedAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };
}

/// GeoJSON variant for map markers
class IncidentGeoJson {
  final int id;
  final String title;
  final String disasterType;
  final String status;
  final double latitude;
  final double longitude;

  IncidentGeoJson({
    required this.id,
    required this.title,
    required this.disasterType,
    required this.status,
    required this.latitude,
    required this.longitude,
  });

  factory IncidentGeoJson.fromJson(Map<String, dynamic> json) {
    return IncidentGeoJson(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      disasterType: json['disasterType'] ?? json['disaster_type'] ?? '',
      status: json['status'] ?? 'REPORTED',
      latitude: (json['latitude'] ?? json['lat'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? json['lng'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toGeoJson() => {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [longitude, latitude],
        },
        'properties': {
          'id': id,
          'title': title,
          'disasterType': disasterType,
          'status': status,
        },
      };
}

/// Filter options for incident queries
class IncidentFilters {
  final String? status;
  final String? disasterType;
  final String? regency;
  final DateTime? fromDate;
  final DateTime? toDate;
  final int? minPriority;
  final int? limit;
  final int? offset;

  IncidentFilters({
    this.status,
    this.disasterType,
    this.regency,
    this.fromDate,
    this.toDate,
    this.minPriority,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (disasterType != null) params['disasterType'] = disasterType;
    if (regency != null) params['regency'] = regency;
    if (fromDate != null) params['fromDate'] = fromDate!.toIso8601String().split('T')[0];
    if (toDate != null) params['toDate'] = toDate!.toIso8601String().split('T')[0];
    if (minPriority != null) params['minPriority'] = minPriority;
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}

/// Bounding box for spatial queries
class BoundingBox {
  final double minLat;
  final double maxLat;
  final double minLng;
  final double maxLng;

  BoundingBox({
    required this.minLat,
    required this.maxLat,
    required this.minLng,
    required this.maxLng,
  });

  Map<String, dynamic> toQueryParams() => {
        'minLat': minLat,
        'maxLat': maxLat,
        'minLng': minLng,
        'maxLng': maxLng,
      };
}

/// Data class for creating incidents
class IncidentCreate {
  final String title;
  final String description;
  final String disasterType;
  final double latitude;
  final double longitude;
  final String address;
  final String? regency;
  final String? district;
  final String? village;

  IncidentCreate({
    required this.title,
    required this.description,
    required this.disasterType,
    required this.latitude,
    required this.longitude,
    required this.address,
    this.regency,
    this.district,
    this.village,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'disasterType': disasterType,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'regency': regency,
        'district': district,
        'village': village,
      };
}

/// Data class for updating incidents
class IncidentUpdate {
  final String? title;
  final String? description;
  final String? disasterType;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? regency;
  final String? district;
  final String? village;
  final int? casualties;
  final int? affected;
  final int? evacuated;

  IncidentUpdate({
    this.title,
    this.description,
    this.disasterType,
    this.latitude,
    this.longitude,
    this.address,
    this.regency,
    this.district,
    this.village,
    this.casualties,
    this.affected,
    this.evacuated,
  });

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (title != null) json['title'] = title;
    if (description != null) json['description'] = description;
    if (disasterType != null) json['disasterType'] = disasterType;
    if (latitude != null) json['latitude'] = latitude;
    if (longitude != null) json['longitude'] = longitude;
    if (address != null) json['address'] = address;
    if (regency != null) json['regency'] = regency;
    if (district != null) json['district'] = district;
    if (village != null) json['village'] = village;
    if (casualties != null) json['casualties'] = casualties;
    if (affected != null) json['affected'] = affected;
    if (evacuated != null) json['evacuated'] = evacuated;
    return json;
  }
}

/// Assessment data for incidents
class AssessmentData {
  final int? casualties;
  final int? affected;
  final int? evacuated;
  final int? damageLevel;
  final String? notes;
  final List<String>? needs;

  AssessmentData({
    this.casualties,
    this.affected,
    this.evacuated,
    this.damageLevel,
    this.notes,
    this.needs,
  });

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (casualties != null) json['casualties'] = casualties;
    if (affected != null) json['affected'] = affected;
    if (evacuated != null) json['evacuated'] = evacuated;
    if (damageLevel != null) json['damageLevel'] = damageLevel;
    if (notes != null) json['notes'] = notes;
    if (needs != null) json['needs'] = needs;
    return json;
  }
}