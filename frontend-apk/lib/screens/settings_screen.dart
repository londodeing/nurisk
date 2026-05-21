import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notifications = true;
  bool _locationEnabled = true;
  String _apiUrl = AppConstants.BASE_URL;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notifications = prefs.getBool('notifications') ?? true;
      _locationEnabled = prefs.getBool('location_enabled') ?? true;
      _apiUrl = prefs.getString('api_url') ?? AppConstants.BASE_URL;
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notifications', _notifications);
    await prefs.setBool('location_enabled', _locationEnabled);
    await prefs.setString('api_url', _apiUrl);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengaturan disimpan')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan')),
      body: ListView(
        children: [
          // Notifications
          SwitchListTile(
            title: const Text('Notifikasi'),
            subtitle: const Text('Terima notifikasi insiden'),
            value: _notifications,
            onChanged: (v) => setState(() => _notifications = v),
          ),
          const Divider(),
          // Location
          SwitchListTile(
            title: const Text('Lokasi'),
            subtitle: const Text('Aktifkan lokasi untuk pelaporan'),
            value: _locationEnabled,
            onChanged: (v) => setState(() => _locationEnabled = v),
          ),
          const Divider(),
          // API URL
          ListTile(
            title: const Text('API URL'),
            subtitle: Text(_apiUrl),
            trailing: const Icon(Icons.edit),
            onTap: () => _showApiUrlDialog(),
          ),
          const Divider(),
          // Save Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: _saveSettings,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0f766e), foregroundColor: Colors.white),
              child: const Text('Simpan Pengaturan'),
            ),
          ),
          const Divider(),
          // About
          ListTile(
            title: const Text('Tentang'),
            subtitle: const Text('NURisk v1.0.0'),
            trailing: const Icon(Icons.info_outline),
            onTap: () => _showAboutDialog(),
          ),
        ],
      ),
    );
  }

  void _showApiUrlDialog() {
    final controller = TextEditingController(text: _apiUrl);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('API URL'),
        content: TextField(controller: controller, decoration: const InputDecoration(labelText: 'URL')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          TextButton(
            onPressed: () {
              setState(() => _apiUrl = controller.text);
              Navigator.pop(context);
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog() {
    showAboutDialog(
      context: context,
      applicationName: 'NURisk',
      applicationVersion: '1.0.0',
      applicationLegalese: '© 2024 PUSDATIN NU Jawa Tengah',
      children: [const Text('Aplikasi manajemen bencana untuk Jawa Tengah')],
    );
  }
}