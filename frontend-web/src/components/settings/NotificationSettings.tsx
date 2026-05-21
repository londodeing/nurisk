'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Clock } from 'lucide-react';

interface NotificationSettings {
  push: boolean;
  email: boolean;
  inApp: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    push: true,
    email: true,
    inApp: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      setMessage('Pengaturan berhasil disimpan');
    } catch (error) {
      setMessage('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-nu-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifikasi</CardTitle>
        <CardDescription>Kelola preferensi notifikasi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-500" />
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">Terima notifikasi di perangkat</p>
            </div>
          </div>
          <Switch
            checked={settings.push}
            onCheckedChange={() => toggleSetting('push')}
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Terima notifikasi via email</p>
            </div>
          </div>
          <Switch
            checked={settings.email}
            onCheckedChange={() => toggleSetting('email')}
          />
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <div>
              <Label>In-App Notifications</Label>
              <p className="text-sm text-gray-500">Tampilkan notifikasi dalam aplikasi</p>
            </div>
          </div>
          <Switch
            checked={settings.inApp}
            onCheckedChange={() => toggleSetting('inApp')}
          />
        </div>

        {/* Quiet Hours */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <Label>Quiet Hours</Label>
                <p className="text-sm text-gray-500">Matikan notifikasi pada jam tertentu</p>
              </div>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={() => toggleSetting('quietHoursEnabled')}
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="flex gap-4 ml-8">
              <div className="space-y-2">
                <Label>Mulai</Label>
                <Input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Selesai</Label>
                <Input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
          {message && (
            <span className="text-sm text-green-600">{message}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}