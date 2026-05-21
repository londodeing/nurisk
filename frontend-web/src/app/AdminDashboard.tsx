import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ active: 0, critical: 0, verified: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/incidents')
      .then(res => {
        setIncidents(res.data);
        setStats({
          active: res.data.filter((i: any) => i.status === 'REPORTED').length,
          critical: res.data.filter((i: any) => i.severity === 'CRITICAL').length,
          verified: res.data.filter((i: any) => i.status === 'ASSIGNED').length,
          completed: res.data.filter((i: any) => i.status === 'CLOSED').length,
        });
      })
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
          <h1 className="text-xl font-bold">Command Center</h1>
          <nav className="flex gap-4">
            <Link to="/admin/ics" className="hover:underline">ICS</Link>
            <Link to="/admin/analytics" className="hover:underline">Analytics</Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Keluar</Button>
          </nav>
        </div>
      </header>

      {/* Stats */}
      <section className="py-6 bg-white">
        <div className="container mx-auto grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-nu-green">{stats.active}</div>
              <div className="text-slate-600">Menunggu</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-danger-red">{stats.critical}</div>
              <div className="text-slate-600">Kritis</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.verified}</div>
              <div className="text-slate-600">Verifikasi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-safe-green">{stats.completed}</div>
              <div className="text-slate-600">Selesai</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Incidents */}
      <section className="py-6">
        <div className="container mx-auto">
          <h3 className="text-xl font-bold mb-4">Semua Kejadian</h3>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid gap-4">
              {incidents.map(incident => (
                <Card key={incident.id}>
                  <CardContent className="p-4">
                    <Link to={`/incidents/${incident.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{incident.title}</h4>
                          <p className="text-sm text-slate-600">{incident.location}</p>
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