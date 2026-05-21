import 'package:flutter/material.dart';

/// Emergency mode theme
/// - High contrast colors (black/yellow/red)
/// - Large touch targets (min 64x64dp)
/// - Minimal UI
class EmergencyTheme {
  /// Emergency mode theme data
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // High contrast colors
      colorScheme: const ColorScheme.dark(
        primary: Colors.yellow,
        secondary: Colors.red,
        surface: Colors.black,
        error: Colors.red,
        onPrimary: Colors.black,
        onSecondary: Colors.white,
        onSurface: Colors.white,
        onError: Colors.white,
      ),
      
      // Scaffold background
      scaffoldBackgroundColor: Colors.black,
      
      // App bar - minimal
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.black,
        foregroundColor: Colors.yellow,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.yellow,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      
      // Text theme - high contrast
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        displayMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        displaySmall: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        headlineLarge: TextStyle(color: Colors.yellow, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: Colors.yellow, fontWeight: FontWeight.bold),
        headlineSmall: TextStyle(color: Colors.yellow, fontWeight: FontWeight.bold),
        titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        titleMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        titleSmall: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(color: Colors.white, fontSize: 18),
        bodyMedium: TextStyle(color: Colors.white, fontSize: 16),
        bodySmall: TextStyle(color: Colors.white70, fontSize: 14),
        labelLarge: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        labelMedium: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        labelSmall: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
      ),
      
      // Button themes - large touch targets
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.yellow,
          foregroundColor: Colors.black,
          minimumSize: const Size(64, 64),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.yellow,
          minimumSize: const Size(64, 64),
          side: const BorderSide(color: Colors.yellow, width: 2),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: Colors.yellow,
          minimumSize: const Size(64, 64),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      
      // Floating action button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
        largeSizeConstraints: BoxConstraints.tightFor(width: 72, height: 72),
      ),
      
      // Card theme
      cardTheme: const CardThemeData(
        color: Colors.black,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: Colors.yellow, width: 2),
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
      ),
      
      // Input decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.black,
        border: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.yellow, width: 2),
          borderRadius: BorderRadius.circular(8),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.yellow, width: 2),
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.red, width: 3),
          borderRadius: BorderRadius.circular(8),
        ),
        labelStyle: const TextStyle(color: Colors.yellow, fontSize: 16),
        hintStyle: const TextStyle(color: Colors.white70),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      
      // Icon theme
      iconTheme: const IconThemeData(
        color: Colors.yellow,
        size: 28,
      ),
      
      // Divider
      dividerTheme: const DividerThemeData(
        color: Colors.yellow,
        thickness: 1,
      ),
      
      // Bottom navigation - hidden in emergency mode
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.yellow,
        unselectedItemColor: Colors.white54,
        showSelectedLabels: true,
        showUnselectedLabels: true,
      ),
      
      // Navigation bar - hidden in emergency mode
      navigationBarTheme: const NavigationBarThemeData(
        backgroundColor: Colors.black,
        indicatorColor: Colors.yellow,
        labelTextStyle: WidgetStatePropertyAll(
          TextStyle(color: Colors.yellow, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

/// Extension to check if we're in emergency mode
extension EmergencyModeExtensions on BuildContext {
  /// Check if emergency mode is active
  bool get isEmergencyMode {
    // This would check the provider
    // Implemented in the actual app
    return false;
  }
}