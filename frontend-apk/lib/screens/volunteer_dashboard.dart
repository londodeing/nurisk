import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/incidents_provider.dart';
import '../repositories/incident_repository.dart';
import '../widgets/incident_card.dart';
import 'incident_detail.dart';
import 'incident_report.dart';

class VolunteerDashboard extends ConsumerStatefulWidget {
  const VolunteerDashboard({super.key});

  @override
  ConsumerState<VolunteerDashboard> createState() => _VolunteerDashboardState();
}

class _VolunteerDashboardState extends ConsumerState<VolunteerDashboard> {
  int _selectedTab = 0;
  GoogleMapController? _mapController;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final incidentsAsync = ref.watch(incidentsProvider);
    final user = auth.valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Halo, ${user?.displayName ?? 'Relawan'}', style: const TextStyle(fontSize: 16)),
            Text(user?.regency ?? '', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        backgroundColor: const Color(0xFF0f766e),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Tab Buttons
          Row(
            children: [
              _tabButton('Peta', 0),
              _tabButton('Daftar', 1),
              _tabButton('Misi', 2),
            ],
          ),
          // Content
          Expanded(
            child: _selectedTab == 0 ? _buildMap(incidentsAsync) : _buildList(incidentsAsync),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/incident'),
        backgroundColor: const Color(0xFF0f766e),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _tabButton(String label, int index) {
    final selected = _selectedTab == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selected ? const Color(0xFF0f766e) : Colors.grey[200],
            border: Border(bottom: BorderSide(color: selected ? const Color(0xFF0f766e) : Colors.transparent, width: 2)),
          ),
          child: Text(label, textAlign: TextAlign.center, style: TextStyle(color: selected ? Colors.white : Colors.black, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }

  Widget _buildMap(AsyncValue<List<Incident>> incidentsAsync) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: LatLng(AppConstants.CENTER_JATENG[0], AppConstants.CENTER_JATENG[1]),
        zoom: 10,
      ),
      onMapCreated: (controller) => _mapController = controller,
      myLocationEnabled: true,
      markers: incidentsAsync.maybeWhen(
        data: (incidents) => incidents
            .where((i) => i.status != 'COMPLETED')
            .map((i) => Marker(
                  markerId: MarkerId(i.id.toString()),
                  position: LatLng(i.latitude, i.longitude),
                  infoWindow: InfoWindow(title: i.title),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => IncidentDetail(id: i.id))),
                ))
            .toSet(),
        orElse: () => <Marker>{},
      ),
    );
  }

  Widget _buildList(AsyncValue<List<Incident>> incidentsAsync) {
    return incidentsAsync.when(
      data: (incidents) {
        if (incidents.isEmpty) return const Center(child: Text('Tidak ada insiden'));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: incidents.length,
          itemBuilder: (context, index) {
            final incident = incidents[index];
            return IncidentCard(
              incident: incident,
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => IncidentDetail(id: incident.id))),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}