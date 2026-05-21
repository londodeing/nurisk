import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/api_service.dart';

/// Mission Repository
/// ================
/// Repository for mission-related API operations

class MissionRepository {
  final ApiService _api = ApiService();
  final _connectivity = Connectivity();
  
  // Simple cache for offline data
  List<Mission>? _cachedMissions;
  DateTime? _cacheTime;
  static const _cacheDuration = Duration(minutes: 5);

  // ==========================================================
  // Mission Operations
  // ==========================================================

  /// Get all missions with optional filters
  /// Returns cached data when offline
  Future<List<Mission>> getMissions({MissionFilters? filters}) async {
    final isOnline = await _isOnline();
    
    if (!isOnline && _cachedMissions != null && _cacheTime != null) {
      if (DateTime.now().difference(_cacheTime!) < _cacheDuration) {
        return _cachedMissions!;
      }
    }
    
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getMissions(params: queryParams);
    final data = response.data['missions'] ?? response.data;
    
    if (data is List) {
      final missions = data.map((json) => Mission.fromJson(json)).toList();
      // Cache for offline use
      if (isOnline) {
        _cachedMissions = missions;
        _cacheTime = DateTime.now();
      }
      return missions;
    }
    return [];
  }

  /// Get mission by ID
  Future<Mission> getMissionDetail(int id) async {
    final response = await _api.getMissionById(id);
    return Mission.fromJson(response.data);
  }

  /// Check in to a mission
  Future<CheckInResult> checkIn(int missionId, CheckInData data) async {
    final response = await _api.checkInMission(missionId, data.toJson());
    return CheckInResult.fromJson(response.data);
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
    _cachedMissions = null;
    _cacheTime = null;
  }
}

/// Mission Model
class Mission {
  final int id;
  final String title;
  final String description;
  final int? incidentId;
  final String? incidentTitle;
  final String status;
  final String priority;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? regency;
  final DateTime? startTime;
  final DateTime? endTime;
  final int? requiredVolunteers;
  final int? assignedVolunteers;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Mission({
    required this.id,
    required this.title,
    required this.description,
    this.incidentId,
    this.incidentTitle,
    required this.status,
    required this.priority,
    this.latitude,
    this.longitude,
    this.address,
    this.regency,
    this.startTime,
    this.endTime,
    this.requiredVolunteers,
    this.assignedVolunteers,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory Mission.fromJson(Map<String, dynamic> json) {
    return Mission(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      incidentId: json['incidentId'] ?? json['incident_id'],
      incidentTitle: json['incidentTitle'] ?? json['incident_title'],
      status: json['status'] ?? 'PENDING',
      priority: json['priority'] ?? 'MEDIUM',
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      address: json['address'],
      regency: json['regency'],
      startTime: json['startTime'] != null ? DateTime.tryParse(json['startTime']) : null,
      endTime: json['endTime'] != null ? DateTime.tryParse(json['endTime']) : null,
      requiredVolunteers: json['requiredVolunteers'] ?? json['required_volunteers'],
      assignedVolunteers: json['assignedVolunteers'] ?? json['assigned_volunteers'],
      notes: json['notes'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'incidentId': incidentId,
        'incidentTitle': incidentTitle,
        'status': status,
        'priority': priority,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'regency': regency,
        'startTime': startTime?.toIso8601String(),
        'endTime': endTime?.toIso8601String(),
        'requiredVolunteers': requiredVolunteers,
        'assignedVolunteers': assignedVolunteers,
        'notes': notes,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  bool get isActive => status == 'ACTIVE' || status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED' || status == 'CANCELLED';
}

/// Filter options for mission queries
class MissionFilters {
  final String? status;
  final String? priority;
  final String? regency;
  final DateTime? fromDate;
  final DateTime? toDate;
  final int? limit;
  final int? offset;

  MissionFilters({
    this.status,
    this.priority,
    this.regency,
    this.fromDate,
    this.toDate,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (priority != null) params['priority'] = priority;
    if (regency != null) params['regency'] = regency;
    if (fromDate != null) params['fromDate'] = fromDate!.toIso8601String().split('T')[0];
    if (toDate != null) params['toDate'] = toDate!.toIso8601String().split('T')[0];
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}

/// Data class for check-in
class CheckInData {
  final double? latitude;
  final double? longitude;
  final String? notes;
  final List<String>? photos;

  CheckInData({
    this.latitude,
    this.longitude,
    this.notes,
    this.photos,
  });

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (latitude != null) json['latitude'] = latitude;
    if (longitude != null) json['longitude'] = longitude;
    if (notes != null) json['notes'] = notes;
    if (photos != null) json['photos'] = photos;
    return json;
  }
}

/// Check-in result
class CheckInResult {
  final bool success;
  final String? message;
  final DateTime? checkInTime;

  CheckInResult({
    required this.success,
    this.message,
    this.checkInTime,
  });

  factory CheckInResult.fromJson(Map<String, dynamic> json) {
    return CheckInResult(
      success: json['success'] ?? false,
      message: json['message'],
      checkInTime: json['checkInTime'] != null ? DateTime.tryParse(json['checkInTime']) : null,
    );
  }
}