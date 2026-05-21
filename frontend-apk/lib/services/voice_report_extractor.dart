import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Voice report extraction service
/// Uses Gemini to extract structured data from voice transcript
class VoiceReportExtractor {
  static const String _geminiApiKey = String.fromEnvironment('GEMINI_API_KEY', defaultValue: '');
  static const String _geminiModel = 'gemini-1.5-pro';

  /// Extract structured report from transcript
  static Future<VoiceReportExtract> extract(String transcript) async {
    if (_geminiApiKey.isEmpty) {
      // Fallback: simple extraction
      return _simpleExtract(transcript);
    }

    try {
      final prompt = '''
Extract disaster report information from this transcript.

Transcript:
"$transcript"

Respond in JSON format:
{
  "disasterType": "BANJIR|GEMPA|BANJIR_BANDANG|LONTSAR|TSUNAMI|KEBAKARAN|LAINNYA" or null,
  "location": "location name or null",
  "description": "brief description or null",
  "urgency": "TINGGI|SEDANG|RENDAH" or null,
  "confidence": 0-100
}

Disaster types in Indonesian:
- BANJIR = flood
- GEMPA = earthquake  
- BANJIR_BANDANG = flash flood
- LONTSAR = landslide
- TSUNAMI = tsunami
- KEBAKARAN = fire
- LAINNYA = other
''';

      final dio = Dio();
      final response = await dio.post(
        'https://generativelanguage.googleapis.com/v1beta/models/$_geminiModel:generateContent?key=$_geminiApiKey',
        data: {
          'contents': [{'parts': [{'text': prompt}]}],
          'generationConfig': {
            'temperature': 0.2,
            'maxOutputTokens': 512,
          },
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Gemini API error: ${response.statusCode}');
      }

      final data = response.data;
      final text = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? '';

      return _parseResponse(text, transcript);
    } catch (e) {
      debugPrint('[VOICE_EXTRACT] Error: $e');
      return _simpleExtract(transcript);
    }
  }

  /// Simple extraction without Gemini
  static VoiceReportExtract _simpleExtract(String transcript) {
    final lower = transcript.toLowerCase();

    String? disasterType;
    String? urgency;

    // Detect disaster type
    if (lower.contains('banjir') || lower.contains('air naik')) {
      disasterType = 'BANJIR';
      urgency = 'TINGGI';
    } else if (lower.contains('gempa') || lower.contains('getaran')) {
      disasterType = 'GEMPA';
      urgency = 'TINGGI';
    } else if (lower.contains('longsor') || lower.contains('lontsar')) {
      disasterType = 'LONTSAR';
      urgency = 'TINGGI';
    } else if (lower.contains('tsunami')) {
      disasterType = 'TSUNAMI';
      urgency = 'TINGGI';
    } else if (lower.contains('kebakar') || lower.contains('api')) {
      disasterType = 'KEBAKARAN';
      urgency = 'SEDANG';
    }

    // Detect urgency keywords
    if (lower.contains('mendesak') || lower.contains('urgent') || lower.contains('segera')) {
      urgency = 'TINGGI';
    } else if (lower.contains('bisa tunggu') || lower.contains('tidak urgent')) {
      urgency = 'RENDAH';
    }

    return VoiceReportExtract(
      transcript: transcript,
      disasterType: disasterType,
      location: null,
      description: transcript,
      urgency: urgency,
      confidence: 50,
    );
  }

  /// Parse Gemini response
  static VoiceReportExtract _parseResponse(String text, String transcript) {
    try {
      final jsonMatch = RegExp(r'\{[\s\S]*\}').firstMatch(text);
      if (jsonMatch == null) {
        return _simpleExtract(transcript);
      }

      final parsed = jsonDecode(jsonMatch.group(0)!);

      return VoiceReportExtract(
        transcript: transcript,
        disasterType: parsed['disasterType'],
        location: parsed['location'],
        description: parsed['description'] ?? transcript,
        urgency: parsed['urgency'],
        confidence: (parsed['confidence'] ?? 50).toDouble(),
      );
    } catch (e) {
      debugPrint('[VOICE_EXTRACT] Parse error: $e');
      return _simpleExtract(transcript);
    }
  }
}

/// Extracted voice report data
class VoiceReportExtract {
  final String transcript;
  final String? disasterType;
  final String? location;
  final String? description;
  final String? urgency;
  final double confidence;

  VoiceReportExtract({
    required this.transcript,
    this.disasterType,
    this.location,
    this.description,
    this.urgency,
    this.confidence = 50,
  });

  Map<String, dynamic> toJson() => {
        'transcript': transcript,
        'disasterType': disasterType,
        'location': location,
        'description': description,
        'urgency': urgency,
        'confidence': confidence,
      };

  /// Check if extraction is valid
  bool get isValid => disasterType != null;
}