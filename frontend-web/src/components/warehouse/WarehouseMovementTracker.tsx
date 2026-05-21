'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpCircle, ArrowDownCircle, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Movement {
  id: string;
  type: 'inbound' | 'outbound' | 'transfer';
  itemName: string;
  quantity: number;
  unit: string;
  from?: string;
  to?: string;
  timestamp: string;
  performedBy: string;
  notes?: string;
}

interface WarehouseMovementTrackerProps {
  warehouseId: string;
}

export function WarehouseMovementTracker({ warehouseId }: WarehouseMovementTrackerProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    async function fetchMovements() {
      try {
        const res = await fetch(`/api/warehouses/${warehouseId}/movements?range=${dateRange}`);
        const data = await res.json();
        setMovements(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovements();
  }, [warehouseId, dateRange]);

  const filteredMovements = movements.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  const inboundCount = movements.filter((m) => m.type === 'inbound').length;
  const outboundCount = movements.filter((m) => m.type === 'outbound').length;

  if (loading) {
    return <div className="p-8 text-center">Memuat riwayat...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Riwayat Pergerakan Stok</CardTitle>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hari Ini</SelectItem>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="90d">90 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <ArrowDownCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{inboundCount}</p>
              <p className="text-sm text-gray-500">Inbound</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <ArrowUpCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{outboundCount}</p>
              <p className="text-sm text-gray-500">Outbound</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Semua
          </Button>
          <Button
            variant={filter === 'inbound' ? 'default' : 'outline'}
            onClick={() => setFilter('inbound')}
          >
            Inbound
          </Button>
          <Button
            variant={filter === 'outbound' ? 'default' : 'outline'}
            onClick={() => setFilter('outbound')}
          >
            Outbound
          </Button>
        </div>

        {/* Movement List */}
        <div className="space-y-3">
          {filteredMovements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex-shrink-0">
                {movement.type === 'inbound' ? (
                  <ArrowDownCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <ArrowUpCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{movement.itemName}</span>
                  <Badge variant={movement.type === 'inbound' ? 'default' : 'secondary'}>
                    {movement.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {movement.quantity} {movement.unit}
                  {movement.from && ` dari ${movement.from}`}
                  {movement.to && ` ke ${movement.to}`}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(movement.timestamp).toLocaleString('id-ID')}
                  <span>•</span>
                  <span>{movement.performedBy}</span>
                </div>
                {movement.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">{movement.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMovements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada pergerakan
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WarehouseMovementTracker;