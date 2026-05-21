import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/voice_reporting_service.dart';
import '../services/voice_report_extractor.dart';
import '../services/api_service.dart';
import '../providers/incidents_provider.dart';

/// Voice reporting screen
/// - Microphone button with pulsing animation
/// - Real-time transcription
/// - Confirmation before submission
class VoiceReportScreen extends StatefulWidget {
  const VoiceReportScreen({super.key});

  @override
  State<VoiceReportScreen> createState() => _VoiceReportScreenState();
}

class _VoiceReportScreenState extends State<VoiceReportScreen>
    with SingleTickerProviderStateMixin {
  final VoiceReportingService _voiceService = VoiceReportingService();
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  bool _isRecording = false;
  String _transcript = '';
  double _confidence = 0.0;
  VoiceReportExtract? _extractedData;
  bool _isProcessing = false;
  bool _isSubmitted = false;

  @override
  void initState() {
    super.initState();
    _voiceService.initialize();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _pulseController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _pulseController.reverse();
      } else if (status == AnimationStatus.dismissed && _isRecording) {
        _pulseController.forward();
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _voiceService.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    final isAvailable = await _voiceService.isAvailable();
    if (!isAvailable) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Speech recognition not available')),
        );
      }
      return;
    }

    setState(() {
      _isRecording = true;
      _transcript = '';
      _confidence = 0.0;
      _extractedData = null;
      _isSubmitted = false;
    });

    _pulseController.forward();

    await _voiceService.startListening(
      onResult: (transcript, confidence) {
        setState(() {
          _transcript = transcript;
          _confidence = confidence;
        });
      },
      onListeningStarted: () {
        HapticFeedback.mediumImpact();
      },
      onListeningDone: () async {
        await _processTranscript();
      },
    );
  }

  Future<void> _stopRecording() async {
    await _voiceService.stopListening();
    _pulseController.stop();

    setState(() {
      _isRecording = false;
    });

    if (_transcript.isNotEmpty) {
      await _processTranscript();
    }
  }

  Future<void> _processTranscript() async {
    if (_transcript.isEmpty) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      final extracted = await VoiceReportExtractor.extract(_transcript);
      setState(() {
        _extractedData = extracted;
        _isProcessing = false;
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  Future<void> _submitReport() async {
    if (_extractedData == null) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      final report = {
        'content': _extractedData!.transcript,
        'disaster_type': _extractedData!.disasterType,
        'location': _extractedData!.location,
        'description': _extractedData!.description,
        'urgency': _extractedData!.urgency,
        'source': 'voice',
        'source_type': 'reporter',
      };

      // Try to submit online
      final api = context.read<ApiService>();
      final response = await api.post('/public/reports', report);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success - play confirmation
        await SystemSound.play(SystemSoundType.click);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Laporan terkirim'),
              backgroundColor: Colors.green,
            ),
          );
        }
        setState(() {
          _isSubmitted = true;
        });
      } else {
        throw Exception('Submission failed');
      }
    } catch (e) {
      // Queue for offline sync
      await VoiceReportQueue.enqueue(VoiceReport(
        transcript: _transcript,
        disasterType: _extractedData!.disasterType,
        location: _extractedData!.location,
        description: _extractedData!.description,
        urgency: _extractedData!.urgency,
        confidence: _extractedData!.confidence,
      ));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Laporan disimpan untuk sinkronisasi'),
            backgroundColor: Colors.orange,
          ),
        );
        setState(() {
          _isSubmitted = true;
        });
      }
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan Suara'),
      ),
      body: _isSubmitted
          ? _buildSubmittedView()
          : _extractedData != null
              ? _buildConfirmationView()
              : _buildRecordingView(),
    );
  }

  Widget _buildRecordingView() {
    return Column(
      children: [
        // Transcript display
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_isProcessing)
                  const CircularProgressIndicator()
                else if (_transcript.isEmpty)
                  const Text(
                    'Tekan tombol microphone untuk mulai',
                    style: TextStyle(fontSize: 18),
                    textAlign: TextAlign.center,
                  )
                else
                  Text(
                    _transcript,
                    style: const TextStyle(fontSize: 20),
                    textAlign: TextAlign.center,
                  ),
                if (_confidence > 0) ...[
                  const SizedBox(height: 16),
                  Text(
                    'Confidence: ${(_confidence * 100).toInt()}%',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ],
            ),
          ),
        ),

        // Microphone button
        Padding(
          padding: const EdgeInsets.all(32),
          child: AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _isRecording ? _pulseAnimation.value : 1.0,
                child: FloatingActionButton.large(
                  onPressed: _isRecording ? _stopRecording : _startRecording,
                  backgroundColor: _isRecording ? Colors.red : Colors.blue,
                  child: Icon(
                    _isRecording ? Icons.stop : Icons.mic,
                    size: 48,
                  ),
                ),
              );
            },
          ),
        ),

        // Instructions
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            _isRecording
                ? 'Berbicara... Tekan untuk berhenti'
                : 'Tahan dan berbicara',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmationView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Konfirmasi Laporan',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),

          // Disaster type
          _buildField('Jenis Bencana', _extractedData!.disasterType ?? '-', Icons.warning),
          const SizedBox(height: 16),

          // Location
          _buildField('Lokasi', _extractedData!.location ?? '-', Icons.location_on),
          const SizedBox(height: 16),

          // Urgency
          _buildField('Urgensi', _extractedData!.urgency ?? '-', Icons.priority_high),
          const SizedBox(height: 16),

          // Description
          _buildField('Deskripsi', _extractedData!.description ?? '-', Icons.description),
          const SizedBox(height: 32),

          // Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _extractedData = null;
                      _transcript = '';
                    });
                  },
                  child: const Text('KOREKSI'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _submitReport,
                  child: _isProcessing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('KIRIM'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, String value, IconData icon) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(label),
        subtitle: Text(value, style: const TextStyle(fontSize: 18)),
      ),
    );
  }

  Widget _buildSubmittedView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.check_circle, size: 80, color: Colors.green),
          const SizedBox(height: 16),
          const Text(
            'Laporan Terkirim',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _transcript = '';
                _extractedData = null;
                _isSubmitted = false;
              });
            },
            child: const Text('LAPORAN BARU'),
          ),
        ],
      ),
    );
  }
}