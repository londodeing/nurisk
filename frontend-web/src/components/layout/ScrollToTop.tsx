/**
 * ScrollToTop Component
 * Automatically scrolls to top on route change
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  children: React.ReactNode;
}

/**
 * Routes that should NOT scroll to top automatically
 * (e.g., chat, feed where scroll position should be preserved)
 */
const EXCLUDED_ROUTES = ['/chat', '/incidents', '/feed'];

/**
 * ScrollToTop component
 * - Scrolls to top on new route navigation
 * - Preserves scroll position for certain routes
 * - Respects prefers-reduced-motion
 */
export function ScrollToTop({ children }: ScrollToTopProps) {
  const location = useLocation();

  useEffect(() => {
    // Check if this route should preserve scroll position
    const shouldPreserveScroll = EXCLUDED_ROUTES.some((route) =>
      location.pathname.startsWith(route)
    );

    if (shouldPreserveScroll) {
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return <>{children}</>;
}

export default ScrollToTop;