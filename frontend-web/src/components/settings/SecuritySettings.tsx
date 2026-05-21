'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Monitor, 
  LogOut, 
  Smartphone
} from 'lucide-react';
import api from '@/lib/api';
import type { User } from '@/stores/auth-store';

interface Session {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface SecuritySettingsProps {
  user: User;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSessions();
    setIs2FAEnabled(user.role === 'admin'); // Placeholder - check from API
  }, [user]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data || []);
    } catch (error) {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      setMessage({ type: 'success', text: 'Sesi dihentikan' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengakhiri sesi' });
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setQrCode(res.data.qrCode);
      setShow2FASetup(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memulai setup 2FA' });
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/auth/2fa/verify', { code: totpCode });
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setMessage({ type: 'success', text: '2FA berhasil diaktifkan' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Kode tidak valid' });
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.delete('/auth/2fa');
      setIs2FAEnabled(false);
      setMessage({ type: 'success', text: '2FA dinonaktifkan' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menonaktifkan 2FA' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Tambahan keamanan dengan kode verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!show2FASetup ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-gray-500" />
                <span>{is2FAEnabled ? '2FA Aktif' : '2FA Tidak Aktif'}</span>
              </div>
              {is2FAEnabled ? (
                <Button variant="destructive" size="sm" onClick={handleDisable2FA}>
                  Nonaktifkan
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleSetup2FA}>
                  Aktifkan
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Masukkan kode dari authenticator</Label>
                <Input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerify2FA}>Verifikasi</Button>
                <Button variant="ghost" onClick={() => setShow2FASetup(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sesi Aktif
          </CardTitle>
          <CardDescription>Kelola perangkat yang masuk akun</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-nu-green" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Tidak ada sesi aktif</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.device}</span>
                      {session.current && (
                        <Badge variant="default">Saat Ini</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {session.ip} • {session.location}
                    </p>
                    <p className="text-xs text-gray-400">
                      Terakhir: {formatDate(session.lastActive)}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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