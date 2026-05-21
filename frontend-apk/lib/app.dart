import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'constants/app_constants.dart';
import 'screens/splash_screen.dart';
import 'screens/public_dashboard.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/volunteer_dashboard.dart';
import 'screens/admin_dashboard.dart';
import 'screens/incident_detail.dart';
import 'screens/incident_report.dart';
import 'screens/profile_screen.dart';
import 'screens/settings_screen.dart';
import 'providers/auth_provider.dart';

class NURiskApp extends ConsumerWidget {
  const NURiskApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'NURisk',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0f766e),
          brightness: Brightness.light,
        ),
        fontFamily: 'Roboto',
      ),
      home: authState.when(
        data: (user) => user != null ? _getDashboard(user.role) : const PublicDashboard(),
        loading: () => const SplashScreen(),
        error: (_, __) => const PublicDashboard(),
      ),
      routes: {
        '/public': (context) => const PublicDashboard(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/incident': (context) => const IncidentReportScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/settings': (context) => const SettingsScreen(),
      },
    );
  }

  Widget _getDashboard(String? role) {
    if (role == null) return const PublicDashboard();
    
    final adminRoles = ['ADMIN_PWNU', 'PWNU', 'STAFF_PWNU', 'COMMANDER', 'ADMIN_PCNU'];
    final volunteerRoles = ['FIELD_STAFF', 'RELAWAN'];
    
    if (adminRoles.contains(role)) {
      return const AdminDashboard();
    } else if (volunteerRoles.contains(role)) {
      return const VolunteerDashboard();
    }
    return const PublicDashboard();
  }
}