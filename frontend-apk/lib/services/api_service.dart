import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

/// API Service
/// ==========
/// Dio instance for NURisk API

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.BASE_URL,
      connectTimeout: const Duration(milliseconds: AppConstants.API_TIMEOUT),
      receiveTimeout: const Duration(milliseconds: AppConstants.API_TIMEOUT),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.KEY_AUTH_TOKEN);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Try to refresh token
          try {
            final refreshToken = await _storage.read(key: AppConstants.KEY_REFRESH_TOKEN);
            if (refreshToken != null) {
              final response = await _dio.post('/auth/refresh', data: {'refreshToken': refreshToken});
              await _storage.write(key: AppConstants.KEY_AUTH_TOKEN, value: response.data['token']);
              // Retry original request
              error.requestOptions.headers['Authorization'] = 'Bearer ${response.data['token']}';
              final retry = await _dio.fetch(error.requestOptions);
              return handler.resolve(retry);
            }
          } catch (e) {
            // Clear tokens
            await _storage.delete(key: AppConstants.KEY_AUTH_TOKEN);
            await _storage.delete(key: AppConstants.KEY_REFRESH_TOKEN);
          }
        }
        handler.next(error);
      },
    ));
  }

  // ==========================================================
  // Incidents API
  // ==========================================================

  Future<Response> getIncidents({Map<String, dynamic>? params}) async {
    return _dio.get('/incidents', queryParameters: params);
  }

  Future<Response> getPublicIncidents({Map<String, dynamic>? params}) async {
    return _dio.get('/incidents/public', queryParameters: params);
  }

  Future<Response> getIncidentById(int id) async {
    return _dio.get('/incidents/$id');
  }

  Future<Response> createIncident(Map<String, dynamic> data) async {
    return _dio.post('/incidents', data: data);
  }

  Future<Response> updateIncident(int id, Map<String, dynamic> data) async {
    return _dio.patch('/incidents/$id', data: data);
  }

  Future<Response> updateIncidentStatus(int id, String status) async {
    return _dio.patch('/incidents/$id/status', data: {'status': status});
  }

  Future<Response> submitAssessment(int id, Map<String, dynamic> data) async {
    return _dio.patch('/incidents/$id/assessment', data: data);
  }

  // ==========================================================
  // Auth API
  // ==========================================================

  Future<Response> login(String username, String password) async {
    return _dio.post('/auth/login', data: {'username': username, 'password': password});
  }

  Future<Response> register(Map<String, dynamic> data) async {
    return _dio.post('/auth/register', data: data);
  }

  Future<Response> getCurrentUser() async {
    return _dio.get('/auth/me');
  }

  Future<Response> updateProfile(Map<String, dynamic> data) async {
    return _dio.patch('/auth/profile', data: data);
  }

  // ==========================================================
  // Volunteers API
  // ==========================================================

  Future<Response> getVolunteers({Map<String, dynamic>? params}) async {
    return _dio.get('/volunteers', queryParameters: params);
  }

  Future<Response> getNearbyVolunteers(double lat, double lng, {int radius = 10}) async {
    return _dio.get('/volunteers/nearby', queryParameters: {'lat': lat, 'lng': lng, 'radius': radius});
  }

  Future<Response> getVolunteerById(int id) async {
    return _dio.get('/volunteers/$id');
  }

  Future<Response> updateVolunteer(int id, Map<String, dynamic> data) async {
    return _dio.patch('/volunteers/$id', data: data);
  }

  Future<Response> getVolunteerDeployments(int id, {Map<String, dynamic>? params}) async {
    return _dio.get('/volunteers/$id/deployments', queryParameters: params);
  }

  // ==========================================================
  // Missions API
  // ==========================================================

  Future<Response> getMissions({Map<String, dynamic>? params}) async {
    return _dio.get('/missions', queryParameters: params);
  }

  Future<Response> getMissionById(int id) async {
    return _dio.get('/missions/$id');
  }

  Future<Response> checkInMission(int id, Map<String, dynamic> data) async {
    return _dio.post('/missions/$id/checkin', data: data);
  }

  // ==========================================================
  // Shelters API
  // ==========================================================

  Future<Response> getShelters({Map<String, dynamic>? params}) async {
    return _dio.get('/shelters', queryParameters: params);
  }

  Future<Response> getShelterById(int id) async {
    return _dio.get('/shelters/$id');
  }

  Future<Response> getShelterCapacity(int id) async {
    return _dio.get('/shelters/$id/capacity');
  }

  // ==========================================================
  // Warehouses API
  // ==========================================================

  Future<Response> getWarehouses({Map<String, dynamic>? params}) async {
    return _dio.get('/warehouses', queryParameters: params);
  }

  Future<Response> getWarehouseById(int id) async {
    return _dio.get('/warehouses/$id');
  }

  Future<Response> getWarehouseInventory(int id, {Map<String, dynamic>? params}) async {
    return _dio.get('/warehouses/$id/inventory', queryParameters: params);
  }

  // ==========================================================
  // Chat/Messages API
  // ==========================================================

  Future<Response> getConversations({Map<String, dynamic>? params}) async {
    return _dio.get('/conversations', queryParameters: params);
  }

  Future<Response> getMessages(String conversationId, {Map<String, dynamic>? params}) async {
    return _dio.get('/conversations/$conversationId/messages', queryParameters: params);
  }

  Future<Response> sendMessage(String conversationId, Map<String, dynamic> data) async {
    return _dio.post('/conversations/$conversationId/messages', data: data);
  }

  // ==========================================================
  // Auth API (additional)
  // ==========================================================

  Future<Response> forgotPassword(String email) async {
    return _dio.post('/auth/forgot-password', data: {'email': email});
  }

  Future<Response> resetPassword(String token, String newPassword) async {
    return _dio.post('/auth/reset-password', data: {'token': token, 'newPassword': newPassword});
  }

  Future<Response> changePassword(String currentPassword, String newPassword) async {
    return _dio.patch('/auth/password', data: {'currentPassword': currentPassword, 'newPassword': newPassword});
  }

  // ==========================================================
  // Analytics API
  // ==========================================================

  Future<Response> getAnalyticsSummary() async {
    return _dio.get('/analytics/summary');
  }

  Future<Response> getAnalyticsTrends({Map<String, dynamic>? params}) async {
    return _dio.get('/analytics/trends', queryParameters: params);
  }

  Future<Response> getForecast({int days = 7, String? model}) async {
    return _dio.get('/analytics/forecast/incidents', queryParameters: {'days': days, 'model': model});
  }

  // ==========================================================
  // Notifications API
  // ==========================================================

  Future<Response> getNotifications({Map<String, dynamic>? params}) async {
    return _dio.get('/notifications', queryParameters: params);
  }

  Future<Response> markNotificationRead(int id) async {
    return _dio.patch('/notifications/$id/read');
  }

  // ==========================================================
  // Historical Data API
  // ==========================================================

  Future<Response> getHistoricalMapData({Map<String, dynamic>? params}) async {
    return _dio.get('/historical-data/map', queryParameters: params);
  }

  Future<Response> getHistoricalData({Map<String, dynamic>? params}) async {
    return _dio.get('/historical-data', queryParameters: params);
  }

  // ==========================================================
  // Device Registration API
  // ==========================================================

  Future<Response> registerDeviceToken(Map<String, dynamic> data) async {
    return _dio.post('/devices/register', data: data);
  }

  // ==========================================================
  // Asset API
  // ==========================================================

  Future<Map<String, dynamic>? getAsset(String assetId) async {
    try {
      final response = await _dio.get('/assets/$assetId');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }

  Future<Response> unregisterDeviceToken(String deviceId) async {
    return _dio.delete('/devices/$deviceId');
  }

  // ==========================================================
  // Internal Methods
  // ==========================================================

  /// Internal: Refresh token (used by interceptors and repos)
  Future<Response> refreshTokenInternal(String refreshToken) async {
    return _dio.post('/auth/refresh', data: {'refreshToken': refreshToken});
  }

  /// Getter for dio instance (for custom requests)
  Dio get dio => _dio;

  // ==========================================================
  // Generic HTTP Methods
  // ==========================================================

  /// Generic POST request
  Future<Response> post(String path, Map<String, dynamic> data) async {
    return _dio.post(path, data: data);
  }

  /// Generic GET request
  Future<Response> get(String path, {Map<String, dynamic>? params}) async {
    return _dio.get(path, queryParameters: params);
  }

  /// Generic PUT request
  Future<Response> put(String path, Map<String, dynamic> data) async {
    return _dio.put(path, data: data);
  }

  /// Generic PATCH request
  Future<Response> patch(String path, Map<String, dynamic> data) async {
    return _dio.patch(path, data: data);
  }

  /// Generic DELETE request
  Future<Response> delete(String path) async {
    return _dio.delete(path);
  }
}