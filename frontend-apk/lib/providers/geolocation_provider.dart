import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

/// Geolocation Provider
/// ===================
/// GPS location state management with permission handling

// Location State
enum LocationStatus {
  unknown,
  disabled,
  denied,
  deniedForever,
  enabled,
  error,
}

class LocationState {
  final LocationStatus status;
  final Position? position;
  final String? errorMessage;

  const LocationState({
    this.status = LocationStatus.unknown,
    this.position,
    this.errorMessage,
  });

  LocationState copyWith({
    LocationStatus? status,
    Position? position,
    String? errorMessage,
  }) {
    return LocationState(
      status: status ?? this.status,
      position: position ?? this.position,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  bool get isEnabled => status == LocationStatus.enabled;
  bool get hasError => status == LocationStatus.error;
}

// Geolocation Notifier
final geolocationProvider = StateNotifierProvider<GeolocationNotifier, LocationState>((ref) {
  return GeolocationNotifier();
});

class GeolocationNotifier extends StateNotifier<LocationState> {
  GeolocationNotifier() : super(const LocationState()) {
    _init();
  }

  Future<void> _init() async {
    await _loadCachedPosition();
    await checkPermission();
  }

  Future<void> checkPermission() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        state = state.copyWith(status: LocationStatus.disabled);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          state = state.copyWith(status: LocationStatus.denied);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        state = state.copyWith(status: LocationStatus.deniedForever);
        return;
      }

      state = state.copyWith(status: LocationStatus.enabled);
      await getCurrentPosition();
    } catch (e) {
      state = state.copyWith(
        status: LocationStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> getCurrentPosition() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      state = state.copyWith(position: position);
      await _cachePosition(position);
    } catch (e) {
      state = state.copyWith(
        status: LocationStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    );
  }

  Future<void> openSettings() async {
    await Geolocator.openLocationSettings();
  }

  Future<void> openAppSettings() async {
    await Geolocator.openAppSettings();
  }

  Future<void> _cachePosition(Position position) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(AppConstants.KEY_LAST_LAT, position.latitude);
    await prefs.setDouble(AppConstants.KEY_LAST_LNG, position.longitude);
    await prefs.setDouble(AppConstants.KEY_LAST_ALT, position.altitude);
    await prefs.setDouble(AppConstants.KEY_LAST_ACC, position.accuracy);
  }

  Future<void> _loadCachedPosition() async {
    final prefs = await SharedPreferences.getInstance();
    final lat = prefs.getDouble(AppConstants.KEY_LAST_LAT);
    final lng = prefs.getDouble(AppConstants.KEY_LAST_LNG);
    if (lat != null && lng != null) {
      // Create position with required fields
      final position = Position(
        latitude: lat,
        longitude: lng,
        altitude: prefs.getDouble(AppConstants.KEY_LAST_ALT) ?? 0,
        accuracy: prefs.getDouble(AppConstants.KEY_LAST_ACC) ?? 0,
        heading: -1.0,
        speed: -1.0,
        speedAccuracy: -1.0,
        altitudeAccuracy: -1.0,
        headingAccuracy: -1.0,
        timestamp: DateTime.now(),
      );
      state = state.copyWith(position: position);
    }
  }
}

// Distance Calculator
final distanceToProvider = Provider.family<double, ({double lat, double lng})>((ref, target) {
  final locationState = ref.watch(geolocationProvider);
  final position = locationState.position;
  if (position == null) return 0;

  return Geolocator.distanceBetween(
    position.latitude,
    position.longitude,
    target.lat,
    target.lng,
  );
});

// Position Stream Provider
final positionStreamProvider = StreamProvider<Position>((ref) {
  return Geolocator.getPositionStream(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10,
    ),
  );
});