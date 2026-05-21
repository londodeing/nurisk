/**
 * useScrollRestoration Hook
 * Hook for managing scroll position restoration on navigation
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// =============================================================================
// Types
// =============================================================================

interface ScrollPosition {
  x: number;
  y: number;
}

interface ScrollRestorationOptions {
  /** Maximum number of positions to store */
  maxEntries?: number;
  /** Routes that should not restore scroll position */
  excludedRoutes?: string[];
  /** Routes that should not scroll to top */
  preserveScrollRoutes?: string[];
}

// =============================================================================
// Constants
// =============================================================================

const SCROLL_STORAGE_KEY = 'nu_scroll_positions';
const DEFAULT_EXCLUDED_ROUTES = ['/chat', '/feed'];
const DEFAULT_PRESERVE_ROUTES = ['/chat', '/incidents', '/feed'];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get scroll positions from storage
 */
/**
 * Save scroll positions to storage
 */
function saveScrollPositions(positions: Record<string, ScrollPosition>): void {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Storage might be full or disabled
  }
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * useScrollRestoration hook
 * Manages scroll position saving and restoration
 */
export function useScrollRestoration(options: ScrollRestorationOptions = {}) {
  const { maxEntries = 50, excludedRoutes = [], preserveScrollRoutes = [] } = options;
  const location = useLocation();
  const scrollPositionsRef = useRef<Record<string, ScrollPosition>>({});
  const isInitialMount = useRef(true);

  // Combined excluded routes
  const allExcludedRoutes = [...DEFAULT_EXCLUDED_ROUTES, ...excludedRoutes];
  const allPreserveRoutes = [...DEFAULT_PRESERVE_ROUTES, ...preserveScrollRoutes];

  // Save scroll position on route change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Get current scroll position before navigating away
    const currentPath = location.pathname;
    const currentPosition = { x: window.scrollX, y: window.scrollY };

    // Check if route should preserve scroll
    const shouldPreserve = allPreserveRoutes.some((route) =>
      currentPath.startsWith(route)
    );

    if (!shouldPreserve && currentPosition.y > 0) {
      // Save current position
      scrollPositionsRef.current[currentPath] = currentPosition;

      // Limit entries
      const entries = Object.keys(scrollPositionsRef.current);
      if (entries.length > maxEntries) {
        // Remove oldest entries
        const toRemove = entries.slice(0, entries.length - maxEntries);
        toRemove.forEach((key) => {
          delete scrollPositionsRef.current[key];
        });
      }

      // Save to storage
      saveScrollPositions(scrollPositionsRef.current);
    }
  }, [location.pathname, maxEntries, allPreserveRoutes]);

  // Restore scroll position on route change
  useEffect(() => {
    const path = location.pathname;

    // Check if route should restore scroll
    const shouldRestore = !allExcludedRoutes.some((route) =>
      path.startsWith(route)
    );

    if (shouldRestore) {
      // Get saved position
      const savedPosition = scrollPositionsRef.current[path];

      if (savedPosition) {
        // Restore position
        if (prefersReducedMotion()) {
          window.scrollTo(savedPosition.x, savedPosition.y);
        } else {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'smooth',
          });
        }
      } else {
        // Scroll to top for new routes
        if (prefersReducedMotion()) {
          window.scrollTo(0, 0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }, [location.pathname, allExcludedRoutes]);

  /**
   * Manual scroll to top
   */
  const scrollToTop = useCallback(() => {
    if (prefersReducedMotion()) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /**
   * Manual scroll to position
   */
  const scrollTo = useCallback((x: number, y: number) => {
    if (prefersReducedMotion()) {
      window.scrollTo(x, y);
    } else {
      window.scrollTo({ left: x, top: y, behavior: 'smooth' });
    }
  }, []);

  /**
   * Clear all saved positions
   */
  const clearPositions = useCallback(() => {
    scrollPositionsRef.current = {};
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  }, []);

  /**
   * Get saved position for a route
   */
  const getPosition = useCallback(
    (path: string): ScrollPosition | undefined => {
      return scrollPositionsRef.current[path];
    },
    []
  );

  return {
    scrollToTop,
    scrollTo,
    clearPositions,
    getPosition,
  };
}

export default useScrollRestoration;