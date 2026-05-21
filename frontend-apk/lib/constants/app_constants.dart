/// NURisk Constants
/// ===============
/// Configuration constants from mainprd.md

class AppConstants {
  // ==========================================================
  // 1. Map Configuration
  // ==========================================================
  static const CENTER_JATENG = [-7.15, 110.14];
  static const JATENG_BOUNDS = {
    'latitude': -7.15,
    'longitude': 110.14,
    'latitudeDelta': 2.5,
    'longitudeDelta': 3.6,
  };

  static const CENTRAL_JAVA_BOUNDS = {
    'minLat': -7.9,
    'maxLat': -6.5,
    'minLng': 108.7,
    'maxLng': 111.5,
  };

  // ==========================================================
  // 2. Disaster Types (11 types)
  // ==========================================================
  static const List<String> DISASTER_TYPES = [
    'Banjir',
    'Banjir Bandang',
    'Cuaca Ekstrim',
    'Gelombang Ekstrim dan Abrasi',
    'Gempabumi',
    'Kebakaran Hutan dan Lahan',
    'Kekeringan',
    'Letusan Gunung Api',
    'Tanah Longsor',
    'Tsunami',
    'Likuefaksi',
  ];

  // ==========================================================
  // 3. Incident Status Flow
  // ==========================================================
  static const List<String> STATUS_FLOW = [
    'REPORTED',
    'VERIFIED',
    'ASSESSMENT',
    'COMMANDED',
    'ACTION',
    'COMPLETED',
  ];

  static const Map<String, String> STATUS_COLORS = {
    'REPORTED': '#64748b',
    'VERIFIED': '#3b82f6',
    'ASSESSMENT': '#eab308',
    'COMMANDED': '#f97316',
    'ACTION': '#22c55e',
    'COMPLETED': '#0f172a',
    'REJECTED': '#ef4444',
    'DISMISSED': '#6b7280',
  };

  static const Map<String, String> STATUS_LABELS = {
    'REPORTED': 'Dilaporkan',
    'VERIFIED': 'Terverifikasi',
    'ASSESSMENT': 'Penilaian',
    'COMMANDED': 'Ditugaskan',
    'ACTION': 'Tindakan',
    'COMPLETED': 'Selesai',
    'REJECTED': 'Ditolak',
    'DISMISSED': 'Dismissed',
  };

  // ==========================================================
  // 4. Priority Levels
  // ==========================================================
  static const Map<String, Map<String, dynamic>> PRIORITY_LEVELS = {
    'CRITICAL': {'label': 'Kritis', 'color': 0xFFdc2626, 'minScore': 1000},
    'HIGH': {'label': 'Tinggi', 'color': 0xFFf97316, 'minScore': 500},
    'MEDIUM': {'label': 'Sedang', 'color': 0xFFeab308, 'minScore': 200},
    'LOW': {'label': 'Rendah', 'color': 0xFF22c55e, 'minScore': 0},
  };

  // ==========================================================
  // 5. Need Categories
  // ==========================================================
  static const List<Map<String, String>> NEED_CATEGORIES = [
    {'id': 'sembako', 'label': 'Sembako', 'unit': 'Paket'},
    {'id': 'selimut', 'label': 'Selimut/Tikar', 'unit': 'Pcs'},
    {'id': 'medis', 'label': 'Obat-obatan', 'unit': 'Paket'},
    {'id': 'bayi', 'label': 'Susu & Popok', 'unit': 'Paket'},
    {'id': 'air', 'label': 'Air Bersih', 'unit': 'Tangki'},
    {'id': 'makanan', 'label': 'Makanan', 'unit': 'Paket'},
    {'id': 'pakaian', 'label': 'Pakaian', 'unit': 'Pcs'},
    {'id': 'tenda', 'label': 'Tenda', 'unit': 'Unit'},
  ];

  // ==========================================================
  // 6. Role Definitions
  // ==========================================================
  static const Map<String, Map<String, dynamic>> ROLES = {
    'SUPER_ADMIN': {'level': 100, 'label': 'Super Admin'},
    'ADMIN_PWNU': {'level': 90, 'label': 'Admin PWNU'},
    'PWNU': {'level': 85, 'label': 'PWNU'},
    'STAFF_PWNU': {'level': 80, 'label': 'Staff PWNU'},
    'COMMANDER': {'level': 75, 'label': 'Komandan'},
    'ADMIN_PCNU': {'level': 70, 'label': 'Admin PCNU'},
    'STAFF_PCNU': {'level': 60, 'label': 'Staff PCNU'},
    'FIELD_STAFF': {'level': 50, 'label': 'Staff Lapangan'},
    'RELAWAN': {'level': 40, 'label': 'Relawan'},
    'PUBLIC': {'level': 10, 'label': 'Publik'},
  };

  // ==========================================================
  // 7. Central Java Regions (35 Kabupaten/Kota)
  // ==========================================================
  static const List<String> KAB_JATENG = [
    // Kabupaten (29)
    'Banjarnegara', 'Banyumas', 'Batang', 'Blora', 'Boyolali',
    'Brebes', 'Cilacap', 'Demak', 'Grobogan', 'Jepara',
    'Karanganyar', 'Kebumen', 'Kendal', 'Klaten', 'Kudus',
    'Magelang', 'Pati', 'Pekalongan', 'Pemalang', 'Purbalingga',
    'Purworejo', 'Rembang', 'Semarang', 'Sragen', 'Sukoharjo',
    'Tegal', 'Temanggung', 'Wonogiri', 'Wonosobo',
    // Kota (6)
    'Kota Magelang', 'Kota Pekalongan', 'Kota Salatiga',
    'Kota Semarang', 'Kota Surakarta', 'Kota Tegal',
  ];

  // ==========================================================
  // 8. Volcano Locations
  // ==========================================================
  static const Map<String, Map<String, dynamic>> VOLCANOES = {
    'MERAPI': {'name': 'Merapi', 'code': 'MER', 'lat': -7.54, 'lng': 110.446, 'regency': 'Magelang'},
    'SEMERU': {'name': 'Semeru', 'code': 'SMR', 'lat': -8.108, 'lng': 112.922, 'regency': 'Lumajang'},
    'SLAMET': {'name': 'Slamet', 'code': 'SLA', 'lat': -7.242, 'lng': 109.208, 'regency': 'Pemalang'},
    'DIENG': {'name': 'Dieng', 'code': 'DIE', 'lat': -7.2, 'lng': 109.92, 'regency': 'Banjarnegara'},
    'SUMBING': {'name': 'Sumbing', 'code': 'SBG', 'lat': -7.384, 'lng': 110.07, 'regency': 'Temanggung'},
    'SUNDORO': {'name': 'Sundoro', 'code': 'SUN', 'lat': -7.3, 'lng': 109.992, 'regency': 'Wonosobo'},
  };

  // ==========================================================
  // 9. API Configuration
  // ==========================================================
  static const String BASE_URL = 'http://localhost:7860/api';
  static const String SOCKET_URL = 'http://localhost:7860';
  static const int API_TIMEOUT = 30000;

  // ==========================================================
  // 10. Storage Keys
  // ==========================================================
  static const String KEY_AUTH_TOKEN = 'auth_token';
  static const String KEY_USER_DATA = 'user_data';
  static const String KEY_REFRESH_TOKEN = 'refresh_token';
  static const String KEY_SETTINGS = 'app_settings';
  static const String KEY_LAST_LAT = 'last_latitude';
  static const String KEY_LAST_LNG = 'last_longitude';
  static const String KEY_LAST_ALT = 'last_altitude';
  static const String KEY_LAST_ACC = 'last_accuracy';
}