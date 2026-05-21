'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  expiryDate?: string;
}

interface WarehouseInventoryPanelProps {
  warehouseId: string;
}

export function WarehouseInventoryPanel({ warehouseId }: WarehouseInventoryPanelProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expired'>('all');

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch(`/api/warehouses/${warehouseId}/inventory`);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, [warehouseId]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchesSearch && item.quantity <= item.minStock;
    if (filter === 'expired') return matchesSearch && item.expiryDate && new Date(item.expiryDate) < new Date();
    return matchesSearch;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minStock) return 'low';
    if (item.quantity >= item.maxStock) return 'overstock';
    return 'normal';
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat inventori...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Inventori Gudang</CardTitle>
          <Badge>{items.length} item</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Semua
          </Button>
          <Button
            variant={filter === 'low' ? 'default' : 'outline'}
            onClick={() => setFilter('low')}
          >
            Rendah
          </Button>
          <Button
            variant={filter === 'expired' ? 'default' : 'outline'}
            onClick={() => setFilter('expired')}
          >
            Expired
          </Button>
        </div>

        {/* Inventory Table */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">
                    {item.quantity} {item.unit}
                  </p>
                  <p className="text-xs text-gray-500">
                    Min: {item.minStock} / Max: {item.maxStock}
                  </p>
                </div>
                {getStockStatus(item) === 'low' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {getStockStatus(item) === 'overstock' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {getStockStatus(item) === 'normal' && (
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada item
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WarehouseInventoryPanel;