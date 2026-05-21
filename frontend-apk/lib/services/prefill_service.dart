import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';

/// Pre-fill service for minimal interaction flow
/// - Pre-fills location, identity, disaster type
/// - Remembers user preferences
class PreFillService {
  static const String _lastLocationKey = 'last_location';
  static const String _lastDisasterTypeKey = 'last_disaster_type';
  static const String _lastSeverityKey = 'last_severity';
  static const String _reportCountKey = 'report_count';
  static const String _lastRegionKey = 'last_region';

  /// Get pre-filled location
  static Future<PreFillLocation?> getLocation() async {
    try {
      // Try to get current location
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        await Geolocator.requestPermission();
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );

      return PreFillLocation(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: position.timestamp,
      );
    } catch (e) {
      // Fallback to last known location
      return _getLastLocation();
    }
  }

  /// Get last known location from storage
  static Future<PreFillLocation?> _getLastLocation() async {
    final prefs = await SharedPreferences.getInstance();
    final lat = prefs.getDouble('${_lastLocationKey}_lat');
    final lng = prefs.getDouble('${_lastLocationKey}_lng');

    if (lat != null && lng != null) {
      return PreFillLocation(latitude: lat, longitude: lng);
    }
    return null;
  }

  /// Save location to storage
  static Future<void> saveLocation(PreFillLocation location) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('${_lastLocationKey}_lat', location.latitude);
    await prefs.setDouble('${_lastLocationKey}_lng', location.longitude);
  }

  /// Get pre-filled user identity
  static Future<PreFillIdentity?> getIdentity() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    final userName = prefs.getString('user_name');

    if (userId != null) {
      return PreFillIdentity(
        id: userId,
        name: userName ?? 'Anonymous',
      );
    }
    return null;
  }

  /// Get pre-filled disaster type based on regional alerts
  static Future<String?> getDisasterType() async {
    // Check for active regional alerts
    // For now, return last used type
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastDisasterTypeKey);
  }

  /// Save disaster type preference
  static Future<void> saveDisasterType(String type) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastDisasterTypeKey, type);
  }

  /// Get default severity (last used)
  static Future<String?> getDefaultSeverity() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastSeverityKey);
  }

  /// Save severity preference
  static Future<void> saveSeverity(String severity) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastSeverityKey, severity);
  }

  /// Get description template based on disaster type
  static String getDescriptionTemplate(String disasterType) {
    final templates = {
      'BANJIR': 'Air mulai masuk ke rumah pada jam {{time}}. Tinggi air sekitar {{height}} cm.',
      'GEMPA': 'Getaran terasa kuat sekitar jam {{time}}. Durasi sekitar {{duration}} detik.',
      'LONTSAR': 'Tanah bergerak/Longsor terjadi di {{location}}. Jalan tertutup.',
      'TSUNAMI': 'Air laut surut tiba-tiba. Potensi tsunami.',
      'KEBAKARAN': 'Api terlihat di {{location}}. Asap tebal.',
      'LAINNYA': '{{description}}',
    };
    return templates[disasterType] ?? templates['LAINNYA']!;
  }

  /// Get report count for auto-increment
  static Future<int> getReportCount() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_reportCountKey) ?? 0;
  }

  /// Increment report count
  static Future<int> incrementReportCount() async {
    final prefs = await SharedPreferences.getInstance();
    final count = (prefs.getInt(_reportCountKey) ?? 0) + 1;
    await prefs.setInt(_reportCountKey, count);
    return count;
  }

  /// Get last region
  static Future<String?> getLastRegion() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastRegionKey);
  }

  /// Save last region
  static Future<void> saveLastRegion(String region) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastRegionKey, region);
  }
}

/// Pre-filled location data
class PreFillLocation {
  final double latitude;
  final double longitude;
  final double? accuracy;
  final DateTime? timestamp;

  PreFillLocation({
    required this.latitude,
    required this.longitude,
    this.accuracy,
    this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'timestamp': timestamp?.toIso8601String(),
      };
}

/// Pre-filled identity data
class PreFillIdentity {
  final String id;
  final String name;

  PreFillIdentity({
    required this.id,
    required this.name,
  });
}