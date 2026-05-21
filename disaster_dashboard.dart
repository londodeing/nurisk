import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lottie/lottie.dart';

// Placeholder untuk layar Home
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSizes.p16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionLabel(label: "KPI UTAMA", subLabel: "COMMAND STATS"),
          _buildDynamicHeader(),
          const KpiGrid(), // Pindahkan Row KPI ke widget terpisah
          const SizedBox(height: AppSizes.p24),
          const SectionLabel(label: "PERINGATAN", subLabel: "SITUATIONAL ALERTS"),
          const AlertList(), // Pindahkan List Alert ke widget terpisah
        ],
      ),
    );
  }

  Widget _buildDynamicHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Selamat Pagi,", style: TextStyle(fontSize: 14, color: Colors.blueGrey)),
            Text("Commander", style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
          ],
        ),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF16A34A).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.notifications_none_rounded, color: Color(0xFF16A34A)),
        )
      ],
    );
  }

  Widget _buildWeatherScroll() {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          return Container(
            width: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                colors: [Colors.white, Colors.blue.withOpacity(0.05)],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.blue.withOpacity(0.1)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("${8 + index}:00", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const Icon(Icons.cloud, color: Colors.blue, size: 24),
                const Icon(Icons.cloud_queue_rounded, color: Colors.blue, size: 24),
                Text("${24 + index}°", style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildKPICard(String label, String value, Color color) {
  Widget _buildKPICard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 12),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color.withOpacity(0.7))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAlertCard(IconData icon, String title, String desc, Color bg, Color iconColor) {
    return Card(
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: iconColor),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 12)),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                Text(desc, style: TextStyle(fontSize: 12, color: Colors.grey[600], height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Implementasi Peta (MapsDisplay.jsx)
class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(color: Colors.blueGrey[50]),
        Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: NetworkImage("https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/110.36, -7.02,9/600x600?access_token=YOUR_TOKEN"),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Container(color: const Color(0xFF111827).withOpacity(0.4)),
        const Center(child: Text("Map Content (Leaflet/Google Maps Integration)")),
        Positioned(
          top: 20,
          top: 60,
          left: 20,
          right: 20,
          child: Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Icon(Icons.search, color: Colors.grey),
                  SizedBox(width: 10),
                  Text("Cari lokasi bencana...", style: TextStyle(color: Colors.grey)),
                ],
              ),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(40),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20)],
            ),
            child: const Row(
              children: [
                Icon(Icons.search_rounded, color: Color(0xFF16A34A)),
                SizedBox(width: 12),
                Text("Search incident area...", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Implementasi Lapor (PublicReport.jsx) - Diubah menjadi StatefulWidget
class PublicReportScreen extends StatefulWidget {
  const PublicReportScreen({super.key});

  @override
  State<PublicReportScreen> createState() => _PublicReportScreenState();
}

class _PublicReportScreenState extends State<PublicReportScreen> {
  // State untuk mengelola pilihan chip (opsional, bisa dikembangkan lebih lanjut)
  String? _selectedDisasterType;
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Buat Laporan Kejadian",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF111827)),
            "Emergency Report",
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF111827), letterSpacing: -0.5),
          ),
          const SizedBox(height: 8),
          const Text(
            "Berikan informasi akurat untuk mempercepat respon tim TRC.",
            style: TextStyle(fontSize: 14, color: Colors.grey),
            "Help TRC responders by providing valid info.",
            style: TextStyle(fontSize: 14, color: Colors.blueGrey),
          ),
          const SizedBox(height: 24),
          
          // Jenis Bencana
          const Text("Jenis Bencana", style: TextStyle(fontWeight: FontWeight.bold)),
          const Text("SELECT INCIDENT TYPE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.1)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: <Widget>[
              _buildChoiceChip("Banjir", Icons.water_drop, Colors.blue, 'Banjir'),
              _buildChoiceChip("Kebakaran", Icons.local_fire_department, Colors.red, 'Kebakaran'),
              _buildChoiceChip("Longsor", Icons.landslide, Colors.orange, 'Longsor'),
              _buildChoiceChip("Gempa", Icons.vibration, Colors.purple, 'Gempa'),
              _buildChoiceChip("Lainnya", Icons.more_horiz, Colors.grey, 'Lainnya'),
            ],
          ),
          const SizedBox(height: 24),

          // Lokasi
          _buildInputField(
            label: "Lokasi Kejadian",
            hint: "Contoh: Jl. Gajah Mada No. 10, Semarang",
            icon: Icons.location_on_outlined,
            label: "LOCATION",
            hint: "e.g. Jl. Gajah Mada No. 10, Semarang",
            icon: Icons.location_on_rounded,
          ),
          const SizedBox(height: 20),

          // Deskripsi
          _buildInputField(
            label: "Deskripsi Situasi",
            hint: "Ceritakan kondisi terkini dan kebutuhan mendesak...",
            icon: Icons.description_outlined,
            label: "SITUATION DESCRIPTION",
            hint: "Describe the current needs and situation...",
            icon: Icons.chat_bubble_rounded,
            maxLines: 4,
          ),
          const SizedBox(height: 24),

          // Upload Foto
          const Text("Foto Bukti Kejadian", style: TextStyle(fontWeight: FontWeight.bold)),
          const Text("EVIDENCE ATTACHMENT", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.1)),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            height: 120,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
              color: const Color(0xFF16A34A).withOpacity(0.05),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF16A34A).withOpacity(0.2), style: BorderStyle.solid),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_a_photo_outlined, size: 32, color: Colors.grey[600]),
                const Icon(Icons.add_a_photo_rounded, size: 32, color: Color(0xFF16A34A)),
                const SizedBox(height: 8),
                Text("Tap untuk unggah foto", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                Text("Add Photo Evidence", style: TextStyle(color: const Color(0xFF16A34A).withOpacity(0.8), fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Submit Button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.mediumImpact();
                _showSuccessDialog(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF16A34A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                elevation: 8,
                shadowColor: const Color(0xFF16A34A).withOpacity(0.4),
              ),
              child: const Text(
                "KIRIM LAPORAN SEKARANG",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                "SUBMIT URGENT REPORT",
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Colors.white, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChoiceChip(String label, IconData icon, Color color, String value) {
    return ChoiceChip(
      label: Text(label),
      avatar: Icon(icon, size: 16, color: color),
      selected: _selectedDisasterType == value,
      selectedColor: color.withOpacity(0.2), // Warna saat terpilih
      selectedColor: color.withOpacity(0.2),
      onSelected: (bool selected) {
        setState(() {
          _selectedDisasterType = selected ? value : null;
        });
      },
      backgroundColor: Colors.white, // Warna saat tidak terpilih
      shape: RoundedRectangleBorder(side: BorderSide(color: Colors.grey[300]!), borderRadius: BorderRadius.circular(20)),
      backgroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      shape: RoundedRectangleBorder(side: BorderSide(color: Colors.grey[200]!), borderRadius: BorderRadius.circular(14)),
    );
  }

  Widget _buildInputField({required String label, required String hint, required IconData icon, int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.1)),
        const SizedBox(height: 8),
        TextField(
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 14, color: Colors.grey),
            prefixIcon: Icon(icon, color: const Color(0xFF16A34A)),
            hintStyle: TextStyle(fontSize: 14, color: Colors.grey[400]),
            prefixIcon: Icon(icon, color: const Color(0xFF16A34A), size: 20),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.all(16),
            fillColor: Colors.grey[50],
            contentPadding: const EdgeInsets.all(20),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(color: Colors.grey[100]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: Color(0xFF16A34A), width: 2),
            ),
          ),
        ),
      ],
    );
  }

  void _showSuccessDialog(BuildContext context) {
    HapticFeedback.successOverridden();
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: '',
      transitionDuration: const Duration(milliseconds: 400),
      pageBuilder: (context, anim1, anim2) => const SizedBox.shrink(),
      transitionBuilder: (context, anim1, anim2, child) {
        return Transform.scale(
          scale: Curves.easeInOutBack.transform(anim1.value),
          child: FadeTransition(
            opacity: anim1,
            child: AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 10),
                  Lottie.network(
                    'https://assets10.lottiefiles.com/packages/lf20_pqnfmone.json',
                    width: 120,
                    height: 120,
                    repeat: false,
                  ),
                  const Text(
                    "Laporan Terkirim!",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF111827)),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Terima kasih atas laporan Anda. Tim TRC akan segera menindaklanjuti.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        Navigator.of(context).pop();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF16A34A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: const Text("Selesai", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class ResourceScreen extends StatelessWidget {
  const ResourceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text("Resource & Inventory Management"));
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const CircleAvatar(radius: 50, backgroundColor: Colors.green, child: Icon(Icons.person, size: 50, color: Colors.white)),
          const SizedBox(height: 16),
          const Text("Relawan NURisk", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const Text("Tim TRC Jawa Tengah", style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                colors: [Color(0xFF111827), Color(0xFF1F2937)],
              ),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF16A34A), width: 3),
                    image: const DecorationImage(image: NetworkImage("https://ui-avatars.com/api/?name=Relawan+NURisk&background=16A34A&color=fff"))
                  ),
                ),
                const SizedBox(width: 20),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Relawan NURisk", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                      Text("TRC Jawa Tengah ID: 8829", style: TextStyle(color: Colors.grey, fontSize: 12)),
                      SizedBox(height: 8),
                      Badge(
                        label: "VERIFIED PERSONNEL",
                        backgroundColor: Color(0xFF16A34A),
                        textColor: Colors.white,
                      )
                    ],
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 40),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text("Quick Actions", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              _buildActionButton(Icons.assignment_ind, "Misi Saya", Colors.blue),
              _buildActionButton(Icons.domain, "Assessment Gedung", Colors.orange),
              _buildActionButton(Icons.report_problem, "Assessment Kejadian", Colors.red),
              _buildActionButton(Icons.history, "Riwayat Lapor", Colors.teal),
              _buildActionButton(Icons.assignment_ind_rounded, "My Missions", Colors.blue),
              _buildActionButton(Icons.domain_rounded, "Building Assess", Colors.orange),
              _buildActionButton(Icons.report_problem_rounded, "Incident Assess", Colors.red),
              _buildActionButton(Icons.history_rounded, "Report History", Colors.teal),
            ],
          ),
          const SizedBox(height: 24),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text("Pengaturan Akun"),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text("Keluar", style: TextStyle(color: Colors.red)),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label, Color color) {
    return Material(
      color: color.withOpacity(0.1),
      borderRadius: BorderRadius.circular(16),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color),
              const SizedBox(height: 8),
              Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
              Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
            ],
          ),
        ),
      ),
    );
  }
}

// Placeholder untuk layar Missions
class MissionsScreen extends StatelessWidget {
  const MissionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('Missions Screen Content'),
    );
  }
}

// Widget utama untuk Dashboard Bencana
class DisasterDashboard extends StatefulWidget {
  const DisasterDashboard({super.key});

  @override
  State<DisasterDashboard> createState() => _DisasterDashboardState();
}

class _DisasterDashboardState extends State<DisasterDashboard> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    HomeScreen(),
    MapScreen(),
    PublicReportScreen(),
    ResourceScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _selectedIndex == 1 // Sembunyikan AppBar di peta jika ingin full screen
          ? null 
          : AppBar(
              elevation: 0,
              title: const Text('NURisk Hub', style: TextStyle(fontWeight: FontWeight.bold)),
              backgroundColor: const Color(0xFF111827),
              foregroundColor: Colors.white,
              centerTitle: false,
              title: const Text('NURisk Command', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -0.5)),
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF111827),
            ),
      body: _widgetOptions.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Map'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), activeIcon: Icon(Icons.add_circle), label: 'Lapor'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), activeIcon: Icon(Icons.inventory_2), label: 'Resource'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profil'),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: const Color(0xFF16A34A),
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        onTap: _onItemTapped,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Colors.grey[100]!, width: 1)),
        ),
        child: NavigationBar(
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFF16A34A).withOpacity(0.1),
          selectedIndex: _selectedIndex,
          onDestinationSelected: _onItemTapped,
          destinations: const [
            NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard_rounded, color: Color(0xFF16A34A)), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map_rounded, color: Color(0xFF16A34A)), label: 'Map'),
            NavigationDestination(icon: Icon(Icons.add_circle_outline), selectedIcon: Icon(Icons.add_circle_rounded, color: Color(0xFF16A34A)), label: 'Report'),
            NavigationDestination(icon: Icon(Icons.inventory_2_outlined), selectedIcon: Icon(Icons.inventory_2_rounded, color: Color(0xFF16A34A)), label: 'Resource'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person_rounded, color: Color(0xFF16A34A)), label: 'Profile'),
          ],
        ),
      ),
    );
  }

class Badge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;

  const Badge({super.key, required this.label, required this.backgroundColor, required this.textColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: backgroundColor, borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: textColor, fontSize: 10, fontWeight: FontWeight.w900)),
    );
  }
}
}