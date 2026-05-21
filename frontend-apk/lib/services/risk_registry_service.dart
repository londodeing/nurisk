import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class RiskEntry {
  final int id;
  final String regionId;
  final String hazardType;
  final int likelihood;
  final int impact;
  final int riskScore;
  final String mitigationStatus;
  final String? owner;
  final DateTime? reviewDate;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  RiskEntry({
    required this.id,
    required this.regionId,
    required this.hazardType,
    required this.likelihood,
    required this.impact,
    required this.riskScore,
    this.mitigationStatus = 'pending',
    this.owner,
    this.reviewDate,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RiskEntry.fromJson(Map<String, dynamic> json) {
    return RiskEntry(
      id: json['id'],
      regionId: json['region_id'],
      hazardType: json['hazard_type'],
      likelihood: json['likelihood'],
      impact: json['impact'],
      riskScore: json['risk_score'],
      mitigationStatus: json['mitigation_status'] ?? 'pending',
      owner: json['owner'],
      reviewDate: json['review_date'] != null ? DateTime.parse(json['review_date']) : null,
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  String get riskTier {
    if (riskScore >= 20) return 'Very High';
    if (riskScore >= 15) return 'High';
    if (riskScore >= 10) return 'Medium';
    if (riskScore >= 5) return 'Low';
    return 'Very Low';
  }

  String get color {
    if (riskScore >= 20) return '#ef4444';
    if (riskScore >= 15) return '#f97316';
    if (riskScore >= 10) return '#eab308';
    if (riskScore >= 5) return '#84cc16';
    return '#22c55e';
  }
}

class RiskAuditLog {
  final int id;
  final int riskId;
  final String action;
  final int? oldLikelihood;
  final int? newLikelihood;
  final int? oldImpact;
  final int? newImpact;
  final String? changedBy;
  final DateTime changedAt;

  RiskAuditLog({
    required this.id,
    required this.riskId,
    required this.action,
    this.oldLikelihood,
    this.newLikelihood,
    this.oldImpact,
    this.newImpact,
    this.changedBy,
    required this.changedAt,
  });

  factory RiskAuditLog.fromJson(Map<String, dynamic> json) {
    return RiskAuditLog(
      id: json['id'],
      riskId: json['risk_id'],
      action: json['action'],
      oldLikelihood: json['old_likelihood'],
      newLikelihood: json['new_likelihood'],
      oldImpact: json['old_impact'],
      newImpact: json['new_impact'],
      changedBy: json['changed_by'],
      changedAt: DateTime.parse(json['changed_at']),
    );
  }
}

class RiskRegistryService {
  static const String _baseUrl = '${ApiService.baseUrl}/risk/registry';

  static const List<String> hazardTypes = [
    'Banjir',
    'Banjir Bandang',
    'Tanah Longsor',
    'Gempa Bumi',
    'Gunung Api',
    'Cuaca Ekstrim',
    'Kekeringan',
    'Tsunami',
  ];

  static const List<String> mitigationStatuses = [
    'pending',
    'in_progress',
    'completed',
    'monitoring',
    'no_action',
  ];

  Future<List<RiskEntry>> getRiskEntries({
    String? regionId,
    String? hazardType,
    String? mitigationStatus,
    int? minScore,
    int? maxScore,
  }) async {
    final queryParams = <String, String>{};
    if (regionId != null) queryParams['region_id'] = regionId;
    if (hazardType != null) queryParams['hazard_type'] = hazardType;
    if (mitigationStatus != null) queryParams['mitigation_status'] = mitigationStatus;
    if (minScore != null) queryParams['min_score'] = minScore.toString();
    if (maxScore != null) queryParams['max_score'] = maxScore.toString();

    final uri = Uri.parse(_baseUrl).replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: ApiService.headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => RiskEntry.fromJson(json)).toList();
    }
    throw Exception('Failed to load risk entries: ${response.statusCode}');
  }

  Future<RiskEntry> getRiskEntryById(int id) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/$id'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      return RiskEntry.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to load risk entry: ${response.statusCode}');
  }

  Future<RiskEntry> createRiskEntry(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse(_baseUrl),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return RiskEntry.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to create risk entry: ${response.statusCode}');
  }

  Future<RiskEntry> updateRiskEntry(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/$id'),
      headers: ApiService.headers,
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      return RiskEntry.fromJson(json.decode(response.body)['data']);
    }
    throw Exception('Failed to update risk entry: ${response.statusCode}');
  }

  Future<void> deleteRiskEntry(int id) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/$id'),
      headers: ApiService.headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete risk entry: ${response.statusCode}');
    }
  }

  Future<List<RiskAuditLog>> getAuditLogs(int riskId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/$riskId/audit'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => RiskAuditLog.fromJson(json)).toList();
    }
    throw Exception('Failed to load audit logs: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> getRiskHeatmap() async {
    final response = await http.get(
      Uri.parse('${ApiService.baseUrl}/risk/heatmap'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body)['data'];
    }
    throw Exception('Failed to load heatmap: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> getRiskSummary() async {
    final response = await http.get(
      Uri.parse('${ApiService.baseUrl}/risk/summary'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body)['data'];
    }
    throw Exception('Failed to load risk summary: ${response.statusCode}');
  }

  Future<List<RiskEntry>> getTopRisks({int limit = 10}) async {
    final uri = Uri.parse('${ApiService.baseUrl}/risk/top').replace(
      queryParameters: {'limit': limit.toString()},
    );
    final response = await http.get(uri, headers: ApiService.headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => RiskEntry.fromJson(json)).toList();
    }
    throw Exception('Failed to load top risks: ${response.statusCode}');
  }

  Future<List<RiskEntry>> getRisksByRegion(String regionId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/region/$regionId'),
      headers: ApiService.headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => RiskEntry.fromJson(json)).toList();
    }
    throw Exception('Failed to load region risks: ${response.statusCode}');
  }
}