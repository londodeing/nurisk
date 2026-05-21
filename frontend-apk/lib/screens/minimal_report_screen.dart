import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/prefill_service.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../widgets/one_hand_navigation.dart';

/// Minimal single-screen report form
/// - Only 3 required fields
/// - Additional fields in collapsible section
/// - Auto-submit after 10 seconds of inactivity
class MinimalReportScreen extends StatefulWidget {
  const MinimalReportScreen({super.key});

  @override
  State<MinimalReportScreen> createState() => _MinimalReportScreenState();
}

class _MinimalReportScreenState extends State<MinimalReportScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Form controllers
  late TextEditingController _locationController;
  late TextEditingController _descriptionController;
  
  // Pre-filled values
  String? _disasterType;
  String? _severity;
  String? _identity;
  
  // UI state
  bool _isLoading = true;
  bool _isSubmitting = false;
  bool _showAdvanced = false;
  bool _autoSubmitEnabled = true;
  
  // Auto-submit timer
  Timer? _autoSubmitTimer;
  int _countdown = 10;
  
  // Disaster types
  final List<Map<String, dynamic>> _disasterTypes = [
    {'value': 'BANJIR', 'label': 'Banjir', 'icon': Icons.water_drop},
    {'value': 'GEMPA', 'label': 'Gempa', 'icon': Icons.vibration},
    {'value': 'LONTSAR', 'label': 'Longsor', 'icon': Icons.landscape},
    {'value': 'TSUNAMI', 'label': 'Tsunami', 'icon': Icons.waves},
    {'value': 'KEBAKARAN', 'label': 'Kebakaran', 'icon': Icons.local_fire_department},
    {'value': 'LAINNYA', 'label': 'Lainnya', 'icon': Icons.warning},
  ];
  
  // Severity levels
  final List<Map<String, dynamic>> _severityLevels = [
    {'value': 'TINGGI', 'label': 'Tinggi', 'color': Colors.red},
    {'value': 'SEDANG', 'label': 'Sedang', 'color': Colors.orange},
    {'value': 'RENDAH', 'label': 'Rendah', 'color': Colors.green},
  ];

  @override
  void initState() {
    super.initState();
    _locationController = TextEditingController();
    _descriptionController = TextEditingController();
    _loadPreFill();
  }

  @override
  void dispose() {
    _locationController.dispose();
    _descriptionController.dispose();
    _autoSubmitTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadPreFill() async {
    try {
      // Load location
      final location = await PreFillService.getLocation();
      if (location != null) {
        _locationController.text = 
            '${location.latitude.toStringAsFixed(4)}, ${location.longitude.toStringAsFixed(4)}';
      }

      // Load identity
      final identity = await PreFillService.getIdentity();
      if (identity != null) {
        _identity = identity.id;
      }

      // Load last disaster type
      final lastType = await PreFillService.getDisasterType();
      if (lastType != null) {
        _disasterType = lastType;
      }

      // Load last severity
      final lastSeverity = await PreFillService.getDefaultSeverity();
      if (lastSeverity != null) {
        _severity = lastSeverity;
      }

      // Load report count
      final count = await PreFillService.getReportCount();
      
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _startAutoSubmitTimer() {
    if (!_autoSubmitEnabled) return;
    
    _countdown = 10;
    _autoSubmitTimer?.cancel();
    _autoSubmitTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _countdown--;
      });
      
      if (_countdown <= 0) {
        timer.cancel();
        _submitReport();
      }
    });
  }

  void _cancelAutoSubmitTimer() {
    _autoSubmitTimer?.cancel();
    setState(() {
      _countdown = 10;
    });
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;
    if (_disasterType == null || _severity == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih jenis bencana dan tingkat')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final api = context.read<ApiService>();
      final report = {
        'disaster_type': _disasterType,
        'location': _locationController.text,
        'description': _descriptionController.text,
        'severity': _severity,
        'source': 'reporter',
        'source_type': 'public',
      };

      final response = await api.post('/public/reports', report);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Save preferences
        await PreFillService.saveDisasterType(_disasterType!);
        await PreFillService.saveSeverity(_severity!);
        await PreFillService.incrementReportCount();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Laporan terkirim'),
              backgroundColor: Colors.green,
            ),
          );
          _resetForm();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _resetForm() {
    _locationController.clear();
    _descriptionController.clear();
    setState(() {
      _disasterType = null;
      _severity = null;
      _showAdvanced = false;
    });
    _startAutoSubmitTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lapor'),
        actions: [
          if (_autoSubmitEnabled && _countdown < 10)
            TextButton(
              onPressed: _cancelAutoSubmitTimer,
              child: Text('Batal ($_countdown)'),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Disaster type (required) - 1 of 3
                  _buildSection(
                    'Jenis Bencana *',
                    _buildDisasterTypeSelector(),
                  ),
                  const SizedBox(height: 16),

                  // Location (required) - 2 of 3
                  _buildSection(
                    'Lokasi *',
                    _buildLocationField(),
                  ),
                  const SizedBox(height: 16),

                  // Severity (required) - 3 of 3
                  _buildSection(
                    'Tingkat *',
                    _buildSeveritySelector(),
                  ),
                  const SizedBox(height: 16),

                  // Description (optional, collapsible)
                  _buildSection(
                    'Deskripsi',
                    _buildDescriptionField(),
                  ),
                  const SizedBox(height: 16),

                  // Advanced fields toggle
                  TextButton.icon(
                    onPressed: () {
                      setState(() {
                        _showAdvanced = !_showAdvanced;
                      });
                    },
                    icon: Icon(_showAdvanced 
                        ? Icons.expand_less 
                        : Icons.expand_more),
                    label: Text(_showAdvanced 
                        ? 'Sembunyikan detail' 
                        : 'Tambah detail'),
                  ),

                  // Advanced fields
                  if (_showAdvanced) ...[
                    const SizedBox(height: 16),
                    _buildAdvancedFields(),
                  ],
                  const SizedBox(height: 24),

                  // Submit button
                  ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitReport,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(56),
                    ),
                    child: _isSubmitting
                        ? const CircularProgressIndicator()
                        : const Text('KIRIM LAPORAN'),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSection(String title, Widget child) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }

  Widget _buildDisasterTypeSelector() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _disasterTypes.map((type) {
        final isSelected = _disasterType == type['value'];
        return ChoiceChip(
          label: Text(type['label']),
          avatar: Icon(
            type['icon'],
            size: 18,
            color: isSelected ? Colors.white : null,
          ),
          selected: isSelected,
          onSelected: (selected) {
            setState(() {
              _disasterType = selected ? type['value'] : null;
            });
            if (selected) {
              _descriptionController.text = 
                  PreFillService.getDescriptionTemplate(type['value']);
            }
          },
        );
      }).toList(),
    );
  }

  Widget _buildLocationField() {
    return TextFormField(
      controller: _locationController,
      decoration: const InputDecoration(
        hintText: 'Contoh: JL. Merdeka No. 10, Jakarta',
        prefixIcon: Icon(Icons.location_on),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Lokasi wajib diisi';
        }
        return null;
      },
    );
  }

  Widget _buildSeveritySelector() {
    return Row(
      children: _severityLevels.map((level) {
        final isSelected = _severity == level['value'];
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(level['label']),
              selected: isSelected,
              selectedColor: level['color'],
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : null,
              ),
              onSelected: (selected) {
                setState(() {
                  _severity = selected ? level['value'] : null;
                });
              },
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDescriptionField() {
    return TextFormField(
      controller: _descriptionController,
      decoration: const InputDecoration(
        hintText: 'Deskripsikan insiden...',
        prefixIcon: Icon(Icons.description),
      ),
      maxLines: 3,
    );
  }

  Widget _buildAdvancedFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detail Tambahan',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        
        // Time field
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Waktu kejadian',
            hintText: 'Contoh: 14:30',
            prefixIcon: Icon(Icons.access_time),
          ),
        ),
        const SizedBox(height: 12),
        
        // Affected count
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Jumlah korban',
            hintText: 'Contoh: 5',
            prefixIcon: Icon(Icons.people),
          ),
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 12),
        
        // Infrastructure damage
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Kerusakan infrastruktur',
            hintText: 'Contoh: Jalan retak',
            prefixIcon: Icon(Icons.home),
          ),
        ),
      ],
    );
  }
}