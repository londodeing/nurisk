'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { MapSettings } from '@/components/settings/MapSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { useAuthStore } from '@/stores/auth-store';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'theme' | 'notifications' | 'map' | 'security'>('theme');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'theme', label: 'Tampilan' },
    { id: 'notifications', label: 'Notifikasi' },
    { id: 'map', label: 'Peta' },
    { id: 'security', label: 'Keamanan' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="hover:underline">← Kembali</Link>
          <h1 className="text-xl font-bold">Pengaturan</h1>
          <Link to="/profile" className="text-sm hover:underline">Profil</Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'theme' && <ThemeSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'map' && <MapSettings />}
            {activeTab === 'security' && <SecuritySettings user={user} />}
          </div>
        </div>
      </main>
    </div>
  );
}