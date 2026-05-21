import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Offline map service using flutter_map
/// - Configures OSM tile layer
/// - Handles offline tile caching
/// - Supports incident markers
class OfflineMapService {
  static final MapController _mapController = MapController();
  static const String _lastRegionKey = 'last_map_region';
  static const String _cachedTilesKey = 'cached_tiles';

  // Central Java (Jawa Tengah) center
  static const LatLng _indonesiaCenter = LatLng(-7.0, 110.0);
  static const double _defaultZoom = 5.0;

  // Tile URL template
  static const String _tileUrlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const String _attribution = '© OpenStreetMap contributors';

  /// Get map controller
  static MapController get mapController => _mapController;

  /// Get default center
  static LatLng get defaultCenter => _indonesiaCenter;

  /// Get default zoom
  static double get defaultZoom => _defaultZoom;

  /// Create OSM tile layer
  static TileLayer createOSMTileLayer() {
    return TileLayer(
      urlTemplate: _tileUrlTemplate,
      userAgentPackageName: 'com.nurisk.app',
      maxZoom: 18,
      minZoom: 4,
      attribution: _attribution,
      tileProvider: CachingTileProvider(),
    );
  }

  /// Create tile layer with offline support
  static TileLayer createOfflineTileLayer() {
    return TileLayer(
      urlTemplate: _tileUrlTemplate,
      userAgentPackageName: 'com.nurisk.app',
      maxZoom: 18,
      minZoom: 4,
      attribution: _attribution,
      tileProvider: CachingTileProvider(),
    );
  }

  /// Save last map region
  static Future<void> saveLastRegion(LatLng center, double zoom) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastRegionKey, jsonEncode({
      'lat': center.latitude,
      'lng': center.longitude,
      'zoom': zoom,
    }));
  }

  /// Load last map region
  static Future<Map<String, dynamic>?> loadLastRegion() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_lastRegionKey);
    if (data != null) {
      return jsonDecode(data) as Map<String, dynamic>;
    }
    return null;
  }

  /// Move to location
  static Future<void> moveTo(LatLng center, double zoom) async {
    _mapController.move(center, zoom);
    await saveLastRegion(center, zoom);
  }

  /// Get current center
  static LatLng? get currentCenter => _mapController.camera.center;

  /// Get current zoom
  static double get currentZoom => _mapController.camera.zoom;
}

/// Caching tile provider for offline support
class CachingTileProvider extends TileProvider {
  @override
  Future<Tile> getTile(Coords coords) async {
    // Try cache first, then network
    final cached = await _getCachedTile(coords);
    if (cached != null) {
      return cached;
    }
    // Return network tile (default behavior)
    return Tile(coords: coords, image: await _fetchTile(coords));
  }

  /// Get cached tile
  static Future<List<int>?> _getCachedTile(Coords coords) async {
    final file = await _getTileFile(coords);
    if (await file.exists()) {
      return await file.readAsBytes();
    }
    return null;
  }

  /// Fetch tile from network
  static Future<List<int>> _fetchTile(Coords coords) async {
    final url = OfflineMapService._tileUrlTemplate
        .replaceAll('{z}', coords.z.toString())
        .replaceAll('{x}', coords.x.toString())
        .replaceAll('{y}', coords.y.toString());

    final response = await HttpClient().getUrl(Uri.parse(url));
    final bytes = await response.close().then((s) => s.expand((b) => [b]).toList());

    // Cache the tile
    await _cacheTile(coords, bytes);

    return bytes;
  }

  /// Cache tile
  static Future<void> _cacheTile(Coords coords, List<int> bytes) async {
    final file = await _getTileFile(coords);
    await file.writeAsBytes(bytes);
  }

  /// Get tile file path
  static Future<File> _getTileFile(Coords coords) async {
    final dir = await _getTileCacheDir();
    return File('${dir.path}/${coords.z}/${coords.x}/${coords.y}.png');
  }

  /// Get tile cache directory
  static Future<Directory> _getTileCacheDir() async {
    final appDir = await getApplicationDocumentsDirectory();
    final dir = Directory('${appDir.path}/tiles');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }
}

/// Pre-download tiles for region
class TileDownloader {
  static const List<int> _zoomLevels = [5, 6, 7, 8, 9, 10];
  static const int _tilesPerZoom = 100;

  /// Download tiles for region
  static Future<void> downloadRegion({
    required LatLng center,
    required double radiusKm,
    Function(int downloaded, int total)? onProgress,
  }) async {
    var total = 0;
    var downloaded = 0;

    // Calculate tiles needed
    for (final zoom in _zoomLevels) {
      final tiles = _calculateTilesForRegion(center, radiusKm, zoom);
      total += tiles.length;
    }

    // Download each zoom level
    for (final zoom in _zoomLevels) {
      final tiles = _calculateTilesForRegion(center, radiusKm, zoom);

      for (final tile in tiles) {
        try {
          await _downloadTile(tile['x']!, tile['y']!, zoom);
          downloaded++;
          onProgress?.call(downloaded, total);
        } catch (e) {
          // Continue on error
        }
      }
    }
  }

  /// Calculate tiles for region
  static List<Map<String, int>> _calculateTilesForRegion(
    LatLng center,
    double radiusKm,
    int zoom,
  ) {
    final tiles = <Map<String, int>>[];
    final centerTile = _latLngToTile(center, zoom);

    // Calculate tile radius
    final tileRadius = (radiusKm / 1000 / (156543.03392 * _cos(center.latitude) / _pow(2, zoom))).round();

    for (var x = centerTile['x']! - tileRadius; x <= centerTile['x']! + tileRadius; x++) {
      for (var y = centerTile['y']! - tileRadius; y <= centerTile['y']! + tileRadius; y++) {
        tiles.add({'x': x, 'y': y});
      }
    }

    return tiles;
  }

  /// Download single tile
  static Future<void> _downloadTile(int x, int y, int z) async {
    final url = OfflineMapService._tileUrlTemplate
        .replaceAll('{z}', z.toString())
        .replaceAll('{x}', x.toString())
        .replaceAll('{y}', y.toString());

    final response = await HttpClient().getUrl(Uri.parse(url));
    final bytes = await response.close().then((s) => s.expand((b) => [b]).toList());

    // Save to cache
    final dir = await _getTileCacheDir();
    final tileDir = Directory('${dir.path}/$z/$x');
    if (!await tileDir.exists()) {
      await tileDir.create(recursive: true);
    }
    final file = File('${tileDir.path}/$y.png');
    await file.writeAsBytes(bytes);
  }

  /// Get tile cache directory
  static Future<Directory> _getTileCacheDir() async {
    final appDir = await getApplicationDocumentsDirectory();
    final dir = Directory('${appDir.path}/tiles');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  /// Convert lat/lng to tile
  static Map<String, int> _latLngToTile(LatLng latlng, int zoom) {
    final n = _pow(2, zoom);
    final x = ((latlng.longitude + 180) / 360 * n).floor();
    final latRad = latlng.latitude * 3.141592653589793 / 180;
    final y = ((1 - (latRad.tan() + 1 / latRad.cos()).log() / 3.141592653589793) / 2 * n).floor();
    return {'x': x, 'y': y};
  }

  /// Calculate cos
  static double _cos(double degrees) => _cosRad(degrees * 3.141592653589793 / 180);
  static double _cosRad(double rad) {
    return 1 - (rad * rad) / 2 + (rad * rad * rad * rad) / 24;
  }

  /// Calculate power
  static int _pow(int base, int exp) {
    var result = 1;
    for (var i = 0; i < exp; i++) {
      result *= base;
    }
    return result;
  }

  /// Get cached tile count
  static Future<int> getCachedTileCount() async {
    final dir = await _getTileCacheDir();
    if (!await dir.exists()) return 0;

    var count = 0;
    await for (final entity in dir.list(recursive: true)) {
      if (entity is File && entity.path.endsWith('.png')) {
        count++;
      }
    }
    return count;
  }

  /// Clear tile cache
  static Future<void> clearCache() async {
    final dir = await _getTileCacheDir();
    if (await dir.exists()) {
      await dir.delete(recursive: true);
    }
  }
}

/// Incident marker colors by severity
class IncidentMarkerColors {
  static const Color critical = Color(0xFFD32F2F);    // Red
  static const Color high = Color(0xFFF57C00);         // Orange
  static const Color medium = Color(0xFFFBC02D);   // Yellow
  static const Color low = Color(0xFF388E3C);     // Green
  static const Color unknown = Color(0xFF757575);  // Grey

  static Color getColor(String? severity) {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return critical;
      case 'HIGH':
        return high;
      case 'MEDIUM':
        return medium;
      case 'LOW':
        return low;
      default:
        return unknown;
    }
  }
}