/**
 * @deprecated Use SDK from @nurisk/sdk instead.
 *             Migrate to: import { sdk } from '@/services/api'
 */
/**
 * Location Service
 * Native geolocation via Capacitor with web fallback
 */

import { Geolocation } from '@capacitor/geolocation';

// =============================================================================
// Types
// =============================================================================

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface Location extends LocationCoords {
  timestamp: number;
}

export interface WatchPositionCallback {
  (location: Location): void;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
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
// Permission
// =============================================================================

/**
 * Check location permission
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted';
    }
    // Web fallback
    if ('geolocation' in navigator) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    }
    // Web fallback - browser will prompt
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// Get Current Position
// =============================================================================

/**
 * Get current position
 */
export async function getCurrentLocation(
  options: GeolocationOptions = {}
): Promise<Location> {
  const {
    enableHighAccuracy = true,
    timeout = 30000,
    maximumAge = 60000,
  } = options;

  // Check permission first
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  try {
    if (isNativePlatform()) {
      // Use Capacitor Geolocation
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude ?? undefined,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        timestamp: position.timestamp,
      };
    } else {
      // Web fallback using navigator.geolocation
      return getCurrentLocationWeb(options);
    }
  } catch (error) {
    console.error('Get location error:', error);
    throw error;
  }
}

/**
 * Web fallback for getCurrentPosition
 */
function getCurrentLocationWeb(options: GeolocationOptions): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude ?? undefined,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      }
    );
  });
}

// =============================================================================
// Watch Position
// =============================================================================

let watchId: string | number | null = null;
let watchCallback: WatchPositionCallback | null = null;

/**
 * Watch position changes
 */
export async function watchPosition(
  callback: WatchPositionCallback,
  options: GeolocationOptions = {}
): Promise<string> {
  const {
    enableHighAccuracy = true,
    timeout = 30000,
    maximumAge = 10000,
  } = options;

  // Check permission first
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  // Stop any existing watch
  if (watchId !== null) {
    await clearWatch();
  }

  watchCallback = callback;

  try {
    if (isNativePlatform()) {
      // Use Capacitor Geolocation
      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
        (position, err) => {
          if (err) {
            console.error('Watch position error:', err);
            return;
          }
          if (watchCallback && position) {
            watchCallback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude ?? undefined,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ?? undefined,
              timestamp: position.timestamp,
            });
          }
        }
      );
    } else {
      // Web fallback
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (watchCallback) {
            watchCallback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude ?? undefined,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ?? undefined,
              timestamp: position.timestamp,
            });
          }
        },
        (error) => {
          console.error('Watch position error:', error);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge,
        }
      );
    }

    return String(watchId);
  } catch (error) {
    console.error('Watch position error:', error);
    throw error;
  }
}

/**
 * Clear watch
 */
export async function clearWatch(): Promise<void> {
  if (watchId !== null) {
    try {
      if (isNativePlatform()) {
        await Geolocation.clearWatch({ id: watchId as string });
      } else {
        navigator.geolocation.clearWatch(watchId as number);
      }
    } catch (error) {
      console.error('Clear watch error:', error);
    }
    watchId = null;
    watchCallback = null;
  }
}

// =============================================================================
// Distance Calculation
// =============================================================================

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  from: LocationCoords,
  to: LocationCoords
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate bearing between two points
 */
export function calculateBearing(from: LocationCoords, to: LocationCoords): number {
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
}

// =============================================================================
// Format
// =============================================================================

/**
 * Format location as string
 */
export function formatLocation(location: LocationCoords): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format accuracy for display
 */
export function formatAccuracy(meters: number): string {
  if (meters < 10) {
    return 'High';
  }
  if (meters < 50) {
    return 'Medium';
  }
  return 'Low';
}