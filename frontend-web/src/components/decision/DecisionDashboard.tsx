'use client';

import { useDecisionStats } from '@/hooks/use-decision';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export function DecisionDashboard() {
  const { stats, loading, error } = useDecisionStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          Gagal memuat statistik keputusan
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Menunggu Persetujuan',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      title: 'Keputusan AI',
      value: stats.autoDecisions,
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Tingkat Persetujuan',
      value: `${stats.approvalRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Rata-rata Kepercayaan',
      value: `${stats.avgConfidence.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}