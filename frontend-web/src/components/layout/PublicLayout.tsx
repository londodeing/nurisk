import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BottomNav, PUBLIC_BOTTOM_NAV_ITEMS } from './BottomNav';
import { Menu, Bell, Wifi, WifiOff } from 'lucide-react';

// ============================================
// Public Layout Component
// ============================================

interface PublicLayoutProps {
  className?: string;
  isOnline?: boolean;
  notificationCount?: number;
}

export function PublicLayout({
  className,
  isOnline = true,
  notificationCount = 0,
}: PublicLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-slate-50', className)}>
      {/* Public Header - Simplified */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-nu-green flex items-center px-4 justify-between shrink-0 shadow-lg z-[5000]">
        {/* Left: Menu Button */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Center: Logo + Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <img
              src="https://pwnu-jateng.org/uploads/infoumum/20250825111304-2025-08-25infoumum111252.png"
              className="w-5 h-5 object-contain"
              alt="NU"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-white text-xs uppercase tracking-tight">
              NU RISK
            </span>
            <span className="text-[8px] text-white/50 font-semibold uppercase tracking-widest">
              Public Dashboard
            </span>
          </div>
        </div>

        {/* Right: Status + Notifications */}
        <div className="flex items-center gap-2">
          {/* Online Status */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-300" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-white" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Page Content - With top padding for fixed header */}
      <main className="pt-14 pb-24 px-4 md:px-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        menuItems={PUBLIC_BOTTOM_NAV_ITEMS}
      />
    </div>
  );
}

export default PublicLayout;