import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';
import '../services/api_service.dart';

/// Auth Repository
/// ==============
/// Repository for authentication and user management

class AuthRepository {
  final ApiService _api = ApiService();
  final _storage = const FlutterSecureStorage();

  // ==========================================================
  // Authentication
  // ==========================================================

  /// Login with username and password
  Future<AuthResult> login(String username, String password) async {
    final response = await _api.login(username, password);
    final data = response.data;
    
    // Store tokens securely
    if (data['token'] != null) {
      await _storage.write(key: AppConstants.KEY_AUTH_TOKEN, value: data['token']);
    }
    if (data['refreshToken'] != null) {
      await _storage.write(key: AppConstants.KEY_REFRESH_TOKEN, value: data['refreshToken']);
    }
    
    return AuthResult.fromJson(data);
  }

  /// Register new user
  Future<AuthResult> register(RegisterData data) async {
    final response = await _api.register(data.toJson());
    final result = response.data;
    
    // Store tokens if provided
    if (result['token'] != null) {
      await _storage.write(key: AppConstants.KEY_AUTH_TOKEN, value: result['token']);
    }
    if (result['refreshToken'] != null) {
      await _storage.write(key: AppConstants.KEY_REFRESH_TOKEN, value: result['refreshToken']);
    }
    
    return AuthResult.fromJson(result);
  }

  /// Logout and clear tokens
  Future<void> logout() async {
    await _storage.delete(key: AppConstants.KEY_AUTH_TOKEN);
    await _storage.delete(key: AppConstants.KEY_REFRESH_TOKEN);
  }

  /// Get current authenticated user
  Future<User?> getCurrentUser() async {
    final response = await _api.getCurrentUser();
    final data = response.data['user'] ?? response.data;
    if (data != null) {
      return User.fromJson(data);
    }
    return null;
  }

  /// Update user profile
  Future<User> updateProfile(ProfileUpdate data) async {
    final response = await _api.updateProfile(data.toJson());
    return User.fromJson(response.data);
  }

  // ==========================================================
  // Token Management
  // ==========================================================

  /// Refresh access token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: AppConstants.KEY_REFRESH_TOKEN);
      if (refreshToken == null) return false;

      final response = await _api.refreshTokenInternal(refreshToken);
      final newToken = response.data['token'];
      
      if (newToken != null) {
        await _storage.write(key: AppConstants.KEY_AUTH_TOKEN, value: newToken);
        return true;
      }
      return false;
    } catch (e) {
      // Clear tokens on failure
      await _storage.delete(key: AppConstants.KEY_AUTH_TOKEN);
      await _storage.delete(key: AppConstants.KEY_REFRESH_TOKEN);
      return false;
    }
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: AppConstants.KEY_AUTH_TOKEN);
    return token != null;
  }

  /// Get stored access token
  Future<String?> getAccessToken() async {
    return _storage.read(key: AppConstants.KEY_AUTH_TOKEN);
  }

  // ==========================================================
  // Password Management
  // ==========================================================

  /// Request password reset
  Future<void> forgotPassword(String email) async {
    await _api.forgotPassword(email);
  }

  /// Reset password with token
  Future<void> resetPassword(String token, String newPassword) async {
    await _api.resetPassword(token, newPassword);
  }

  /// Change password (authenticated)
  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _api.changePassword(currentPassword, newPassword);
  }
}

/// Auth result from login/register
class AuthResult {
  final String? token;
  final String? refreshToken;
  final User? user;
  final String? message;

  AuthResult({
    this.token,
    this.refreshToken,
    this.user,
    this.message,
  });

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      token: json['token'],
      refreshToken: json['refreshToken'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      message: json['message'],
    );
  }

  bool get isSuccess => token != null || user != null;
}

/// User model
class User {
  final int id;
  final String username;
  final String email;
  final String? name;
  final String role;
  final String? phone;
  final String? photoUrl;
  final String? regency;
  final String? district;
  final bool isActive;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.name,
    required this.role,
    this.phone,
    this.photoUrl,
    this.regency,
    this.district,
    this.isActive = true,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      name: json['name'],
      role: json['role'] ?? 'PUBLIC',
      phone: json['phone'],
      photoUrl: json['photoUrl'] ?? json['photo_url'],
      regency: json['regency'],
      district: json['district'],
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'email': email,
        'name': name,
        'role': role,
        'phone': phone,
        'photoUrl': photoUrl,
        'regency': regency,
        'district': district,
        'isActive': isActive,
        'createdAt': createdAt?.toIso8601String(),
      };

  String get displayName => name ?? username;
}

/// Data class for registration
class RegisterData {
  final String username;
  final String email;
  final String password;
  final String? name;
  final String? phone;
  final String? role;
  final String? regency;
  final String? district;

  RegisterData({
    required this.username,
    required this.email,
    required this.password,
    this.name,
    this.phone,
    this.role,
    this.regency,
    this.district,
  });

  Map<String, dynamic> toJson() => {
        'username': username,
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'role': role ?? 'PUBLIC',
        'regency': regency,
        'district': district,
      };
}

/// Data class for profile update
class ProfileUpdate {
  final String? name;
  final String? phone;
  final String? photoUrl;
  final String? regency;
  final String? district;

  ProfileUpdate({
    this.name,
    this.phone,
    this.photoUrl,
    this.regency,
    this.district,
  });

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (name != null) json['name'] = name;
    if (phone != null) json['phone'] = phone;
    if (photoUrl != null) json['photoUrl'] = photoUrl;
    if (regency != null) json['regency'] = regency;
    if (district != null) json['district'] = district;
    return json;
  }
}