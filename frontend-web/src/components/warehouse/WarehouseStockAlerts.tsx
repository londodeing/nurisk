'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Package, Clock } from 'lucide-react';

interface StockAlert {
  id: string;
  type: 'low_stock' | 'expiring' | 'expired' | 'overstock';
  itemId: string;
  itemName: string;
  currentStock: number;
  threshold: number;
  expiryDate?: string;
  warehouseId: string;
  warehouseName: string;
  createdAt: string;
}

interface WarehouseStockAlertsProps {
  warehouseId?: string;
}

export function WarehouseStockAlerts({ warehouseId }: WarehouseStockAlertsProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring' | 'expired'>('all');

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const url = warehouseId 
          ? `/api/warehouses/${warehouseId}/alerts`
          : '/api/warehouses/alerts';
        const res = await fetch(url);
        const data = await res.json();
        setAlerts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [warehouseId]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'low') return alert.type === 'low_stock' || alert.type === 'overstock';
    if (filter === 'expiring') return alert.type === 'expiring';
    if (filter === 'expired') return alert.type === 'expired';
    return true;
  });

  const alertCounts = {
    low: alerts.filter((a) => a.type === 'low_stock').length,
    expiring: alerts.filter((a) => a.type === 'expiring').length,
    expired: alerts.filter((a) => a.type === 'expired').length,
    overstock: alerts.filter((a) => a.type === 'overstock').length,
  };

  const getAlertIcon = (type: StockAlert['type']) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'expiring':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'overstock':
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: StockAlert['type']) => {
    switch (type) {
      case 'low_stock':
        return 'border-l-red-500';
      case 'expiring':
        return 'border-l-yellow-500';
      case 'expired':
        return 'border-l-red-600';
      case 'overstock':
        return 'border-l-blue-500';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat alerts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Stock Alerts</CardTitle>
          <Badge variant="destructive">{alerts.length} alerts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setFilter('low')}
            className={`p-2 rounded-lg text-center ${
              filter === 'low' ? 'bg-red-100' : 'bg-gray-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mx-auto text-red-500" />
            <p className="text-lg font-bold">{alertCounts.low}</p>
            <p className="text-xs">Rendah</p>
          </button>
          <button
            onClick={() => setFilter('expiring')}
            className={`p-2 rounded-lg text-center ${
              filter === 'expiring' ? 'bg-yellow-100' : 'bg-gray-50'
            }`}
          >
            <Clock className="h-4 w-4 mx-auto text-yellow-500" />
            <p className="text-lg font-bold">{alertCounts.expiring}</p>
            <p className="text-xs">Expiring</p>
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`p-2 rounded-lg text-center ${
              filter === 'expired' ? 'bg-red-100' : 'bg-gray-50'
            }`}
          >
            <AlertCircle className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-lg font-bold">{alertCounts.expired}</p>
            <p className="text-xs">Expired</p>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`p-2 rounded-lg text-center ${
              filter === 'all' ? 'bg-blue-100' : 'bg-gray-50'
            }`}
          >
            <Package className="h-4 w-4 mx-auto text-blue-500" />
            <p className="text-lg font-bold">{alertCounts.overstock}</p>
            <p className="text-xs">Overstock</p>
          </button>
        </div>

        {/* Alert List */}
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 border-l-4 rounded-lg bg-gray-50 ${getAlertColor(alert.type)}`}
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="font-medium">{alert.itemName}</p>
                <p className="text-sm text-gray-500">
                  Stok: {alert.currentStock} (min: {alert.threshold})
                  {alert.expiryDate && ` • Exp: ${new Date(alert.expiryDate).toLocaleDateString('id-ID')}`}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">{alert.warehouseName}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ✓ Tidak ada alerts
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WarehouseStockAlerts;