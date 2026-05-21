import '../services/api_service.dart';

/// Notification Repository
/// ======================
/// Repository for notification-related API operations

class NotificationRepository {
  final ApiService _api = ApiService();

  // ==========================================================
  // Notification Operations
  // ==========================================================

  /// Get all notifications with optional filters
  Future<List<AppNotification>> getNotifications({NotificationFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getNotifications(params: queryParams);
    final data = response.data['notifications'] ?? response.data;
    if (data is List) {
      return data.map((json) => AppNotification.fromJson(json)).toList();
    }
    return [];
  }

  /// Mark a notification as read
  Future<void> markRead(int id) async {
    await _api.markNotificationRead(id);
  }

  /// Mark all notifications as read
  Future<void> markAllRead() async {
    await _api.markNotificationRead(0); // Use 0 as special marker for "all"
  }

  /// Register device for push notifications
  Future<void> registerDevice(DeviceRegistration data) async {
    await _api.registerDeviceToken(data.toJson());
  }

  /// Unregister device from push notifications
  Future<void> unregisterDevice(String deviceId) async {
    await _api.unregisterDeviceToken(deviceId);
  }
}

/// Notification Model
class AppNotification {
  final int id;
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.data,
    this.isRead = false,
    required this.createdAt,
    this.readAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'] ?? 'info',
      data: json['data'],
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ?? DateTime.now(),
      readAt: json['readAt'] != null ? DateTime.tryParse(json['readAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'type': type,
        'data': data,
        'isRead': isRead,
        'createdAt': createdAt.toIso8601String(),
        'readAt': readAt?.toIso8601String(),
      };
}

/// Filter options for notification queries
class NotificationFilters {
  final String? type;
  final bool? isRead;
  final DateTime? fromDate;
  final DateTime? toDate;
  final int? limit;
  final int? offset;

  NotificationFilters({
    this.type,
    this.isRead,
    this.fromDate,
    this.toDate,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (type != null) params['type'] = type;
    if (isRead != null) params['isRead'] = isRead;
    if (fromDate != null) params['fromDate'] = fromDate!.toIso8601String().split('T')[0];
    if (toDate != null) params['toDate'] = toDate!.toIso8601String().split('T')[0];
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}

/// Device registration data
class DeviceRegistration {
  final String deviceId;
  final String deviceType; // 'android', 'ios'
  final String pushToken;
  final List<String>? tags;

  DeviceRegistration({
    required this.deviceId,
    required this.deviceType,
    required this.pushToken,
    this.tags,
  });

  Map<String, dynamic> toJson() => {
        'deviceId': deviceId,
        'deviceType': deviceType,
        'pushToken': pushToken,
        'tags': tags,
      };
}