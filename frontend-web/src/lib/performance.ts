/**
 * Performance optimization utilities
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================================
// React Performance
// ============================================================================

/**
 * Create a memoized callback that only changes if dependencies change
 * Wrapper around useCallback with shallow comparison
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: unknown[]
): T {
  const [_memoizedCallback] = useState(() => callback);
  
  useEffect(() => {
    // Update callback when dependencies change
    // This is handled by React's useCallback internally
  }, dependencies);
  
  return useCallback(callback, dependencies);
}

/**
 * Memoize expensive computations
 */
export function useExpensiveMemo<T>(
  compute: () => T,
  dependencies: unknown[]
): T {
  return useMemo(compute, dependencies);
}

// ============================================================================
// Image Optimization
// ============================================================================

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3Ag==';
  });
}

/**
 * Get optimal image source based on viewport
 */
export function getOptimalImageSrc({
  src,
  width,
  breakpoints = [320, 640, 768, 1024, 1280, 1920],
}: {
  src: string;
  width: number;
  breakpoints?: number[];
}): string {
  // If src already contains width param, update it
  const url = new URL(src, window.location.origin);
  
  // Find the closest breakpoint
  const closestWidth = breakpoints.reduce((prev, curr) => {
    return curr <= width ? curr : prev;
  }, breakpoints[0]);
  
  url.searchParams.set('w', String(closestWidth));
  url.searchParams.set('fmt', 'webp');
  
  return url.toString();
}

/**
 * Lazy load image with Intersection Observer
 */
export function useLazyImage(src: string): boolean {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [shouldLoad, src, isLoaded]);

  return isLoaded;
}

// ============================================================================
// Network Optimization
// ============================================================================

/**
 * Create a fetch with caching
 */
export async function fetchWithCache(
  url: string,
  options: RequestInit & {
    cache?: RequestCache;
    cacheDuration?: number; // in ms
  } = {}
): Promise<Response> {
  const { cache = 'force-cache', cacheDuration = 1000 * 60 * 5, ...fetchOptions } = options;
  
  // Check cache first
  if (cache !== 'no-store') {
    const cached = await caches.match(url);
    if (cached) {
      const cacheTime = cached.headers.get('x-cache-time');
      if (cacheTime && Date.now() - Number(cacheTime) < cacheDuration) {
        return cached;
      }
    }
  }

  const response = await fetch(url, fetchOptions);
  
  // Cache the response
  if (response.ok && cache !== 'no-store') {
    const cache = await caches.open('api-cache');
    const responseClone = response.clone();
    const headers = new Headers(responseClone.headers);
    headers.set('x-cache-time', String(Date.now()));
    const cachedResponse = new Response(responseClone.body, {
      status: responseClone.status,
      statusText: responseClone.statusText,
      headers,
    });
    cache.put(url, cachedResponse);
  }
  
  return response;
}

/**
 * Batch multiple fetch requests
 */
export function batchFetch(
  urls: string[],
  options: RequestInit = {}
): Promise<Response[]> {
  return Promise.all(urls.map((url) => fetch(url, options)));
}

// ============================================================================
// Map Performance
// ============================================================================

/**
 * Debounce function for map events
 */
export function debounceMapEvent<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;
}

/**
 * Throttle function for map events
 */
export function throttleMapEvent<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);

    if (remaining <= 0) {
      lastCall = now;
      callback(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        callback(...args);
      }, remaining);
    }
  }) as T;
}

/**
 * Calculate marker clusters based on zoom level
 */
export function calculateClusters<T extends { lat: number; lng: number }>({
  markers,
  zoom,
  clusterRadius = 100,
}: {
  markers: T[];
  zoom: number;
  bounds: { north: number; south: number; east: number; west: number };
  clusterRadius?: number;
}): T[][] {
  const clusters: T[][] = [];
  const processed = new Set<number>();

  // Adjust cluster radius based on zoom
  const adjustedRadius = clusterRadius / Math.pow(2, zoom);

  for (let i = 0; i < markers.length; i++) {
    if (processed.has(i)) continue;

    const cluster: T[] = [markers[i]];
    processed.add(i);

    for (let j = i + 1; j < markers.length; j++) {
      if (processed.has(j)) continue;

      const distance = getDistance(
        markers[i].lat,
        markers[i].lng,
        markers[j].lat,
        markers[j].lng
      );

      if (distance <= adjustedRadius) {
        cluster.push(markers[j]);
        processed.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Calculate distance between two coordinates in pixels
 */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ============================================================================
// Prefetching
// ============================================================================

/**
 * Prefetch route resources
 */
export function prefetchRoute(path: string): void {
  // Preload route chunk
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

/**
 * Prefetch predicted routes based on user behavior
 */
export function usePrefetchPredictedRoutes({
  currentPath,
  predictedPaths,
}: {
  currentPath: string;
  predictedPaths: string[];
}) {
  useEffect(() => {
    // Prefetch likely next routes
    predictedPaths.forEach((path) => {
      prefetchRoute(path);
    });
  }, [currentPath, predictedPaths]);
}

// ============================================================================
// Bundle Analysis
// ============================================================================

/**
 * Get bundle size information
 */
export function getBundleInfo(): {
  jsSize: number;
  cssSize: number;
  totalSize: number;
} {
  if (typeof window === 'undefined') {
    return { jsSize: 0, cssSize: 0, totalSize: 0 };
  }

  let jsSize = 0;
  let cssSize = 0;

  document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach((el) => {
    const src = el.getAttribute('src') || el.getAttribute('href');
    if (src) {
      if (src.endsWith('.js')) jsSize += 1;
      else if (src.endsWith('.css')) cssSize += 1;
    }
  });

  return {
    jsSize,
    cssSize,
    totalSize: jsSize + cssSize,
  };
}

export default {
  supportsWebP,
  getOptimalImageSrc,
  useLazyImage,
  fetchWithCache,
  batchFetch,
  debounceMapEvent,
  throttleMapEvent,
  calculateClusters,
  prefetchRoute,
  getBundleInfo,
};