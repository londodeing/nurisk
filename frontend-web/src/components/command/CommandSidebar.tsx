/**
 * CommandSidebar Component
 * Navigation sidebar for Command Center
 */

import {
  LayoutDashboard,
  AlertTriangle,
  Package,
  Users,
  Brain,
  FileText,
  Settings,
  Radio,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CommandView = 'dashboard' | 'incidents' | 'resources' | 'volunteers' | 'intel' | 'briefing' | 'settings';

interface CommandSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: CommandView;
  onViewChange: (view: CommandView) => void;
  onBroadcast: () => void;
}

interface NavItem {
  id: CommandView;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'incidents', label: 'Insiden', icon: <AlertTriangle className="h-5 w-5" />, badge: 3 },
  { id: 'resources', label: 'Sumber Daya', icon: <Package className="h-5 w-5" /> },
  { id: 'volunteers', label: 'Relawan', icon: <Users className="h-5 w-5" />, badge: 12 },
  { id: 'intel', label: 'Intel', icon: <Brain className="h-5 w-5" /> },
  { id: 'briefing', label: 'Briefing', icon: <FileText className="h-5 w-5" /> },
  { id: 'settings', label: 'Pengaturan', icon: <Settings className="h-5 w-5" /> },
];

export function CommandSidebar({
  isOpen,
  onToggle,
  currentView,
  onViewChange,
  onBroadcast,
}: CommandSidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-3 hover:bg-slate-800 transition-colors"
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors',
                  currentView === item.id
                    ? 'bg-nu-green text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                {item.icon}
                {isOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Broadcast Button */}
      <div className="p-2 border-t border-slate-700">
        <button
          onClick={onBroadcast}
          className={cn(
            'flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg',
            'bg-red-600 hover:bg-red-700 text-white transition-colors',
            !isOpen && 'justify-center'
          )}
        >
          <Radio className="h-5 w-5" />
          {isOpen && <span className="text-sm font-medium">Broadcast</span>}
        </button>
      </div>
    </aside>
  );
}

export default CommandSidebar;