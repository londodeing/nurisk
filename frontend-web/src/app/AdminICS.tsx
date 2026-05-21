import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export default function AdminICS() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/volunteers')
      .then(res => setVolunteers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/admin" className="hover:underline">← Command Center</Link>
          <h1 className="text-xl font-bold">ICS Management</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Struktur ICS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Incident Commander */}
            <div>
              <h4 className="font-bold text-nu-green mb-2">Incident Commander</h4>
              <div className="p-3 bg-slate-100 rounded">
                <p className="text-sm">Belum ditunjuk</p>
              </div>
            </div>

            {/* Operations */}
            <div>
              <h4 className="font-bold text-nu-green mb-2">Operations Section</h4>
              <div className="p-3 bg-slate-100 rounded">
                <p className="text-sm">Koordinator Operations</p>
              </div>
            </div>

            {/* Planning */}
            <div>
              <h4 className="font-bold text-nu-green mb-2">Planning Section</h4>
              <div className="p-3 bg-slate-100 rounded">
                <p className="text-sm">Koordinator Planning</p>
              </div>
            </div>

            {/* Logistics */}
            <div>
              <h4 className="font-bold text-nu-green mb-2">Logistics Section</h4>
              <div className="p-3 bg-slate-100 rounded">
                <p className="text-sm">Koordinator Logistics</p>
              </div>
            </div>

            {/* Finance */}
            <div>
              <h4 className="font-bold text-nu-green mb-2">Finance/Admin Section</h4>
              <div className="p-3 bg-slate-100 rounded">
                <p className="text-sm">Koordinator Finance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volunteers */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Relawan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="grid gap-2">
                {volunteers.map(v => (
                  <div key={v.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-sm text-slate-600">{v.role}</p>
                    </div>
                    <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>
                      {v.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}