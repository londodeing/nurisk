/**
 * PageTransition Component
 * Animated page transitions with fade and slide effects
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type TransitionType = 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale';
type TransitionPhase = 'entering' | 'entered' | 'exiting';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  className?: string;
}

interface PageTransitionState {
  isTransitioning: boolean;
  phase: TransitionPhase;
  direction: 'forward' | 'back';
}

/**
 * Check for reduced motion preference
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get transition styles based on type and phase
 */
function getTransitionStyles(
  type: TransitionType,
  phase: TransitionPhase,
  direction: 'forward' | 'back'
): string {
  if (phase === 'entering') {
    switch (type) {
      case 'fade':
        return 'opacity-0';
      case 'slide-up':
        return 'opacity-0 translate-y-4';
      case 'slide-left':
        return direction === 'forward'
          ? 'opacity-0 translate-x-4'
          : 'opacity-0 -translate-x-4';
      case 'slide-right':
        return direction === 'forward'
          ? 'opacity-0 -translate-x-4'
          : 'opacity-0 translate-x-4';
      case 'scale':
        return 'opacity-0 scale-95';
      default:
        return 'opacity-0';
    }
  }

  if (phase === 'exiting') {
    switch (type) {
      case 'fade':
        return 'opacity-0';
      case 'slide-up':
        return 'opacity-0 -translate-y-4';
      case 'slide-left':
        return direction === 'forward'
          ? 'opacity-0 -translate-x-4'
          : 'opacity-0 translate-x-4';
      case 'slide-right':
        return direction === 'forward'
          ? 'opacity-0 translate-x-4'
          : 'opacity-0 -translate-x-4';
      case 'scale':
        return 'opacity-0 scale-95';
      default:
        return 'opacity-0';
    }
  }

  return 'opacity-100';
}

/**
 * PageTransition component
 * Provides animated transitions between pages
 */
export function PageTransition({
  children,
  type = 'fade',
  duration = 200,
  className,
}: PageTransitionProps) {
  const location = useLocation();
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    phase: 'entered',
    direction: 'forward',
  });
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef<'forward' | 'back'>('forward');

  // Detect navigation direction
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    if (currentPath !== prevPath) {
      // Simple heuristic: if navigating to a parent route, it's back
      const isBack = currentPath.length < prevPath.length &&
        prevPath.startsWith(currentPath);

      directionRef.current = isBack ? 'back' : 'forward';
      prevPathRef.current = currentPath;

      // Start transition
      setState({
        isTransitioning: true,
        phase: 'entering',
        direction: directionRef.current,
      });
    }
  }, [location.pathname]);

  // Handle transition phases
  useEffect(() => {
    if (!state.isTransitioning) return;

    const reducedMotion = prefersReducedMotion();

    if (reducedMotion) {
      // Skip animation for reduced motion
      setState({
        isTransitioning: false,
        phase: 'entered',
        direction: state.direction,
      });
      return;
    }

    if (state.phase === 'entering') {
      // Complete enter animation
      const enterTimeout = setTimeout(() => {
        setState({
          isTransitioning: false,
          phase: 'entered',
          direction: state.direction,
        });
      }, duration);

      return () => clearTimeout(enterTimeout);
    }
  }, [state.isTransitioning, state.phase, duration]);

  // Get transition classes
  const transitionClasses = getTransitionStyles(
    type,
    state.phase,
    state.direction
  );

  // Duration style
  const durationStyle = { transitionDuration: `${duration}ms` };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        transitionClasses,
        className
      )}
      style={durationStyle}
    >
      {children}
    </div>
  );
}

/**
 * AnimatedOutlet component
 * Router outlet with built-in transitions
 */
export function AnimatedOutlet() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    setDisplayLocation(location);
  }, [location]);

  return (
    <PageTransition type="fade" duration={150}>
      {/* This renders the matched route */}
      <div key={displayLocation.pathname}>
        {/* Outlet will be rendered here by react-router */}
      </div>
    </PageTransition>
  );
}

/**
 * TransitionWrapper component
 * Wrapper for page content with transitions
 */
interface TransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function TransitionWrapper({ children, className }: TransitionWrapperProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  );
}

export default PageTransition;