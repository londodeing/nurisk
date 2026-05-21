import '../services/api_service.dart';

/// Shelter Repository
/// ===============
/// Repository for shelter-related API operations

class ShelterRepository {
  final ApiService _api = ApiService();

  // ==========================================================
  // Shelter Operations
  // ==========================================================

  /// Get all shelters with optional filters
  Future<List<Shelter>> getShelters({ShelterFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getShelters(params: queryParams);
    final data = response.data['shelters'] ?? response.data;
    if (data is List) {
      return data.map((json) => Shelter.fromJson(json)).toList();
    }
    return [];
  }

  /// Get shelter by ID
  Future<Shelter> getShelterDetail(int id) async {
    final response = await _api.getShelterById(id);
    return Shelter.fromJson(response.data);
  }

  /// Get shelter capacity info
  Future<ShelterCapacity> getCapacity(int id) async {
    final response = await _api.getShelterCapacity(id);
    return ShelterCapacity.fromJson(response.data);
  }

  /// Search shelters within bounding box
  Future<List<Shelter>> searchByBoundingBox(BoundingBox bbox) async {
    final queryParams = bbox.toQueryParams();
    final response = await _api.getShelters(params: queryParams);
    final data = response.data['shelters'] ?? response.data;
    if (data is List) {
      return data.map((json) => Shelter.fromJson(json)).toList();
    }
    return [];
  }

  /// Search shelters near a point
  Future<List<Shelter>> searchNearby(double lat, double lng, {double radiusKm = 10}) async {
    // Calculate bounding box for the radius
    final bbox = _calculateBoundingBox(lat, lng, radiusKm);
    return searchByBoundingBox(bbox);
  }

  // Helper: Calculate bounding box from center point and radius
  BoundingBox _calculateBoundingBox(double lat, double lng, double radiusKm) {
    // Approximate degrees per km: 1 degree lat ≈ 111 km, 1 degree lng ≈ 111 * cos(lat) km
    final latDelta = radiusKm / 111;
    final lngDelta = radiusKm / (111 * _cos(lat * 3.14159 / 180));
    return BoundingBox(
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    );
  }

  double _cos(double degrees) {
    // Simple cos approximation
    final radians = degrees * 3.14159 / 180;
    return 1 - (radians * radians / 2) + (radians * radians * radians * radians / 24);
  }
}

/// Shelter Model
class Shelter {
  final int id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final String? regency;
  final String? district;
  final int capacity;
  final int currentOccupancy;
  final String status;
  final String? facilityType;
  final List<String>? facilities;
  final String? contactPerson;
  final String? phone;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Shelter({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.regency,
    this.district,
    required this.capacity,
    required this.currentOccupancy,
    required this.status,
    this.facilityType,
    this.facilities,
    this.contactPerson,
    this.phone,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory Shelter.fromJson(Map<String, dynamic> json) {
    return Shelter(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      latitude: (json['latitude'] ?? json['lat'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? json['lng'] ?? 0).toDouble(),
      regency: json['regency'],
      district: json['district'],
      capacity: json['capacity'] ?? 0,
      currentOccupancy: json['currentOccupancy'] ?? json['current_occupancy'] ?? 0,
      status: json['status'] ?? 'ACTIVE',
      facilityType: json['facilityType'] ?? json['facility_type'],
      facilities: json['facilities'] != null ? List<String>.from(json['facilities']) : null,
      contactPerson: json['contactPerson'] ?? json['contact_person'],
      phone: json['phone'],
      notes: json['notes'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'regency': regency,
        'district': district,
        'capacity': capacity,
        'currentOccupancy': currentOccupancy,
        'status': status,
        'facilityType': facilityType,
        'facilities': facilities,
        'contactPerson': contactPerson,
        'phone': phone,
        'notes': notes,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  int get availableBeds => capacity - currentOccupancy;
  double get occupancyRate => capacity > 0 ? currentOccupancy / capacity : 0;
  bool get isFull => currentOccupancy >= capacity;
}

/// Shelter capacity info
class ShelterCapacity {
  final int capacity;
  final int currentOccupancy;
  final int available;
  final int families;
  final int individuals;

  ShelterCapacity({
    required this.capacity,
    required this.currentOccupancy,
    required this.available,
    required this.families,
    required this.individuals,
  });

  factory ShelterCapacity.fromJson(Map<String, dynamic> json) {
    return ShelterCapacity(
      capacity: json['capacity'] ?? 0,
      currentOccupancy: json['currentOccupancy'] ?? json['current_occupancy'] ?? 0,
      available: json['available'] ?? 0,
      families: json['families'] ?? 0,
      individuals: json['individuals'] ?? 0,
    );
  }
}

/// Filter options for shelter queries
class ShelterFilters {
  final String? status;
  final String? regency;
  final String? facilityType;
  final int? minCapacity;
  final int? limit;
  final int? offset;

  ShelterFilters({
    this.status,
    this.regency,
    this.facilityType,
    this.minCapacity,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (regency != null) params['regency'] = regency;
    if (facilityType != null) params['facilityType'] = facilityType;
    if (minCapacity != null) params['minCapacity'] = minCapacity;
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