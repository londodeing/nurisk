/**
 * useNativeLocation Hook
 * Location functionality with web fallback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getCurrentLocation,
  watchPosition,
  clearWatch,
  checkLocationPermission,
  requestLocationPermission,
  isNativePlatform,
  calculateDistance,
  calculateBearing,
  formatLocation,
  formatDistance,
  formatAccuracy,
  type Location,
  type LocationCoords,
  type GeolocationOptions,
} from '@/services/native/location';

// =============================================================================
// Hook
// =============================================================================

export function useNativeLocation(options: GeolocationOptions = {}) {
  const [location, setLocation] = useState<Location | null>(null);
  const [watchLocations, setWatchLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<string | null>(null);

  /**
   * Get current location
   */
  const getLocation = useCallback(async (): Promise<Location | null> => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getCurrentLocation(options);
      setLocation(loc);
      return loc;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  /**
   * Start watching location
   */
  const startWatching = useCallback(async () => {
    if (watching) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const id = await watchPosition(
        (loc) => {
          setLocation(loc);
          setWatchLocations((prev) => [...prev.slice(-99), loc]);
        },
        options
      );
      watchIdRef.current = id;
      setWatching(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to watch location';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [watching, options.enableHighAccuracy, options.timeout, options.maximumAge]);

  /**
   * Stop watching location
   */
  const stopWatching = useCallback(async () => {
    try {
      await clearWatch();
      watchIdRef.current = null;
      setWatching(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to stop watching';
      setError(message);
    }
  }, []);

  /**
   * Clear watch history
   */
  const clearHistory = useCallback(() => {
    setWatchLocations([]);
  }, []);

  /**
   * Check permission
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    return checkLocationPermission();
  }, []);

  /**
   * Request permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return requestLocationPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watching) {
        clearWatch();
      }
    };
  }, [watching]);

  return {
    location,
    watchLocations,
    loading,
    watching,
    error,
    isNative: isNativePlatform(),
    getLocation,
    startWatching,
    stopWatching,
    clearHistory,
    checkPermission,
    requestPermission,
    // Utility functions
    calculateDistance,
    calculateBearing,
    formatLocation,
    formatDistance,
    formatAccuracy,
  };
}

// =============================================================================
// Single Location Hook (for one-time fetch)
// =============================================================================

export function useLocationOneShot(options: GeolocationOptions = {}) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocation() {
      setLoading(true);
      setError(null);

      try {
        const loc = await getCurrentLocation(options);
        if (!cancelled) {
          setLocation(loc);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to get location';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLocation();

    return () => {
      cancelled = true;
    };
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return { location, loading, error };
}

// =============================================================================
// Distance Calculation Hook
// =============================================================================

export function useDistanceCalculation() {
  const [from, setFrom] = useState<LocationCoords | null>(null);
  const [to, setTo] = useState<LocationCoords | null>(null);

  const distance = from && to ? calculateDistance(from, to) : null;
  const bearing = from && to ? calculateBearing(from, to) : null;

  return {
    from,
    to,
    distance,
    bearing,
    setFrom,
    setTo,
    calculateDistance,
    calculateBearing,
    formatDistance,
  };
}