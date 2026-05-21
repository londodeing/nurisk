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

class AdminDashboard extends ConsumerStatefulWidget {
  const AdminDashboard({super.key});

  @override
  ConsumerState<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends ConsumerState<AdminDashboard> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final incidentsAsync = ref.watch(incidentsProvider);
    final analyticsAsync = ref.watch(analyticsProvider);
    final user = auth.valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Command Center', style: TextStyle(fontSize: 16)),
            Text(user?.regency ?? '', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        backgroundColor: const Color(0xFF0f766e),
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Peta'),
            Tab(text: 'Insiden'),
            Tab(text: 'Analytics'),
            Tab(text: 'Notif'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMap(incidentsAsync),
          _buildList(incidentsAsync),
          _buildAnalytics(analyticsAsync),
          _buildNotifications(),
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
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: LatLng(AppConstants.CENTER_JATENG[0], AppConstants.CENTER_JATENG[1]),
        zoom: 10,
      ),
      onMapCreated: (controller) => _mapController = controller,
      myLocationEnabled: true,
      markers: incidentsAsync.maybeWhen(
        data: (incidents) => incidents
            .map((i) => Marker(
                  markerId: MarkerId(i.id.toString()),
                  position: LatLng(i.latitude, i.longitude),
                  infoWindow: InfoWindow(title: i.title, snippet: i.disasterType),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => IncidentDetail(id: i.id))),
                ))
            .toSet(),
        orElse: () => <Marker>{},
      ),
    );
  }

  Widget _buildList(AsyncValue<List<Incident>> incidentsAsync) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: LatLng(AppConstants.CENTER_JATENG[0], AppConstants.CENTER_JATENG[1]),
        zoom: 10,
      ),
      onMapCreated: (controller) => _mapController = controller,
      myLocationEnabled: true,
      markers: incidentsAsync.maybeWhen(
        data: (incidents) => incidents
            .map((i) => Marker(
                  markerId: MarkerId(i.id.toString()),
                  position: LatLng(i.latitude, i.longitude),
                  infoWindow: InfoWindow(title: i.title, snippet: i.disasterType),
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
            return IncidentCard(incident: incident, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => IncidentDetail(id: incident.id))));
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildAnalytics(AsyncValue<Map<String, dynamic>> analyticsAsync) {
    return analyticsAsync.when(
      data: (data) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Ringkasan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _statCard('Total Insiden', data['total_incidents']?.toString() ?? '0'),
              _statCard('Aktif', data['active_incidents']?.toString() ?? '0'),
              _statCard('Relawan', data['total_volunteers']?.toString() ?? '0'),
              _statCard('Selesai', data['completed_incidents']?.toString() ?? '0'),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _statCard(String label, String value) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildNotifications() {
    return const Center(child: Text('Tidak ada notifikasi'));
  }
}