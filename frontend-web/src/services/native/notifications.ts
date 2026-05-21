/**
 * @deprecated Use SDK from @nurisk/sdk instead.
 *             Migrate to: import { sdk } from '@/services/api'
 */
/**
 * Notifications Service
 * Push notifications via Capacitor with web fallback
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

// =============================================================================
// Types
// =============================================================================

export interface NotificationPayload {
  id?: string | number;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

export interface NotificationCallback {
  (notification: NotificationPayload): void;
}

// =============================================================================
// Utility: Check Platform
// =============================================================================

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return (
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

// =============================================================================
// Push Notifications (FCM)
// =============================================================================

/**
 * Check push notification permission
 */
export async function checkPushPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const permission = await PushNotifications.checkPermissions();
      return permission.receive === 'granted';
    }
    // Web fallback - Notification API
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const permission = await PushNotifications.requestPermissions();
      return permission.receive === 'granted';
    }
    // Web fallback - Notification API
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Register for push notifications
 */
export async function registerPush(): Promise<string> {
  const hasPermission = await requestPushPermission();
  if (!hasPermission) {
    throw new Error('Push notification permission denied');
  }

  try {
    if (isNativePlatform()) {
      // Use Capacitor Push Notifications
      const result = await PushNotifications.register();
      return result.deviceToken;
    } else {
      // Web fallback - no token needed
      return 'web-fallback-token';
    }
  } catch (error) {
    console.error('Register push error:', error);
    throw error;
  }
}

/**
 * Unregister from push notifications
 */
export async function unregisterPush(): Promise<void> {
  try {
    if (isNativePlatform()) {
      await PushNotifications.unregister();
    }
    // Web fallback - nothing to do
  } catch (error) {
    console.error('Unregister push error:', error);
  }
}

/**
 * Get device token
 */
export async function getDeviceToken(): Promise<string | null> {
  try {
    if (isNativePlatform()) {
      const token = await PushNotifications.getDeviceToken();
      return token?.token || null;
    }
    // Web fallback
    return 'web-fallback-token';
  } catch {
    return null;
  }
}

// =============================================================================
// Push Notification Listeners
// =============================================================================

let pushCallback: NotificationCallback | null = null;

/**
 * Add push notification listener
 */
export async function addPushListener(
  callback: NotificationCallback
): Promise<void> {
  pushCallback = callback;

  try {
    if (isNativePlatform()) {
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        if (pushCallback) {
          pushCallback({
            id: notification.id,
            title: notification.title,
            body: notification.body,
            data: notification.data,
          });
        }
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        if (pushCallback) {
          pushCallback({
            id: notification.notificationId,
            title: '',
            body: '',
            data: notification.notificationData,
          });
        }
      });
    } else {
      // Web fallback - Service Worker would handle this
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification = async () => {};
      }
    }
  } catch (error) {
    console.error('Add push listener error:', error);
  }
}

/**
 * Remove push notification listener
 */
export async function removePushListener(): Promise<void> {
  pushCallback = null;

  try {
    if (isNativePlatform()) {
      await PushNotifications.removeAllListeners();
    }
    // Web fallback - nothing to do
  } catch (error) {
    console.error('Remove push listener error:', error);
  }
}

// =============================================================================
// Local Notifications
// =============================================================================

/**
 * Schedule local notification
 */
export async function scheduleLocalNotification(
  payload: NotificationPayload
): Promise<string> {
  try {
    if (isNativePlatform()) {
      // Use Capacitor Local Notifications
      const result = await LocalNotifications.schedule({
        notifications: [
          {
            id: typeof payload.id === 'string' ? parseInt(payload.id) : (payload.id as number) || Math.floor(Math.random() * 1000),
            title: payload.title,
            body: payload.body || '',
            data: payload.data,
            channelId: payload.channelId || 'default',
          },
        ],
      });
      return String(result.notifications?.[0]?.id || '');
    } else {
      // Web fallback - show immediately
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/icon.png',
        });
      }
      return String(Date.now());
    }
  } catch (error) {
    console.error('Schedule local notification error:', error);
    throw error;
  }
}

/**
 * Cancel local notification
 */
export async function cancelLocalNotification(id: string): Promise<void> {
  try {
    if (isNativePlatform()) {
      await LocalNotifications.cancel({
        notifications: [{ id: parseInt(id) }],
      });
    }
    // Web fallback - nothing to do
  } catch (error) {
    console.error('Cancel local notification error:', error);
  }
}

/**
 * Cancel all local notifications
 */
export async function cancelAllLocalNotifications(): Promise<void> {
  try {
    if (isNativePlatform()) {
      await LocalNotifications.cancelAll();
    }
    // Web fallback - nothing to do
  } catch (error) {
    console.error('Cancel all local notifications error:', error);
  }
}

/**
 * Get pending local notifications
 */
export async function getPendingNotifications(): Promise<NotificationPayload[]> {
  try {
    if (isNativePlatform()) {
      const result = await LocalNotifications.getPending();
      return result.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        data: n.data,
      }));
    }
    // Web fallback
    return [];
  } catch {
    return [];
  }
}

// =============================================================================
// Badge
// =============================================================================

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    if (isNativePlatform()) {
      // Note: Badge API may not be available on all platforms
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Capacitor?.setBadgeCount?.(count);
    }
    // Web fallback - not supported
  } catch (error) {
    console.error('Set badge count error:', error);
  }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    if (isNativePlatform()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).Capacitor?.getBadgeCount?.() || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// =============================================================================
// Utility
// =============================================================================

/**
 * Show notification (convenience function)
 */
export async function showNotification(
  title: string,
  body?: string,
  data?: Record<string, unknown>
): Promise<string> {
  return scheduleLocalNotification({ title, body, data });
}

/**
 * Show incident notification
 */
export async function showIncidentNotification(
  incidentType: string,
  location: string
): Promise<string> {
  return showNotification(
    `Laporan Insiden Baru`,
    `${incidentType} di ${location}`,
    { type: 'incident', incidentType, location }
  );
}

/**
 * Show alert notification
 */
export async function showAlertNotification(
  title: string,
  message: string
): Promise<string> {
  return showNotification(title, message, { type: 'alert' });
}