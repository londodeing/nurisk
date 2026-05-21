import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Menu, Search, Bell, Wifi, WifiOff, 
  LogOut, User, Settings, ChevronDown 
} from 'lucide-react';

// ============================================
// Header Component
// ============================================

interface HeaderProps {
  className?: string;
  title?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  isOnline?: boolean;
  user?: {
    full_name?: string;
    email?: string;
    role?: string;
    region?: string;
  };
  onLogout?: () => void;
  notificationCount?: number;
}

export function Header({
  className,
  title = 'Dashboard',
  showMenuButton = true,
  onMenuClick,
  isOnline = true,
  user,
  onLogout,
  notificationCount = 0,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className={cn(
      'h-14 bg-nu-green flex items-center px-4 md:px-6 justify-between shrink-0 shadow-lg z-[5000]',
      className
    )}>
      {/* Left Section: Menu + Title */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}
        <h1 className="font-bold text-white text-lg md:text-xl">{title}</h1>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Online Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-300" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs text-white/60 uppercase font-semibold hidden md:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-white/20" />

        {/* Search (Desktop) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 h-9 pl-10 pr-4 rounded-xl bg-white/10 text-white text-sm placeholder:text-white/40 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/20 transition-all"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-white" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-4 text-center text-slate-400 text-sm">
                  No new notifications
                </div>
              </div>
              <Link
                to="/notifications"
                className="block p-3 text-center text-sm text-nu-green hover:bg-slate-50 border-t border-slate-100"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm uppercase">
              {user?.full_name?.[0] || 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-white/60 hidden md:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              {user && (
                <div className="p-3 border-b border-slate-100">
                  <p className="font-semibold text-slate-700">{user.full_name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-400 uppercase">
                    {user.role} • {user.region}
                  </p>
                </div>
              )}
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;