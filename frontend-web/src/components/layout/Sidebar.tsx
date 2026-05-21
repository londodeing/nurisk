import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import {
  Home, Crosshair, ListChecks, Package, Box, Building2,
  Tent, Users, ClipboardList, MessageSquare, BarChart2,
  Bell, TrendingUp, FileText, ChevronLeft,
  LogOut
} from 'lucide-react';

// ============================================
// Menu Configuration
// ============================================

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: string[];
  badge?: number;
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { id: 'command', label: 'Command', icon: Crosshair, path: '/admin/command' },
  { id: 'manager', label: 'Manajer', icon: ListChecks, path: '/admin/manager' },
  { id: 'inventori', label: 'Inventori', icon: Package, path: '/admin/inventory' },
  { id: 'assets', label: 'Aset', icon: Box, path: '/admin/assets' },
  { id: 'buildings', label: 'Gedung', icon: Building2, path: '/admin/buildings' },
  { id: 'posko', label: 'Posko', icon: Tent, path: '/admin/posko' },
  { id: 'volunteer-mgmt', label: 'Relawan', icon: Users, path: '/admin/volunteers', badge: 12 },
  { id: 'volunteer-mission', label: 'Misi', icon: ClipboardList, path: '/admin/missions' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/admin/chat' },
  { id: 'analytics', label: 'Analitik', icon: BarChart2, path: '/admin/analytics' },
  { id: 'notifications', label: 'Notif', icon: Bell, path: '/admin/notifications', badge: 3 },
  { id: 'trends', label: 'Tren', icon: TrendingUp, path: '/admin/trends' },
  { id: 'audit-logs', label: 'Log', icon: FileText, path: '/admin/audit-logs' },
];

export const VOLUNTEER_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/volunteer/dashboard' },
  { id: 'incidents', label: 'Insiden', icon: Crosshair, path: '/volunteer/incidents' },
  { id: 'missions', label: 'Misi', icon: ClipboardList, path: '/volunteer/missions' },
  { id: 'resources', label: 'Sumber', icon: Package, path: '/volunteer/resources' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/volunteer/chat' },
  { id: 'profile', label: 'Profil', icon: Users, path: '/volunteer/profile' },
];

// ============================================
// Sidebar Component
// ============================================

interface SidebarProps {
  className?: string;
  menuItems?: MenuItem[];
  userRole?: string;
  onLogout?: () => void;
}

export function Sidebar({ 
  className, 
  menuItems = ADMIN_MENU_ITEMS, 
  userRole = 'admin',
  onLogout 
}: SidebarProps) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const [collapsed, setCollapsed] = React.useState(false);

  // Filter menu items by role
  const filteredItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-[80px]' : 'w-[260px]',
        className
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'h-16 flex items-center border-b border-slate-100 px-4 shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nu-green rounded-xl flex items-center justify-center">
              <img
                src="https://pwnu-jateng.org/uploads/infoumum/20250825111304-2025-08-25infoumum111252.png"
                className="w-6 h-6 object-contain"
                alt="NU"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-nu-green text-sm">NU RISK</span>
              <span className="text-[10px] text-slate-400 uppercase">Command Hub</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-nu-green rounded-xl flex items-center justify-center">
            <img
              src="https://pwnu-jateng.org/uploads/infoumum/20250825111304-2025-08-25infoumum111252.png"
              className="w-6 h-6 object-contain"
              alt="NU"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-2 rounded-lg hover:bg-slate-100 transition-colors',
            collapsed && 'absolute -right-3 top-4 bg-white border shadow-sm'
          )}
        >
          <ChevronLeft className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            collapsed && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="flex flex-col gap-1 px-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-nu-green/10 text-nu-green'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-nu-green rounded-r-full" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className={cn(
        'border-t border-slate-100 p-4 shrink-0',
        collapsed ? 'flex flex-col items-center' : 'flex items-center justify-between'
      )}>
        {!collapsed ? (
          <>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-slate-700">Admin User</span>
              <span className="text-xs text-slate-400">admin@nu.or.id</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;