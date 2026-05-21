'use client';

import { useState } from 'react';
import { useDecisions } from '@/hooks/use-decision';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import type { Decision } from '@/services/decisionService';

interface DecisionListProps {
  onSelect?: (id: string) => void;
}

export function DecisionList({ onSelect }: DecisionListProps) {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    madeBy: '',
  });
  const { decisions, loading, error, total, refetch } = useDecisions(filters);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    modified: 'bg-blue-100 text-blue-800',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500 mb-4">Gagal memuat keputusan</p>
          <Button onClick={refetch}>Coba Lagi</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Daftar Keputusan ({total})</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="modified">Dimodifikasi</option>
            </select>

            <select
              value={filters.madeBy}
              onChange={(e) => setFilters({ ...filters, madeBy: e.target.value })}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Semua Sumber</option>
              <option value="AI">AI</option>
              <option value="Human">Human</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {decisions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Tidak ada keputusan</p>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                onClick={() => onSelect?.(decision.id)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    decision.madeBy === 'AI' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    <Brain className={`w-5 h-5 ${
                      decision.madeBy === 'AI' ? 'text-purple-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{decision.type}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(decision.createdAt)} • 
                      <span className="ml-1">Kepercayaan: {decision.confidence}%</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    statusColors[decision.status]
                  }`}>
                    {decision.status === 'pending' && 'Menunggu'}
                    {decision.status === 'approved' && 'Disetujui'}
                    {decision.status === 'rejected' && 'Ditolak'}
                    {decision.status === 'modified' && 'Dimodifikasi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}