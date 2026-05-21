import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.patch('/auth/profile', form);
      localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
      alert('Profile updated');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="hover:underline">← Kembali</Link>
          <h1 className="text-xl font-bold">Profil</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={user.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telepon</label>
                <Input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">SIMPAN</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="max-w-lg mx-auto mt-4">
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              KELUAR
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}