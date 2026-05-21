import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    bySeverity: {},
    byType: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/admin" className="hover:underline">← Command Center</Link>
          <h1 className="text-xl font-bold">Analytics & Reports</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid gap-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-nu-green">{stats.total}</div>
                    <div className="text-slate-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* By Status */}
            <Card>
              <CardHeader>
                <CardTitle>Berdasarkan Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="text-center p-3 bg-slate-50 rounded">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-slate-600">{status}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Berdasarkan Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(stats.bySeverity || {}).map(([severity, count]) => (
                    <div key={severity} className="text-center p-3 bg-slate-50 rounded">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-slate-600">{severity}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Type */}
            <Card>
              <CardHeader>
                <CardTitle>Berdasarkan Tipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(stats.byType || {}).map(([type, count]) => (
                    <div key={type} className="text-center p-3 bg-slate-50 rounded">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-slate-600">{type}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}