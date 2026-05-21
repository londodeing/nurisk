import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Voice reporting service
/// - Speech-to-text with Bahasa Indonesia support
/// - Real-time transcription
/// - Offline queue support
class VoiceReportingService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isInitialized = false;
  bool _isListening = false;
  String _transcript = '';
  double _confidence = 0.0;

  bool get isListening => _isListening;
  String get transcript => _transcript;
  double get confidence => _confidence;

  /// Initialize speech recognition
  Future<bool> initialize() async {
    if (_isInitialized) return true;

    try {
      _isInitialized = await _speech.initialize(
        onStatus: (status) {
          debugPrint('[VOICE] Status: $status');
        },
        onError: (error) {
          debugPrint('[VOICE] Error: $error');
        },
      );
    } catch (e) {
      debugPrint('[VOICE] Init error: $e');
    }

    return _isInitialized;
  }

  /// Check if speech is available
  Future<bool> isAvailable() async {
    if (!_isInitialized) {
      await initialize();
    }
    return _isInitialized;
  }

  /// Get available languages
  Future<List<stt.LocaleName>> getLocales() async {
    if (!_isInitialized) {
      await initialize();
    }
    return _speech.locales();
  }

  /// Start listening
  Future<void> startListening({
    required Function(String transcript, double confidence) onResult,
    String localeId = 'id-ID',
    Function()? onListeningStarted,
    Function()? onListeningDone,
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    if (_isListening) return;

    _transcript = '';
    _confidence = 0.0;
    _isListening = true;

    onListeningStarted?.call();

    await _speech.listen(
      onResult: (SpeechRecognitionResult result) {
        _transcript = result.recognizedWords;
        _confidence = result.confidence;
        onResult(_transcript, _confidence);
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      localeId: localeId,
      cancelOnError: false,
      partialResults: true,
    );
  }

  /// Stop listening
  Future<void> stopListening() async {
    if (!_isListening) return;

    await _speech.stop();
    _isListening = false;
  }

  /// Cancel listening
  Future<void> cancel() async {
    await _speech.cancel();
    _isListening = false;
    _transcript = '';
  }

  /// Dispose
  void dispose() {
    _speech.cancel();
  }
}

/// Voice report data
class VoiceReport {
  final String transcript;
  final String? disasterType;
  final String? location;
  final String? description;
  final String? urgency;
  final double? confidence;
  final DateTime createdAt;

  VoiceReport({
    required this.transcript,
    this.disasterType,
    this.location,
    this.description,
    this.urgency,
    this.confidence,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'transcript': transcript,
        'disasterType': disasterType,
        'location': location,
        'description': description,
        'urgency': urgency,
        'confidence': confidence,
        'createdAt': createdAt.toIso8601String(),
      };

  factory VoiceReport.fromJson(Map<String, dynamic> json) => VoiceReport(
        transcript: json['transcript'],
        disasterType: json['disasterType'],
        location: json['location'],
        description: json['description'],
        urgency: json['urgency'],
        confidence: json['confidence'],
        createdAt: json['createdAt'] != null
            ? DateTime.parse(json['createdAt'])
            : null,
      );
}

/// Voice report offline queue
class VoiceReportQueue {
  static const String _queueKey = 'voice_report_queue';

  /// Add report to queue
  static Future<void> enqueue(VoiceReport report) async {
    final prefs = await SharedPreferences.getInstance();
    final queueJson = prefs.getStringList(_queueKey) ?? [];
    queueJson.add(report.toJson().toString());
    await prefs.setStringList(_queueKey, queueJson);
  }

  /// Get queued reports
  static Future<List<VoiceReport>> getQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final queueJson = prefs.getStringList(_queueKey) ?? [];
    return queueJson
        .map((e) => VoiceReport.fromJson(Map<String, dynamic>.from(
            {'transcript': e, 'createdAt': DateTime.now().toIso8601String()})))
        .toList();
  }

  /// Clear queue
  static Future<void> clearQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_queueKey);
  }

  /// Get queue count
  static Future<int> getQueueCount() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_queueKey)?.length ?? 0;
  }
}