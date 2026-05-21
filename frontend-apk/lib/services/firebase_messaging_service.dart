import 'dart:convert';
import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Firebase Cloud Messaging service
/// Handles push notifications for the app
class FirebaseMessagingService {
  static final FirebaseMessaging _instance = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  static const String _fcmTokenKey = 'fcm_token';
  static const String _permissionAskedKey = 'notification_permission_asked';

  /// Get FirebaseMessaging instance
  static FirebaseMessaging get instance => _instance;

  /// Initialize Firebase Messaging
  static Future<void> initialize() async {
    // Initialize local notifications
    await _initLocalNotifications();

    // Request permission
    await _requestPermission();

    // Get FCM token
    final token = await _instance.getToken();
    if (token != null) {
      await _saveToken(token);
    }

    // Listen for token refresh
    _instance.onTokenRefresh.listen((token) async {
      await _saveToken(token);
    });

    // Listen for foreground messages
    _instance.onMessage.listen(_onMessage);

    // Register background handler
    await _instance.setAutoInitEnabled(true);
  }

  /// Initialize local notifications
  static Future<void> _initLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationResponse,
    );
  }

  /// Request notification permission
  static Future<bool> _requestPermission() async {
    final prefs = await SharedPreferences.getInstance();

    // Check if already asked
    final alreadyAsked = prefs.getBool(_permissionAskedKey) ?? false;
    if (alreadyAsked) return true;

    // Request permission
    final settings = await _instance.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    await prefs.setBool(_permissionAskedKey, true);

    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  /// Handle foreground message
  static Future<void> _onMessage(RemoteMessage message) async {
    final notification = message.notification;
    final android = message.notification?.android;

    if (notification != null) {
      // Show local notification
      await _showLocalNotification(
        id: message.hashCode,
        title: notification.title ?? 'NURisk',
        body: notification.body ?? '',
        payload: message.data,
      );
    }
  }

  /// Show local notification
  static Future<void> _showLocalNotification({
    required int id,
    required String title,
    required String body,
    Map<String, dynamic>? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'nurisk_channel',
      'NURisk Notifications',
      channelDescription: 'Push notifications for NURisk',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      id,
      title,
      body,
      details,
      payload: payload != null ? jsonEncode(payload) : null,
    );
  }

  /// Handle notification tap
  static void _onNotificationResponse(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      // Handle payload - navigate to relevant screen
      // This would integrate with navigation service
    }
  }

  /// Save FCM token
  static Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_fcmTokenKey, token);
  }

  /// Get FCM token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_fcmTokenKey);
  }

  /// Subscribe to topic
  static Future<void> subscribeToTopic(String topic) async {
    await _instance.subscribeToTopic(topic);
  }

  /// Unsubscribe from topic
  static Future<void> unsubscribeFromTopic(String topic) async {
    await _instance.unsubscribeFromTopic(topic);
  }
}

/// Background message handler (must be top-level function)
/// Register this in main.dart
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Store in local cache
  await _storeBackgroundNotification(message);

  // Show system notification
  await _showBackgroundNotification(message);
}

/// Store background notification data
static Future<void> _storeBackgroundNotification(RemoteMessage message) async {
  final prefs = await SharedPreferences.getInstance();
  final key = 'background_notification_${DateTime.now().millisecondsSinceEpoch}';
  
  await prefs.setString(key, jsonEncode({
    'data': message.data,
    'notification': message.notification?.toMap(),
    'timestamp': DateTime.now().toIso8601String(),
  }));

  // Keep only last 10 background notifications
  await _cleanupOldBackgroundNotifications(prefs);
}

/// Cleanup old background notifications
static Future<void> _cleanupOldBackgroundNotifications(SharedPreferences prefs) async {
  final keys = prefs.getKeys().where((k) => k.startsWith('background_notification_')).toList();
  if (keys.length > 10) {
    keys.sort();
    for (var i = 0; i < keys.length - 10; i++) {
      await prefs.remove(keys[i]);
    }
  }
}

/// Show background notification
static Future<void> _showBackgroundNotification(RemoteMessage message) async {
  // This runs in isolate, need to initialize notifications
  if (Platform.isAndroid) {
    final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
    
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);
    await flutterLocalNotificationsPlugin.initialize(initSettings);

    const androidDetails = AndroidNotificationDetails(
      'nurisk_background_channel',
      'NURisk Background',
      channelDescription: 'Background notifications',
      importance: Importance.high,
      priority: Priority.high,
    );

    const details = NotificationDetails(android: androidDetails);

    await flutterLocalNotificationsPlugin.show(
      message.hashCode,
      message.notification?.title ?? 'NURisk',
      message.notification?.body ?? '',
      details,
    );
  }
}

/// Get background notifications
static Future<List<Map<String, dynamic>>> getBackgroundNotifications() async {
  final prefs = await SharedPreferences.getInstance();
  final keys = prefs.getKeys().where((k) => k.startsWith('background_notification_')).toList();
  
  final notifications = <Map<String, dynamic>>[];
  for (final key in keys) {
    final value = prefs.getString(key);
    if (value != null) {
      notifications.add(jsonDecode(value) as Map<String, dynamic>);
    }
  }
  
  return notifications;
}

/// Clear background notifications
static Future<void> clearBackgroundNotifications() async {
  final prefs = await SharedPreferences.getInstance();
  final keys = prefs.getKeys().where((k) => k.startsWith('background_notification_')).toList();
  
  for (final key in keys) {
    await prefs.remove(key);
  }
}