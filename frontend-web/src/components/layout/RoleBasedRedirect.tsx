'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, type User } from '@/stores/auth-store';

// =============================================================================
// Role to Dashboard Mapping
// =============================================================================

const ROLE_REDIRECTS: Record<User['role'], string> = {
  admin: '/dashboard/admin',
  volunteer: '/dashboard/relawan',
  public: '/',
} as const;

// =============================================================================
// Fallback for unknown roles
// =============================================================================

const DEFAULT_REDIRECT = '/';

// =============================================================================
// RoleBasedRedirect Component
// =============================================================================

export function RoleBasedRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip if still loading or not mounted
    if (isLoading || !mounted) return;

    // Skip if not authenticated
    if (!isAuthenticated || !user) {
      // Save current location for after login
      const returnTo = location.pathname + location.search;
      navigate('/login', { 
        state: { from: returnTo }, 
        replace: true 
      });
      return;
    }

    // Get redirect URL based on role
    const redirectTo = ROLE_REDIRECTS[user.role] ?? DEFAULT_REDIRECT;

    // Skip if already on the correct dashboard
    if (location.pathname === redirectTo) return;

    // Maintain query params during redirect
    const targetPath = redirectTo + location.search;

    navigate(targetPath, { replace: true });
  }, [user, isAuthenticated, isLoading, mounted, location, navigate]);

  // Show loading state while checking
  if (isLoading || !mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-nu-green" />
          <p className="text-sm text-gray-500">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  // If authenticated but role unknown, show brief message then redirect
  if (isAuthenticated && user && !ROLE_REDIRECTS[user.role]) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-nu-green" />
          <p className="text-sm text-gray-500">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default RoleBasedRedirect;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the default dashboard URL for a given role
 */
export function getDashboardUrl(role: User['role']): string {
  return ROLE_REDIRECTS[role] ?? DEFAULT_REDIRECT;
}

/**
 * Check if a user can access a specific route based on their role
 */
export function canAccessRoute(role: User['role'], route: string): boolean {
  const allowedDashboard = ROLE_REDIRECTS[role];
  if (!allowedDashboard) return false;
  
  // Check if route starts with the allowed dashboard path
  return route.startsWith(allowedDashboard);
}

/**
 * Get all available dashboard routes for a role
 */
export function getAvailableDashboards(role: User['role']): string[] {
  const baseDashboard = ROLE_REDIRECTS[role];
  if (!baseDashboard) return ['/'];
  
  // Return the primary dashboard and common shared routes
  return [
    baseDashboard,
    '/incidents',
    '/profile',
    '/chat',
  ];
}