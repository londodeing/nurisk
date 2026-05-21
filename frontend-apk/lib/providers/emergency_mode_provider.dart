import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Emergency mode activation source
enum EmergencyTriggerSource {
  lockScreen,
  notification,
  manual,
  automatic,
}

/// Emergency mode state
class EmergencyModeState {
  final bool isActive;
  final DateTime? activatedAt;
  final EmergencyTriggerSource? triggerSource;

  const EmergencyModeState({
    this.isActive = false,
    this.activatedAt,
    this.triggerSource,
  });

  EmergencyModeState copyWith({
    bool? isActive,
    DateTime? activatedAt,
    EmergencyTriggerSource? triggerSource,
  }) {
    return EmergencyModeState(
      isActive: isActive ?? this.isActive,
      activatedAt: activatedAt ?? this.activatedAt,
      triggerSource: triggerSource ?? this.triggerSource,
    );
  }
}

/// Emergency mode context
class EmergencyModeProvider extends ChangeNotifier {
  static const String _storageKey = 'emergency_mode_active';
  static const String _activatedAtKey = 'emergency_mode_activated_at';
  static const String _triggerSourceKey = 'emergency_mode_trigger_source';

  EmergencyModeState _state = const EmergencyModeState();
  bool _isLoading = true;

  EmergencyModeState get state => _state;
  bool get isActive => _state.isActive;
  bool get isLoading => _isLoading;

  EmergencyModeProvider() {
    _loadState();
  }

  /// Load persisted state
  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isActive = prefs.getBool(_storageKey) ?? false;
      final activatedAtMs = prefs.getInt(_activatedAtKey);
      final triggerSourceStr = prefs.getString(_triggerSourceKey);

      DateTime? activatedAt;
      if (activatedAtMs != null) {
        activatedAt = DateTime.fromMillisecondsSinceEpoch(activatedAtMs);
      }

      EmergencyTriggerSource? triggerSource;
      if (triggerSourceStr != null) {
        triggerSource = EmergencyTriggerSource.values.firstWhere(
          (e) => e.name == triggerSourceStr,
          orElse: () => EmergencyTriggerSource.manual,
        );
      }

      _state = EmergencyModeState(
        isActive: isActive,
        activatedAt: activatedAt,
        triggerSource: triggerSource,
      );
    } catch (e) {
      debugPrint('[EMERGENCY_MODE] Load error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Persist state
  Future<void> _saveState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_storageKey, _state.isActive);

      if (_state.activatedAt != null) {
        await prefs.setInt(
          _activatedAtKey,
          _state.activatedAt!.millisecondsSinceEpoch,
        );
      } else {
        await prefs.remove(_activatedAtKey);
      }

      if (_state.triggerSource != null) {
        await prefs.setString(_triggerSourceKey, _state.triggerSource!.name);
      } else {
        await prefs.remove(_triggerSourceKey);
      }
    } catch (e) {
      debugPrint('[EMERGENCY_MODE] Save error: $e');
    }
  }

  /// Activate emergency mode
  Future<void> activate({
    EmergencyTriggerSource source = EmergencyTriggerSource.manual,
  }) async {
    // Play haptic feedback
    await HapticFeedback.heavyImpact();

    _state = EmergencyModeState(
      isActive: true,
      activatedAt: DateTime.now(),
      triggerSource: source,
    );

    await _saveState();
    notifyListeners();

    debugPrint('[EMERGENCY_MODE] Activated from $source');
  }

  /// Deactivate emergency mode
  Future<void> deactivate() async {
    // Play light haptic
    await HapticFeedback.lightImpact();

    _state = const EmergencyModeState();
    await _saveState();
    notifyListeners();

    debugPrint('[EMERGENCY_MODE] Deactivated');
  }

  /// Toggle emergency mode
  Future<void> toggle({
    EmergencyTriggerSource source = EmergencyTriggerSource.manual,
  }) async {
    if (_state.isActive) {
      await deactivate();
    } else {
      await activate(source: source);
    }
  }
}