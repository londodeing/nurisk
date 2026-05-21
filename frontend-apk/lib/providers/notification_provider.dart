import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/notification_repository.dart';

/// Notification Provider
/// =====================
/// Push notification state management

// ==========================================================
// Repository Provider
// ==========================================================

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository();
});

// ==========================================================
// Notifications List
// ==========================================================

final notificationsProvider = StateNotifierProvider<NotificationsNotifier, AsyncValue<List<AppNotification>>>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return NotificationsNotifier(repository);
});

class NotificationsNotifier extends StateNotifier<AsyncValue<List<AppNotification>>> {
  final NotificationRepository _repository;

  NotificationsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadNotifications();
  }

  Future<void> loadNotifications({NotificationFilters? filters}) async {
    state = const AsyncValue.loading();
    try {
      final notifications = await _repository.getNotifications(filters: filters);
      if (notifications.isEmpty) {
        state = const AsyncValue.data(<AppNotification>[]);
      } else {
        state = AsyncValue.data(notifications);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await loadNotifications();
  }

  Future<void> markRead(int id) async {
    try {
      await _repository.markRead(id);
      // Update local state
      final current = state.valueOrNull;
      if (current != null) {
        final updated = current.map((n) {
          if (n.id == id) {
            return AppNotification(
              id: n.id,
              title: n.title,
              body: n.body,
              type: n.type,
              data: n.data,
              isRead: true,
              createdAt: n.createdAt,
              readAt: DateTime.now(),
            );
          }
          return n;
        }).toList();
        state = AsyncValue.data(updated);
      }
    } catch (e) {
      // Ignore error, UI will show current state
    }
  }

  Future<void> markAllRead() async {
    try {
      await _repository.markAllRead();
      // Update local state
      final current = state.valueOrNull;
      if (current != null) {
        final now = DateTime.now();
        final updated = current.map((n) {
          return AppNotification(
            id: n.id,
            title: n.title,
            body: n.body,
            type: n.type,
            data: n.data,
            isRead: true,
            createdAt: n.createdAt,
            readAt: now,
          );
        }).toList();
        state = AsyncValue.data(updated);
      }
    } catch (e) {
      // Ignore error
    }
  }
}

// ==========================================================
// Unread Count
// ==========================================================

final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.valueOrNull?.where((n) => !n.isRead).length ?? 0;
});

// ==========================================================
// Unread Badge Stream
// ==========================================================

final unreadBadgeProvider = Provider<int>((ref) {
  final count = ref.watch(unreadNotificationCountProvider);
  return count;
});

// ==========================================================
// Notification Filter
// ==========================================================

final notificationFilterProvider = StateProvider<NotificationFilters>((ref) {
  return NotificationFilters();
});

// ==========================================================
// Notification by Type
// ==========================================================

final notificationsByTypeProvider = Provider.family<List<AppNotification>, String>((ref, type) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.valueOrNull?.where((n) => n.type == type).toList() ?? [];
});

// ==========================================================
// Recent Notifications
// ==========================================================

final recentNotificationsProvider = Provider<List<AppNotification>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  final data = notifications.valueOrNull;
  if (data == null) return [];

  // Sort by createdAt descending
  final sorted = List<AppNotification>.from(data);
  sorted.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return sorted.take(10).toList();
});

// ==========================================================
// Device Registration
// ==========================================================

final deviceRegistrationProvider = Provider<void>((ref) {
  // This should be called on app start with actual device data
  // Usage: ref.read(deviceRegistrationProvider) after getting device token
});

// ==========================================================
// Notification Actions
// ==========================================================

class NotificationActions {
  final NotificationRepository _repository;

  NotificationActions(this._repository);

  Future<void> markRead(int id) async {
    await _repository.markRead(id);
  }

  Future<void> markAllRead() async {
    await _repository.markAllRead();
  }

  Future<void> registerDevice(DeviceRegistration data) async {
    await _repository.registerDevice(data);
  }

  Future<void> unregisterDevice(String deviceId) async {
    await _repository.unregisterDevice(deviceId);
  }
}

final notificationActionsProvider = Provider<NotificationActions>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return NotificationActions(repository);
});