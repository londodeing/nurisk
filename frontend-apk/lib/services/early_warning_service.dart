import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class EarlyWarning {
  final int id;
  final String title;
  final String? description;
  final String severity;
  final String hazardType;
  final String region;
  final String source;
  final DateTime issuedAt;
  final DateTime? expiresAt;
  final String status;
  final DateTime createdAt;

  EarlyWarning({
    required this.id,
    required this.title,
    this.description,
    required this.severity,
    required this.hazardType,
    required this.region,
    required this.source,
    required this.issuedAt,
    this.expiresAt,
    this.status = 'active',
    required this.createdAt,
  });

  factory EarlyWarning.fromJson(Map<String, dynamic> json) {
    return EarlyWarning(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      severity: json['severity'],
      hazardType: json['hazard_type'],
      region: json['region'],
      source: json['source'],
      issuedAt: DateTime.parse(json['issued_at']),
      expiresAt: json['expires_at'] != null ? DateTime.parse(json['expires_at']) : null,
      status: json['status'] ?? 'active',
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class WarningDeliveryLog {
  final int id;
  final int warningId;
  final String channel;
  final String? recipientId;
  final String status;
  final int retryCount;
  final DateTime? deliveredAt;
  final String? errorMessage;
  final DateTime createdAt;

  WarningDeliveryLog({
    required this.id,
    required this.warningId,
    required this.channel,
    this.recipientId,
    this.status = 'pending',
    this.retryCount = 0,
    this.deliveredAt,
    this.errorMessage,
    required this.createdAt,
  });

  factory WarningDeliveryLog.fromJson(Map<String, dynamic> json) {
    return WarningDeliveryLog(
      id: json['id'],
      warningId: json['warning_id'],
      channel: json['channel'],
      recipientId: json['recipient_id'],
      status: json['status'] ?? 'pending',
      retryCount: json['retry_count'] ?? 0,
      deliveredAt:
          json['delivered_at'] != null ? DateTime.parse(json['delivered_at']) : null,
      errorMessage: json['error_message'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class EarlyWarningService {
  static const String _baseUrl = '${ApiService.baseUrl}/warnings';

  static const Map<String, String> severityLevels = {
    'CRITICAL': 'CRITICAL',
    'HIGH': 'HIGH',
    'MODERATE': 'MODERATE',
    'LOW': 'LOW',
  };

  static const Map<String, String> warningSources = {
    'BMKG': 'BMKG',
    'MAGMA': 'MAGMA',
    'BNPB': 'BNPB',
    'INTERNAL': 'INTERNAL',
  };

  Future<List<EarlyWarning>> getEarlyWarnings({
    String? region,
    String? severity,
    String? hazardType,
    String? source,
    String? status,
  }) async {
    final queryParams = <String, String>{};
    if (region != null) queryParams['region'] = region;
    if (severity != null) queryParams['severity'] = severity;
    if (hazardType != null) queryParams['hazard_type'] = hazardType;
    if (source != null) queryParams['source'] = source;
    if (status != null) queryParams['status'] = status;

    final uri = Uri.parse(_baseUrl).replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: ApiService.headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => EarlyWarning.fromJson(json)).toList();
    }
    throw Exception('Failed to load warnings: ${response.statusCode}');
  }

  Future<EarlyWarning> getEarlyWarningById(int id) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/$id'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to load warning: ${response.statusCode}');
  }

  Future<EarlyWarning> createEarlyWarning(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse(_baseUrl),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to create warning: ${response.statusCode}');
  }

  Future<EarlyWarning> updateEarlyWarning(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/$id'),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to update warning: ${response.statusCode}');
  }

  Future<void> deleteEarlyWarning(int id) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/$id'),
      headers: ApiService.headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete warning: ${response.statusCode}');
    }
  }

  Future<List<WarningDeliveryLog>> getDeliveryLogs(int warningId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/$warningId/delivery'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => WarningDeliveryLog.fromJson(json)).toList();
    }
    throw Exception('Failed to load delivery logs: ${response.statusCode}');
  }

  Future<List<Map<String, dynamic>>> retryFailedDeliveries(int warningId) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/$warningId/retry'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Failed to retry deliveries: ${response.statusCode}');
  }

  Future<EarlyWarning> acknowledgeWarning(int id, {String? userId}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/acknowledge/$id'),
      headers: ApiService.headers,
      body: json.encode({'userId': userId}),
    );

    if (response.statusCode == 200) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to acknowledge warning: ${response.statusCode}');
  }

  Future<List<Map<String, dynamic>>> getWarningStats() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/stats'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Failed to load warning stats: ${response.statusCode}');
  }

  // Ingest from external sources
  Future<EarlyWarning> ingestBMKGAlert(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/ingest/bmkg'),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to ingest BMKG alert: ${response.statusCode}');
  }

  Future<EarlyWarning> ingestMAGMAAlert(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/ingest/magma'),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to ingest MAGMA alert: ${response.statusCode}');
  }

  Future<EarlyWarning> ingestBNPBAlert(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/ingest/bnpb'),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return EarlyWarning.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to ingest BNPB alert: ${response.statusCode}');
  }
}