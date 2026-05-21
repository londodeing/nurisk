/**
 * CommandLayout Component
 * Main layout for Command Center with sidebar and content area
 */

import { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { CommandSidebar } from './CommandSidebar';
import { CommandMap } from './CommandMap';
import { CommandKpiBar } from './CommandKpiBar';
import { CommunicationHub } from './CommunicationHub';
import { EmergencyBroadcast } from './EmergencyBroadcast';

type CommandView = 'dashboard' | 'incidents' | 'resources' | 'volunteers' | 'intel' | 'briefing' | 'settings';

export default function CommandLayout() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<CommandView>('dashboard');
  const [showBroadcast, setShowBroadcast] = useState(false);

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <CommandSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onBroadcast={() => setShowBroadcast(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Command Center</h1>
              <p className="text-xs text-slate-400">Pusat Komando Taktis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Emergency Broadcast Button */}
            <button
              onClick={() => setShowBroadcast(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm flex items-center gap-2"
            >
              <span>🚨</span>
              <span>Broadcast</span>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-400">Commander</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Map Area */}
          <div className="flex-1 flex flex-col">
            <CommandMap />
            <CommandKpiBar />
          </div>

          {/* Communication Hub */}
          <CommunicationHub />
        </main>
      </div>

      {/* Emergency Broadcast Modal */}
      {showBroadcast && (
        <EmergencyBroadcast onClose={() => setShowBroadcast(false)} />
      )}
    </div>
  );
}