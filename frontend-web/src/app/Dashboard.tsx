import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/incidents?status=active')
      .then(res => setIncidents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span>{user.name}</span>
            <Link to="/profile" className="hover:underline">Profil</Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Keluar</Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="py-8 bg-white">
        <div className="container mx-auto grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-nu-green">{incidents.length}</div>
              <div className="text-slate-600">Aktif</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-danger-red">0</div>
              <div className="text-slate-600">Kritis</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-warning-yellow">0</div>
              <div className="text-slate-600">Verifikasi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-safe-green">0</div>
              <div className="text-slate-600">Selesai</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Incidents List */}
      <section className="py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Daftar Kejadian</h3>
            <Link to="/report">
              <Button>Laporan Baru</Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid gap-4">
              {incidents.map(incident => (
                <Card key={incident.id}>
                  <CardContent className="p-4">
                    <Link to={`/incidents/${incident.id}`}>
                      <div className="flex justify-between items-start hover:bg-slate-50 p-2 rounded">
                        <div>
                          <h4 className="font-semibold">{incident.title}</h4>
                          <p className="text-sm text-slate-600">{incident.location}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(incident.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                          {incident.status}
                        </Badge>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}