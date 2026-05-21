import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../constants/app_constants.dart';
import '../providers/incidents_provider.dart';
import '../repositories/incident_repository.dart';
import '../widgets/incident_card.dart';
import 'incident_detail.dart';
import 'incident_report.dart';

class PublicDashboard extends ConsumerStatefulWidget {
  const PublicDashboard({super.key});

  @override
  ConsumerState<PublicDashboard> createState() => _PublicDashboardState();
}

class _PublicDashboardState extends ConsumerState<PublicDashboard> {
  GoogleMapController? _mapController;
  int _selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    final incidentsAsync = ref.watch(incidentsProvider);

    return Scaffold(
      body: Column(
        children: [
          // Map or List
          Expanded(
            child: _selectedTab == 0 ? _buildMap(incidentsAsync) : _buildList(incidentsAsync),
          ),
          // Bottom Navigation
          _buildBottomNav(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/incident'),
        backgroundColor: const Color(0xFF0f766e),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildMap(AsyncValue<List<Incident>> incidentsAsync) {
    return Stack(
      children: [
        GoogleMap(
          initialCameraPosition: CameraPosition(
            target: LatLng(AppConstants.CENTER_JATENG[0], AppConstants.CENTER_JATENG[1]),
            zoom: 10,
          ),
          onMapCreated: (controller) => _mapController = controller,
          myLocationEnabled: true,
          myLocationButtonEnabled: true,
          markers: incidentsAsync.maybeWhen(
            data: (incidents) => incidents
                .where((i) => i.status != 'COMPLETED')
                .map((i) => Marker(
                      markerId: MarkerId(i.id.toString()),
                      position: LatLng(i.latitude, i.longitude),
                      infoWindow: InfoWindow(title: i.title, snippet: i.disasterType),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => IncidentDetail(id: i.id),
                        ),
                      ),
                    ))
                .toSet(),
            orElse: () => <Marker>{},
          ),
        ),
        // Stats Overlay
        Positioned(
          top: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: incidentsAsync.maybeWhen(
              data: (incidents) {
                final active = incidents.where((i) => i.status != 'COMPLETED').length;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('$active Aktif', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  ],
                );
              },
              orElse: () => const SizedBox(),
            ),
          ),
        ),
      ],
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

  Widget _buildBottomNav() {
    return Container(
      color: Colors.white,
      child: Row(
        children: [
          _navItem(icon: Icons.map, label: 'Peta', index: 0),
          _navItem(icon: Icons.list, label: 'Daftar', index: 1),
        ],
      ),
    );
  }

  Widget _navItem({required IconData icon, required String label, required int index}) {
    final selected = _selectedTab == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: selected ? const Color(0xFF0f766e) : Colors.grey),
              const SizedBox(height: 4),
              Text(label, style: TextStyle(color: selected ? const Color(0xFF0f766e) : Colors.grey, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}