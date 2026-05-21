import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/auth_repository.dart';

/// Auth Provider
/// ==============
/// Authentication state management with repository integration

// ==========================================================
// Repository Provider
// ==========================================================

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

// ==========================================================
// Auth State
// ==========================================================

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(const AsyncValue.loading()) {
    _init();
  }

  /// Initialize - check for existing token and auto-login
  Future<void> _init() async {
    try {
      final isAuthenticated = await _repository.isAuthenticated();
      if (isAuthenticated) {
        final user = await _repository.getCurrentUser();
        if (user != null) {
          state = AsyncValue.data(user);
        } else {
          // Token exists but user fetch failed - try refresh
          final refreshed = await _repository.refreshToken();
          if (refreshed) {
            final user = await _repository.getCurrentUser();
            state = AsyncValue.data(user);
          } else {
            // Token invalid, clear and logout
            await _repository.logout();
            state = const AsyncValue.data(null);
          }
        }
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      // Clear tokens on any error
      await _repository.logout();
      state = const AsyncValue.data(null);
    }
  }

  /// Login with username and password
  Future<void> login(String username, String password) async {
    state = const AsyncValue.loading();
    try {
      final result = await _repository.login(username, password);
      if (result.isSuccess && result.user != null) {
        state = AsyncValue.data(result.user);
      } else {
        final error = Exception(result.message ?? 'Login failed');
        state = AsyncValue.error(error, StackTrace.current);
        throw error;
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  /// Register new user
  Future<void> register(RegisterData data) async {
    state = const AsyncValue.loading();
    try {
      final result = await _repository.register(data);
      if (result.isSuccess && result.user != null) {
        state = AsyncValue.data(result.user);
      } else {
        final error = Exception(result.message ?? 'Registration failed');
        state = AsyncValue.error(error, StackTrace.current);
        throw error;
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  /// Logout and clear tokens
  Future<void> logout() async {
    await _repository.logout();
    state = const AsyncValue.data(null);
  }

  /// Handle token expiry - logout and trigger navigation
  Future<void> handleTokenExpiry() async {
    await _repository.logout();
    state = const AsyncValue.data(null);
    // Navigation should be handled by UI listening to auth state
  }

  /// Update user profile
  Future<void> updateProfile(ProfileUpdate data) async {
    try {
      final user = await _repository.updateProfile(data);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  /// Request password reset
  Future<void> forgotPassword(String email) async {
    await _repository.forgotPassword(email);
  }

  /// Check if user is authenticated
  bool get isAuthenticated => state.valueOrNull != null;

  /// Get current user
  User? get currentUser => state.valueOrNull;
}

// ==========================================================
// Permission Helpers
// ==========================================================

final hasPermissionProvider = Provider.family<bool, String>((ref, permission) {
  final authState = ref.watch(authProvider);
  final user = authState.valueOrNull;
  if (user == null) return false;
  if (user.role == 'SUPER_ADMIN') return true;

  final permissions = {
    'ADMIN_PWNU': ['incidents', 'volunteers', 'analytics', 'broadcast'],
    'PWNU': ['incidents', 'volunteers', 'analytics', 'broadcast'],
    'STAFF_PWNU': ['incidents', 'volunteers', 'analytics'],
    'COMMANDER': ['incidents', 'volunteers'],
    'ADMIN_PCNU': ['incidents', 'volunteers'],
    'STAFF_PCNU': ['incidents'],
    'FIELD_STAFF': ['incidents', 'assessments'],
    'RELAWAN': ['incidents'],
    'PUBLIC': ['public'],
  };

  return (permissions[user.role] ?? []).contains(permission);
});

final isAdminProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  final user = authState.valueOrNull;
  if (user == null) return false;
  return ['ADMIN_PWNU', 'PWNU', 'STAFF_PWNU', 'COMMANDER', 'ADMIN_PCNU'].contains(user.role);
});

final isVolunteerProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  final user = authState.valueOrNull;
  if (user == null) return false;
  return ['FIELD_STAFF', 'RELAWAN'].contains(user.role);
});

// ==========================================================
// Token Provider (for manual checks)
// ==========================================================

final authTokenProvider = FutureProvider<String?>((ref) async {
  final repository = ref.watch(authRepositoryProvider);
  return repository.getAccessToken();
});