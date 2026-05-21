import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_constants.dart';
import '../providers/incidents_provider.dart';
import '../repositories/incident_repository.dart';

class IncidentDetail extends ConsumerWidget {
  final int id;

  const IncidentDetail({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final incidentAsync = ref.watch(incidentDetailProvider(id));

    return Scaffold(
      appBar: AppBar(title: const Text('Detail Insiden')),
      body: incidentAsync.when(
        data: (incident) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _parseColor(AppConstants.STATUS_COLORS[incident.status] ?? '#64748b'),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  AppConstants.STATUS_LABELS[incident.status] ?? incident.status ?? 'REPORTED',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
              // Title
              Text(incident.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              // Disaster Type
              Text(incident.disasterType, style: TextStyle(fontSize: 16, color: Colors.grey[600])),
              const SizedBox(height: 16),
              // Location
              Row(
                children: [
                  const Icon(Icons.location_on, color: Color(0xFF0f766e)),
                  const SizedBox(width: 8),
                  Expanded(child: Text(incident.regency ?? incident.address)),
                ],
              ),
              const SizedBox(height: 8),
              // Date
              Row(
                children: [
                  const Icon(Icons.calendar_today, color: Color(0xFF0f766e)),
                  const SizedBox(width: 8),
                  Text(_formatDate(incident.reportedAt)),
                ],
              ),
              const Divider(height: 32),
              // Description
              if (incident.description.isNotEmpty) ...[
                const Text('Deskripsi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(incident.description),
                const Divider(height: 32),
              ],
              // Impact
              if (incident.affected != null && incident.affected! > 0) ...[
                const Text('Dampak', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _impactRow('Terdampak', incident.affected!),
                const Divider(height: 32),
              ],
              if (incident.casualties != null && incident.casualties! > 0) ...[
                _impactRow('Korban', incident.casualties!),
                const Divider(height: 32),
              ],
              if (incident.evacuated != null && incident.evacuated! > 0) ...[
                _impactRow('Mengungsi', incident.evacuated!),
                const Divider(height: 32),
              ],
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _impactRow(String label, int value) {
    return Row(
      children: [
        Text(label, style: const TextStyle(fontSize: 16)),
        const SizedBox(width: 8),
        Text('$value', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Color _parseColor(String? colorHex) {
    if (colorHex == null) return Colors.grey;
    try {
      final hex = colorHex.replaceFirst('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (e) {
      return Colors.grey;
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}