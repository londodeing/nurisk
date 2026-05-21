import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/api_service.dart';

/// Volunteer Repository
/// ==================
/// Repository for volunteer-related API operations

class VolunteerRepository {
  final ApiService _api = ApiService();
  final _connectivity = Connectivity();
  
  // Simple cache for offline data
  List<Volunteer>? _cachedVolunteers;
  DateTime? _cacheTime;
  static const _cacheDuration = Duration(minutes: 5);

  // ==========================================================
  // Volunteer Operations
  // ==========================================================

  /// Get all volunteers with optional filters
  /// Returns cached data when offline
  Future<List<Volunteer>> getVolunteers({VolunteerFilters? filters}) async {
    final isOnline = await _isOnline();
    
    if (!isOnline && _cachedVolunteers != null && _cacheTime != null) {
      if (DateTime.now().difference(_cacheTime!) < _cacheDuration) {
        return _cachedVolunteers!;
      }
    }
    
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getVolunteers(params: queryParams);
    final data = response.data['volunteers'] ?? response.data;
    
    if (data is List) {
      final volunteers = data.map((json) => Volunteer.fromJson(json)).toList();
      // Cache for offline use
      if (isOnline) {
        _cachedVolunteers = volunteers;
        _cacheTime = DateTime.now();
      }
      return volunteers;
    }
    return [];
  }

  /// Get volunteer by ID
  Future<Volunteer> getVolunteerById(int id) async {
    final response = await _api.getVolunteerById(id);
    return Volunteer.fromJson(response.data);
  }

  /// Get volunteers near a location
  Future<List<Volunteer>> getNearbyVolunteers(double lat, double lng, {int radius = 10}) async {
    final response = await _api.getNearbyVolunteers(lat, lng, radius: radius);
    final data = response.data['volunteers'] ?? response.data;
    if (data is List) {
      return data.map((json) => Volunteer.fromJson(json)).toList();
    }
    return [];
  }

  /// Update volunteer profile
  Future<Volunteer> updateProfile(int id, VolunteerUpdate data) async {
    final response = await _api.updateVolunteer(id, data.toJson());
    return Volunteer.fromJson(response.data);
  }

  /// Get volunteer deployments
  Future<List<Deployment>> getDeployments(int volunteerId, {DeploymentFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getVolunteerDeployments(volunteerId, params: queryParams);
    final data = response.data['deployments'] ?? response.data;
    if (data is List) {
      return data.map((json) => Deployment.fromJson(json)).toList();
    }
    return [];
  }

  // ==========================================================
  // Connectivity Check
  // ==========================================================

  Future<bool> _isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  /// Check if currently online
  Future<bool> isOnline() => _isOnline();

  /// Clear cached data
  void clearCache() {
    _cachedVolunteers = null;
    _cacheTime = null;
  }
}

/// Volunteer Model
class Volunteer {
  final int id;
  final String username;
  final String? name;
  final String email;
  final String? phone;
  final String role;
  final String? photoUrl;
  final double? latitude;
  final double? longitude;
  final String? regency;
  final String? district;
  final bool isAvailable;
  final int? totalDeployments;
  final DateTime? lastActive;
  final DateTime? createdAt;

  Volunteer({
    required this.id,
    required this.username,
    this.name,
    required this.email,
    this.phone,
    required this.role,
    this.photoUrl,
    this.latitude,
    this.longitude,
    this.regency,
    this.district,
    this.isAvailable = true,
    this.totalDeployments,
    this.lastActive,
    this.createdAt,
  });

  factory Volunteer.fromJson(Map<String, dynamic> json) {
    return Volunteer(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      name: json['name'],
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'RELAWAN',
      photoUrl: json['photoUrl'] ?? json['photo_url'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      regency: json['regency'],
      district: json['district'],
      isAvailable: json['isAvailable'] ?? json['is_available'] ?? true,
      totalDeployments: json['totalDeployments'] ?? json['total_deployments'],
      lastActive: json['lastActive'] != null ? DateTime.tryParse(json['lastActive']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'photoUrl': photoUrl,
        'latitude': latitude,
        'longitude': longitude,
        'regency': regency,
        'district': district,
        'isAvailable': isAvailable,
        'totalDeployments': totalDeployments,
        'lastActive': lastActive?.toIso8601String(),
        'createdAt': createdAt?.toIso8601String(),
      };

  String get displayName => name ?? username;
}

/// Filter options for volunteer queries
class VolunteerFilters {
  final String? role;
  final String? regency;
  final bool? isAvailable;
  final int? limit;
  final int? offset;

  VolunteerFilters({
    this.role,
    this.regency,
    this.isAvailable,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (role != null) params['role'] = role;
    if (regency != null) params['regency'] = regency;
    if (isAvailable != null) params['isAvailable'] = isAvailable;
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}

/// Data class for updating volunteer
class VolunteerUpdate {
  final String? name;
  final String? phone;
  final String? photoUrl;
  final double? latitude;
  final double? longitude;
  final String? regency;
  final String? district;
  final bool? isAvailable;

  VolunteerUpdate({
    this.name,
    this.phone,
    this.photoUrl,
    this.latitude,
    this.longitude,
    this.regency,
    this.district,
    this.isAvailable,
  });

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (name != null) json['name'] = name;
    if (phone != null) json['phone'] = phone;
    if (photoUrl != null) json['photoUrl'] = photoUrl;
    if (latitude != null) json['latitude'] = latitude;
    if (longitude != null) json['longitude'] = longitude;
    if (regency != null) json['regency'] = regency;
    if (district != null) json['district'] = district;
    if (isAvailable != null) json['isAvailable'] = isAvailable;
    return json;
  }
}

/// Deployment Model
class Deployment {
  final int id;
  final int volunteerId;
  final int? incidentId;
  final String? incidentTitle;
  final String status;
  final String role;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final String? notes;
  final DateTime? createdAt;

  Deployment({
    required this.id,
    required this.volunteerId,
    this.incidentId,
    this.incidentTitle,
    required this.status,
    required this.role,
    this.checkInTime,
    this.checkOutTime,
    this.notes,
    this.createdAt,
  });

  factory Deployment.fromJson(Map<String, dynamic> json) {
    return Deployment(
      id: json['id'] ?? 0,
      volunteerId: json['volunteerId'] ?? json['volunteer_id'] ?? 0,
      incidentId: json['incidentId'] ?? json['incident_id'],
      incidentTitle: json['incidentTitle'] ?? json['incident_title'],
      status: json['status'] ?? 'PENDING',
      role: json['role'] ?? 'RELAWAN',
      checkInTime: json['checkInTime'] != null ? DateTime.tryParse(json['checkInTime']) : null,
      checkOutTime: json['checkOutTime'] != null ? DateTime.tryParse(json['checkOutTime']) : null,
      notes: json['notes'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'volunteerId': volunteerId,
        'incidentId': incidentId,
        'incidentTitle': incidentTitle,
        'status': status,
        'role': role,
        'checkInTime': checkInTime?.toIso8601String(),
        'checkOutTime': checkOutTime?.toIso8601String(),
        'notes': notes,
        'createdAt': createdAt?.toIso8601String(),
      };
}

/// Filter options for deployment queries
class DeploymentFilters {
  final String? status;
  final DateTime? fromDate;
  final DateTime? toDate;
  final int? limit;
  final int? offset;

  DeploymentFilters({
    this.status,
    this.fromDate,
    this.toDate,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (fromDate != null) params['fromDate'] = fromDate!.toIso8601String().split('T')[0];
    if (toDate != null) params['toDate'] = toDate!.toIso8601String().split('T')[0];
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}