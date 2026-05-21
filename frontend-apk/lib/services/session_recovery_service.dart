import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Session recovery service
/// - Saves form state on each field change (debounced)
/// - Restores state on app resume
/// - Clears state only on successful submission
class SessionRecoveryService {
  static const String _formStateKey = 'form_state';
  static const String _lastActiveKey = 'last_active';
  static const String _sessionIdKey = 'session_id';
  static const String _scrollPositionKey = 'scroll_position';
  static const String _navigationStackKey = 'navigation_stack';

  static Timer? _saveTimer;
  static Map<String, dynamic>? _pendingSave;

  /// Initialize session recovery
  static Future<void> initialize() async {
    // Check if there was an abnormal termination
    final lastActive = await getLastActiveTime();
    if (lastActive != null) {
      final diff = DateTime.now().difference(lastActive);
      // If last active was > 5 minutes ago, consider it abnormal termination
      if (diff.inMinutes > 5) {
        debugPrint('[SessionRecovery] Abnormal termination detected');
      }
    }
    // Update last active time
    await updateLastActiveTime();
  }

  /// Save form state (debounced 500ms)
  static Future<void> saveFormState({
    required String formId,
    required Map<String, dynamic> state,
  }) async {
    _pendingSave = {
      'formId': formId,
      'state': state,
      'timestamp': DateTime.now().toIso8601String(),
    };

    // Debounce save
    _saveTimer?.cancel();
    _saveTimer = Timer(const Duration(milliseconds: 500), () async {
      if (_pendingSave != null) {
        await _saveFormStateInternal(_pendingSave!);
        _pendingSave = null;
      }
    });
  }

  /// Save form state immediately
  static Future<void> _saveFormStateInternal(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_formStateKey, data['formId']);
    await prefs.setString('form_state_${data['formId']}', 
        data['state'].toString());
    await prefs.setString('form_timestamp_${data['formId']}', 
        data['timestamp']);
  }

  /// Get saved form state
  static Future<Map<String, dynamic>?> getFormState(String formId) async {
    final prefs = await SharedPreferences.getInstance();
    final state = prefs.getString('form_state_$formId');
    final timestamp = prefs.getString('form_timestamp_$formId');

    if (state != null && timestamp != null) {
      return {
        'formId': formId,
        'state': state,
        'timestamp': timestamp,
      };
    }
    return null;
  }

  /// Check if there's saved state to restore
  static Future<bool> hasSavedState(String formId) async {
    final state = await getFormState(formId);
    return state != null;
  }

  /// Clear saved form state (on successful submission)
  static Future<void> clearFormState(String formId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('form_state_$formId');
    await prefs.remove('form_timestamp_$formId');
    debugPrint('[SessionRecovery] Cleared form state for $formId');
  }

  /// Save scroll position
  static Future<void> saveScrollPosition(String screenId, double position) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('${_scrollPositionKey}_$screenId', position);
  }

  /// Get scroll position
  static Future<double?> getScrollPosition(String screenId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble('${_scrollPositionKey}_$screenId');
  }

  /// Save navigation stack
  static Future<void> saveNavigationStack(List<String> stack) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_navigationStackKey, stack);
  }

  /// Get navigation stack
  static Future<List<String>> getNavigationStack() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_navigationStackKey) ?? [];
  }

  /// Update last active time
  static Future<void> updateLastActiveTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastActiveKey, DateTime.now().toIso8601String());
  }

  /// Get last active time
  static Future<DateTime?> getLastActiveTime() async {
    final prefs = await SharedPreferences.getInstance();
    final lastActive = prefs.getString(_lastActiveKey);
    if (lastActive != null) {
      return DateTime.tryParse(lastActive);
    }
    return null;
  }

  /// Generate new session ID
  static Future<String> generateSessionId() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionId = DateTime.now().millisecondsSinceEpoch.toString();
    await prefs.setString(_sessionIdKey, sessionId);
    return sessionId;
  }

  /// Get current session ID
  static Future<String?> getSessionId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_sessionIdKey);
  }

  /// Check if session was interrupted
  static Future<bool> wasSessionInterrupted() async {
    final lastActive = await getLastActiveTime();
    if (lastActive == null) return false;
    
    final diff = DateTime.now().difference(lastActive);
    // Consider interrupted if gap > 30 seconds (app was in background)
    // but < 5 minutes (not abnormal termination)
    return diff.inSeconds > 30 && diff.inMinutes < 5;
  }

  /// Clear all session data
  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_formStateKey);
    await prefs.remove(_lastActiveKey);
    await prefs.remove(_sessionIdKey);
    await prefs.remove(_scrollPositionKey);
    await prefs.remove(_navigationStackKey);
    
    // Clear all form states
    final keys = prefs.getKeys().where((k) => k.startsWith('form_state_'));
    for (final key in keys) {
      await prefs.remove(key);
    }
  }
}

/// Form state restore helper - call this from widget code to restore form state
class FormStateRestoreHelper {
  /// Check and restore form state - returns null if no saved state
  static Future<Map<String, dynamic>?> checkAndRestore(String formId) async {
    return SessionRecoveryService.getFormState(formId);
  }

  /// Clear saved form state
  static Future<void> clear(String formId) async {
    await SessionRecoveryService.clearFormState(formId);
  }
}