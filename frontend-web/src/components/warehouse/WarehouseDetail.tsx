'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Package, Truck, AlertTriangle } from 'lucide-react';
import type { Warehouse } from '@nurisk/shared-types/warehouse';

export function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWarehouse() {
      if (!id) return;
      try {
        const res = await fetch(`/api/warehouses/${id}`);
        const data = await res.json();
        setWarehouse(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchWarehouse();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Memuat...</div>;
  }

  if (!warehouse) {
    return <div className="p-8 text-center">Warehouse tidak ditemukan</div>;
  }

  const utilizationPercent = (warehouse.currentStock / warehouse.capacity) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{warehouse.name}</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <MapPin className="h-4 w-4" />
            {warehouse.address}
          </div>
        </div>
        <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
          {warehouse.status}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <Package className="h-8 w-8 text-nu-green mb-2" />
            <p className="text-2xl font-bold">{warehouse.currentStock}</p>
            <p className="text-sm text-gray-500">Total Stok</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Truck className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{warehouse.capacity}</p>
            <p className="text-sm text-gray-500">Kapasitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <User className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{warehouse.manager?.name || '-'}</p>
            <p className="text-sm text-gray-500">Manager</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{Math.round(utilizationPercent)}%</p>
            <p className="text-sm text-gray-500">Utilisasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={`/warehouses/${id}/inventory`}>
          <Button variant="outline">Lihat Inventori</Button>
        </Link>
        <Link to={`/warehouses/${id}/movements`}>
          <Button variant="outline">Riwayat Gerakan</Button>
        </Link>
        <Link to={`/warehouses/${id}/crew`}>
          <Button variant="outline">Tim Assigned</Button>
        </Link>
      </div>
    </div>
  );
}

export default WarehouseDetail;