import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_constants.dart';
import '../services/api_service.dart';

class IncidentReportScreen extends ConsumerStatefulWidget {
  const IncidentReportScreen({super.key});

  @override
  ConsumerState<IncidentReportScreen> createState() => _IncidentReportScreenState();
}

class _IncidentReportScreenState extends ConsumerState<IncidentReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _affectedController = TextEditingController();
  
  String? _selectedType;
  String? _selectedRegion;
  Position? _location;
  XFile? _photo;
  bool _loading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _affectedController.dispose();
    super.dispose();
  }

  Future<void> _getLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      _location = await Geolocator.getCurrentPosition();
      setState(() {});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) setState(() => _photo = image);
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) setState(() => _photo = image);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedType == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih jenis bencana')));
      return;
    }
    if (_selectedRegion == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih wilayah')));
      return;
    }
    if (_location == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dapatkan lokasi terlebih dahulu')));
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiService().createIncident({
        'title': _titleController.text,
        'disaster_type': _selectedType,
        'description': _descController.text,
        'region': _selectedRegion,
        'affected_people': int.tryParse(_affectedController.text) ?? 0,
        'latitude': _location!.latitude,
        'longitude': _location!.longitude,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Berhasil dilaporkan')));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lapor Insiden')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Title
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Judul Insiden *', border: OutlineInputBorder()),
              validator: (v) => v == null || v.isEmpty ? 'Judul wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            
            // Disaster Type
            const Text('Jenis Bencana *', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: AppConstants.DISASTER_TYPES.map((type) {
                final selected = _selectedType == type;
                return ChoiceChip(
                  label: Text(type),
                  selected: selected,
                  onSelected: (s) => setState(() => _selectedType = s ? type : null),
                  selectedColor: const Color(0xFF0f766e),
                  labelStyle: TextStyle(color: selected ? Colors.white : Colors.black),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            
            // Region
            const Text('Kabupaten/Kota *', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: AppConstants.KAB_JATENG.map((kab) {
                final selected = _selectedRegion == kab;
                return ChoiceChip(
                  label: Text(kab),
                  selected: selected,
                  onSelected: (s) => setState(() => _selectedRegion = s ? kab : null),
                  selectedColor: const Color(0xFF0f766e),
                  labelStyle: TextStyle(color: selected ? Colors.white : Colors.black),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            
            // Description
            TextFormField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Deskripsi', border: OutlineInputBorder()),
              maxLines: 4,
            ),
            const SizedBox(height: 16),
            
            // Affected
            TextFormField(
              controller: _affectedController,
              decoration: const InputDecoration(labelText: 'Jumlah Terdampak', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            
            // Location
            ListTile(
              tileColor: Colors.grey[100],
              title: Text(_location != null 
                ? '${_location!.latitude.toStringAsFixed(4)}, ${_location!.longitude.toStringAsFixed(4)}'
                : 'Dapatkan Lokasi'),
              trailing: const Icon(Icons.location_on),
              onTap: _getLocation,
            ),
            const SizedBox(height: 16),
            
            // Photo
            Row(
              children: [
                Expanded(child: OutlinedButton.icon(onPressed: _takePhoto, icon: const Icon(Icons.camera_alt), label: const Text('Kamera'))),
                const SizedBox(width: 16),
                Expanded(child: OutlinedButton.icon(onPressed: _pickImage, icon: const Icon(Icons.photo_library), label: const Text('Galeri'))),
              ],
            ),
            const SizedBox(height: 24),
            
            // Submit
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0f766e), foregroundColor: Colors.white, padding: const EdgeInsets.all(16)),
              child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Kirim Laporan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}