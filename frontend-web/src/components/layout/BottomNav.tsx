import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, Map, Megaphone, User, Bell, TrendingUp, LucideProps } from 'lucide-react';

// ============================================
// Menu Configuration
// ============================================

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  path: string;
  badge?: number;
}

export const PUBLIC_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'map', label: 'Map', icon: Map, path: '/map' },
  { id: 'lapor', label: 'Lapor', icon: Megaphone, path: '/lapor' },
  { id: 'resource', label: 'Resource', icon: Package, path: '/resource' },
  { id: 'akun', label: 'Akun', icon: User, path: '/login' },
];

export const ADMIN_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { id: 'incidents', label: 'Incidents', icon: Bell, path: '/admin/incidents' },
  { id: 'volunteers', label: 'Volunteers', icon: Package, path: '/admin/volunteers' },
  { id: 'resources', label: 'Resources', icon: TrendingUp, path: '/admin/resources' },
];

// ============================================
// BottomNav Component
// ============================================

interface BottomNavProps {
  className?: string;
  menuItems?: BottomNavItem[];
}

export function BottomNav({ 
  className, 
  menuItems = PUBLIC_BOTTOM_NAV_ITEMS,
}: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 bg-white/95 backdrop-blur-xl border border-slate-200/80 flex items-center justify-around z-[6000] px-2 rounded-2xl shadow-2xl shadow-slate-200/60',
      className
    )}>
      {/* Nav Items - Equal width for 5 items */}
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        
        return (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200',
              isActive ? 'text-nu-green' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;