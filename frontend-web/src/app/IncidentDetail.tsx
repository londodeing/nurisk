import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export default function IncidentDetail() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/incidents/${id}`)
      .then(res => setIncident(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: any) => {
    try {
      await api.patch(`/incidents/${id}`, { status: newStatus });
      setIncident({ ...incident, status: newStatus });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!incident) {
    return <div className="p-8 text-center">Incident not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="hover:underline">← Kembali</Link>
          <h1 className="text-xl font-bold">Detail Kejadian</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid gap-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{incident.title}</CardTitle>
                <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                  {incident.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-600">Lokasi</label>
                <p>{incident.location}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Deskripsi</label>
                <p>{incident.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Latitude</label>
                  <p>{incident.location.lat}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Longitude</label>
                  <p>{incident.location.lng}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">Dibuat</label>
                <p>{new Date(incident.createdAt).toLocaleString('id-ID')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button onClick={() => handleStatusChange('ASSIGNED')}>Verifikasi</Button>
              <Button onClick={() => handleStatusChange('IN_PROGRESS')}>Assessment</Button>
              <Button onClick={() => handleStatusChange('IN_PROGRESS')}>Command</Button>
              <Button onClick={() => handleStatusChange('RESOLVED')}>Respon</Button>
              <Button onClick={() => handleStatusChange('CLOSED')}>Selesai</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}