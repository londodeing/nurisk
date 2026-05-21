'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore, type User } from '@/stores/auth-store';
import api from '@/lib/api';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await api.patch('/auth/profile', {
        name: form.name,
        phone: form.phone,
      });
      setUser(res.data);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok' });
      return;
    }

    if (password.new.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await api.patch('/auth/change-password', {
        currentPassword: password.current,
        newPassword: password.new,
      });
      setPassword({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
      setMessage({ type: 'success', text: 'Password berhasil diubah' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengubah password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Perbarui informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={form.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Ubah password akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Ubah Password
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Password Saat Ini</Label>
                <Input
                  id="current"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">Password Baru</Label>
                <Input
                  id="new"
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Konfirmasi Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowPasswordForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}