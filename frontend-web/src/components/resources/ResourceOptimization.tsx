'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResourceOptimization } from '@/hooks/use-resources';
import { Lightbulb, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

export function ResourceOptimization() {
  const { optimizations, loading, error, refetch: _refetch } = useResourceOptimization();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const priorityColors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-green-300 bg-green-50',
  };

  const priorityLabels = {
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Saran Optimasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.length === 0 ? (
              <p className="text-gray-500">Tidak ada saran optimasi</p>
            ) : (
              optimizations.map((opt, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${priorityColors[opt.priority]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          opt.priority === 'high' 
                            ? 'bg-red-200 text-red-800'
                            : opt.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {priorityLabels[opt.priority]}
                        </span>
                        <span className="font-medium">{opt.resourceId}</span>
                      </div>
                      <p className="text-sm">{opt.issue}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Saran:</span> {opt.suggestion}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-700">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-bold">
                          {opt.potentialSavings.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">penghematan</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Metrik Efisiensi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-gray-500">Utilization Rate</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">92%</p>
              <p className="text-sm text-gray-500">Response Time</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">78%</p>
              <p className="text-sm text-gray-500">Cost Efficiency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Underutilized Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Resources Kurang Terpakai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Ambulans A</span>
              <span className="text-yellow-600">20% utilization</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Generator #3</span>
              <span className="text-yellow-600">15% utilization</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Radio HF #12</span>
              <span className="text-yellow-600">10% utilization</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResourceOptimization;