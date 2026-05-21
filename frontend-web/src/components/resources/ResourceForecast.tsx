'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResourceForecast } from '@/hooks/use-resources';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export function ResourceForecast() {
  const { forecasts, loading, error, refetch: _refetch } = useResourceForecast();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Prediksi Kebutuhan Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecasts.length === 0 ? (
              <p className="text-gray-500">Belum ada data forecast</p>
            ) : (
              forecasts.map((forecast, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{forecast.resourceType}</p>
                    <p className="text-sm text-gray-500">
                      Periode: {forecast.period}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {forecast.predictedDemand}
                      </span>
                      {forecast.predictedDemand > forecast.currentStock ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Stock: {forecast.currentStock}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Procurement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Rekomendasi Pengadaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecasts
              .filter(f => f.recommendedProcurement > 0)
              .map((forecast, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div>
                    <p className="font-medium">{forecast.resourceType}</p>
                    <p className="text-sm text-gray-500">
                      Confidence: {Math.round(forecast.confidence * 100)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-700">
                      +{forecast.recommendedProcurement}
                    </p>
                    <p className="text-xs text-gray-500">unit</p>
                  </div>
                </div>
              ))}
            {forecasts.filter(f => f.recommendedProcurement > 0).length === 0 && (
              <p className="text-gray-500">Tidak ada rekomendasi pengadaan</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResourceForecast;