import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class HazardZone {
  final int id;
  final String region;
  final String hazardType;
  final String severityLevel;
  final String? recurrenceInterval;
  final Map<String, dynamic>? polygonGeometry;
  final int populationExposed;
  final double infrastructureValue;
  final DateTime createdAt;
  final DateTime updatedAt;

  HazardZone({
    required this.id,
    required this.region,
    required this.hazardType,
    required this.severityLevel,
    this.recurrenceInterval,
    this.polygonGeometry,
    this.populationExposed = 0,
    this.infrastructureValue = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HazardZone.fromJson(Map<String, dynamic> json) {
    return HazardZone(
      id: json['id'],
      region: json['region'],
      hazardType: json['hazard_type'],
      severityLevel: json['severity_level'],
      recurrenceInterval: json['recurrence_interval'],
      polygonGeometry: json['polygon_geometry'],
      populationExposed: json['population_exposed'] ?? 0,
      infrastructureValue: (json['infrastructure_value'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'region': region,
        'hazard_type': hazardType,
        'severity_level': severityLevel,
        'recurrence_interval': recurrenceInterval,
        'polygon_geometry': polygonGeometry,
        'population_exposed': populationExposed,
        'infrastructure_value': infrastructureValue,
      };
}

class HazardMappingService {
  static const String _baseUrl = '${ApiService.baseUrl}/hazard';
  static const List<String> hazardTypes = [
    'flood',
    'earthquake',
    'landslide',
    'volcanic',
    'tsunami',
    'drought'
  ];
  static const List<String> severityLevels = [
    'very_low',
    'low',
    'moderate',
    'high',
    'very_high'
  ];

  Future<List<HazardZone>> getHazardZones({
    String? region,
    String? hazardType,
    String? severityLevel,
  }) async {
    final queryParams = <String, String>{};
    if (region != null) queryParams['region'] = region;
    if (hazardType != null) queryParams['hazard_type'] = hazardType;
    if (severityLevel != null) queryParams['severity_level'] = severityLevel;

    final uri = Uri.parse('$_baseUrl/zones').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: ApiService.headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => HazardZone.fromJson(json)).toList();
    }
    throw Exception('Failed to load hazard zones: ${response.statusCode}');
  }

  Future<HazardZone> getHazardZoneById(int id) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/zones/$id'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      return HazardZone.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to load hazard zone: ${response.statusCode}');
  }

  Future<HazardZone> createHazardZone(HazardZone zone) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/zones'),
      headers: ApiService.headers,
      body: json.encode(zone.toJson()),
    );

    if (response.statusCode == 201) {
      return HazardZone.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to create hazard zone: ${response.statusCode}');
  }

  Future<HazardZone> updateHazardZone(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/zones/$id'),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      return HazardZone.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to update hazard zone: ${response.statusCode}');
  }

  Future<void> deleteHazardZone(int id) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/zones/$id'),
      headers: ApiService.headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete hazard zone: ${response.statusCode}');
    }
  }

  Future<Map<String, dynamic>> computeZoneIntersections(int zoneId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/zones/$zoneId/intersections'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body)['data'];
    }
    throw Exception('Failed to compute intersections: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> calculateVulnerabilityScore(
    String region,
    String hazardType,
  ) async {
    final uri = Uri.parse('$_baseUrl/vulnerability').replace(
      queryParameters: {'region': region, 'hazard_type': hazardType},
    );
    final response = await http.get(uri, headers: ApiService.headers);

    if (response.statusCode == 200) {
      return json.decode(response.body)['data'];
    }
    throw Exception('Failed to calculate vulnerability: ${response.statusCode}');
  }

  Future<List<Map<String, dynamic>>> getHazardStatsByRegion(String region) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/stats/$region'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Failed to load hazard stats: ${response.statusCode}');
  }
}