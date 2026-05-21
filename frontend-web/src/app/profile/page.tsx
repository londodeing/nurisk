'use client';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ActivityLog } from '@/components/profile/ActivityLog';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="hover:underline">← Kembali</Link>
          <h1 className="text-xl font-bold">Profil</h1>
          <Link to="/settings" className="text-sm hover:underline">Pengaturan</Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <AvatarUpload 
                    currentAvatar={user.avatar} 
                    onUpload={async () => {}} 
                  />
                  <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  
                  <div className="mt-6 w-full space-y-2">
                    <Button 
                      variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('profile')}
                    >
                      Edit Profil
                    </Button>
                    <Button 
                      variant={activeTab === 'activity' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('activity')}
                    >
                      Aktivitas
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600"
                      onClick={handleLogout}
                    >
                      Keluar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileForm user={user} />
            )}
            {activeTab === 'activity' && (
              <ActivityLog />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}