import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/one_hand_navigation.dart';
import 'public_dashboard.dart';
import 'incident_report.dart';
import 'voice_report_screen.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';

/// One-hand operation app shell
/// - Bottom navigation (max 5 items)
/// - Primary actions in thumb reach zone (bottom 60%)
/// - Bottom sheets for secondary actions
class OneHandAppShell extends StatefulWidget {
  const OneHandAppShell({super.key});

  @override
  State<OneHandAppShell> createState() => _OneHandAppShellState();
}

class _OneHandAppShellState extends State<OneHandAppShell> {
  int _currentIndex = 0;

  final List<OneHandNavItem> _navItems = const [
    OneHandNavItem(
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
      label: 'Beranda',
    ),
    OneHandNavItem(
      icon: Icons.add_alert_outlined,
      selectedIcon: Icons.add_alert,
      label: 'Lapor',
    ),
    OneHandNavItem(
      icon: Icons.mic_none,
      selectedIcon: Icons.mic,
      label: 'Suara',
    ),
    OneHandNavItem(
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
      label: 'Profil',
    ),
    OneHandNavItem(
      icon: Icons.settings_outlined,
      selectedIcon: Icons.settings,
      label: 'Setelan',
    ),
  ];

  final List<Widget> _screens = const [
    PublicDashboard(),
    IncidentReportScreen(),
    VoiceReportScreen(),
    ProfileScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: OneHandBottomNav(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: _navItems,
      ),
      // Floating action button in thumb reach zone
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () => _showQuickActions(context),
              icon: const Icon(Icons.add),
              label: const Text('Lapor'),
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Colors.white,
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  void _showQuickActions(BuildContext context) {
    OneHandBottomSheet.show(
      context: context,
      title: 'Pilih Jenis Laporan',
      child: Column(
        children: [
          // Quick report options in thumb reach zone
          OneHandActionCard(
            label: 'Laporan Suara',
            subtitle: 'Rekam dengan suara',
            icon: Icons.mic,
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentIndex = 2);
            },
          ),
          const SizedBox(height: 12),
          OneHandActionCard(
            label: 'Laporan Teks',
            subtitle: 'Isi formulir manual',
            icon: Icons.edit,
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentIndex = 1);
            },
          ),
          const SizedBox(height: 12),
          OneHandActionCard(
            label: 'Panic Button',
            subtitle: 'Kirim sinyal darurat',
            icon: Icons.sos,
            color: Colors.red,
            onTap: () {
              Navigator.pop(context);
              _showPanicConfirmation(context);
            },
          ),
        ],
      ),
      actions: [
        OneHandActionButton(
          label: 'Batal',
          onPressed: () => Navigator.pop(context),
        ),
      ],
    );
  }

  void _showPanicConfirmation(BuildContext context) {
    OneHandBottomSheet.show(
      context: context,
      title: 'Kirim Panic Alert?',
      child: Column(
        children: [
          const Icon(
            Icons.sos,
            size: 64,
            color: Colors.red,
          ),
          const SizedBox(height: 16),
          const Text(
            'Ini akan mengirim sinyal darurat ke semua volunteer terdekat.',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Lokasi Anda akan dikirim.',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
      actions: [
        OneHandActionButton(
          label: 'Batal',
          onPressed: () => Navigator.pop(context),
        ),
        OneHandActionButton(
          label: 'KIRIM',
          isPrimary: true,
          isDestructive: true,
          onPressed: () {
            Navigator.pop(context);
            // TODO: Trigger panic alert
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Panic alert terkirim'),
                backgroundColor: Colors.red,
              ),
            );
          },
        ),
      ],
    );
  }
}

/// Home screen with one-hand optimized layout
class OneHandHomeScreen extends StatelessWidget {
  const OneHandHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nurisk'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => _showNotifications(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status card - thumb reach zone
            _buildStatusCard(context),
            const SizedBox(height: 24),

            // Quick actions - thumb reach zone
            const Text(
              'Aksi Cepat',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildQuickActions(context),
            const SizedBox(height: 24),

            // Recent incidents
            const Text(
              'Insiden Terdekat',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildRecentIncidents(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              Icons.check_circle,
              color: Theme.of(context).colorScheme.primary,
              size: 32,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Semua Sistem Normal',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Tidak ada insiden aktif',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      children: [
        // Primary actions in thumb reach zone
        OneHandActionCard(
          label: 'Lapor Bencana',
          subtitle: 'Rekam & laporkan insiden',
          icon: Icons.warning_amber,
          onTap: () {},
          isLarge: true,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OneHandActionCard(
                label: 'Suara',
                subtitle: 'Laporan suara',
                icon: Icons.mic,
                onTap: () {},
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OneHandActionCard(
                label: 'Peta',
                subtitle: 'Lihat risiko',
                icon: Icons.map,
                onTap: () {},
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentIncidents(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.water_drop, color: Colors.blue),
        title: const Text('Banjir di Jakarta Selatan'),
        subtitle: const Text('2 jam yang lalu'),
        trailing: const Chip(label: Text('AKTIF')),
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    OneHandBottomSheet.show(
      context: context,
      title: 'Notifikasi',
      child: ListView(
        shrinkWrap: true,
        children: [
          ListTile(
            leading: const Icon(Icons.info),
            title: const Text('Sistem beroperasi normal'),
            subtitle: const Text('5 menit yang lalu'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.warning, color: Colors.orange),
            title: const Text('Peringatan cuaca'),
            subtitle: const Text('1 jam yang lalu'),
          ),
        ],
      ),
    );
  }
}