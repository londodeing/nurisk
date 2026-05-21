import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../repositories/auth_repository.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _secretController = TextEditingController();
  String? _selectedRegion;
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    _secretController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final registerData = RegisterData(
        username: _usernameController.text,
        email: '${_usernameController.text}@nurisk.id',
        password: _passwordController.text,
        name: _nameController.text,
        regency: _selectedRegion,
      );
      await ref.read(authProvider.notifier).register(registerData);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daftar')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Nama Lengkap *', border: OutlineInputBorder()),
                validator: (v) => v == null || v.isEmpty ? 'Nama wajib diisi' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(labelText: 'Username *', border: OutlineInputBorder()),
                validator: (v) => v == null || v.isEmpty ? 'Username wajib diisi' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password *', border: OutlineInputBorder()),
                validator: (v) => v == null || v.length < 6 ? 'Password minimal 6 karakter' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _confirmController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Konfirmasi Password *', border: OutlineInputBorder()),
                validator: (v) => v != _passwordController.text ? 'Password tidak cocok' : null,
              ),
              const SizedBox(height: 16),
              const Text('Kabupaten/Kota', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
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
              TextFormField(
                controller: _secretController,
                decoration: const InputDecoration(labelText: 'Secret Key (untuk PCNU/PWNU)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _register,
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0f766e), foregroundColor: Colors.white, padding: const EdgeInsets.all(16)),
                  child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Daftar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}