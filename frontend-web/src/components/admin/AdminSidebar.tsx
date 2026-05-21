import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, ChevronRight, Search, Settings, 
  LayoutDashboard, Users, Map, AlertTriangle, MessageSquare,
  BarChart3, Shield, FileText, Layers
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { 
    label: 'Incidents', 
    href: '/admin/incidents', 
    icon: AlertTriangle,
    children: [
      { label: 'All Incidents', href: '/admin/incidents', icon: AlertTriangle },
      { label: 'Active', href: '/admin/incidents/active', icon: AlertTriangle },
      { label: 'Resolved', href: '/admin/incidents/resolved', icon: AlertTriangle },
    ]
  },
  { label: 'Map', href: '/admin/map', icon: Map },
  { label: 'Volunteers', href: '/admin/volunteers', icon: Users },
  { 
    label: 'Organization', 
    href: '/admin/org', 
    icon: Layers,
    children: [
      { label: 'Org Chart', href: '/admin/org/chart', icon: Layers },
      { label: 'Positions', href: '/admin/org/positions', icon: Shield },
    ]
  },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { 
    label: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3,
    children: [
      { label: 'Overview', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/admin/analytics/reports', icon: FileText },
    ]
  },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export default function AdminSidebar({ collapsed = false, onCollapse }: AdminSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['incidents', 'organization', 'analytics']);

  const toggleExpand = useCallback((item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  }, []);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <aside className={cn(
      "bg-slate-900 text-white h-screen flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-nu-green rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">NU</span>
          </div>
          {!collapsed && <span className="font-semibold">Nurisk</span>}
        </Link>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-green"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => (
          <div key={item.href}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpand(item.href.split('/')[2] || item.label.toLowerCase())}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800",
                    isActive(item.href) && "bg-slate-800 text-nu-green"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {expandedItems.includes(item.label.toLowerCase()) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
                {!collapsed && expandedItems.includes(item.label.toLowerCase()) && (
                  <div className="ml-6">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800",
                          isActive(child.href) && "text-nu-green"
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800",
                  isActive(item.href) && "bg-slate-800 text-nu-green"
                )}
              >
                <item.icon className="w-4 h-4" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapse?.(!collapsed)}
        className="p-4 border-t border-slate-800 hover:bg-slate-800"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </aside>
  );
}