import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/stores/auth-store';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: User['role'][];
  fallback?: ReactNode;
  redirectTo?: string;
}

function ForbiddenFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-bold text-slate-800">Akses Ditolak</h1>
      <p className="text-slate-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    </div>
  );
}

export function RoleBasedRoute({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/dashboard',
}: RoleBasedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const hasAllowedRole = isAuthenticated && user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, allowedRoles, navigate, redirectTo]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!hasAllowedRole) {
    return <>{fallback ?? <ForbiddenFallback />}</>;
  }

  return <>{children}</>;
}

export default RoleBasedRoute;
