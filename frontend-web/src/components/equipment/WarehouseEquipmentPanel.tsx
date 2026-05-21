'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package, Truck, Snowflake, Box, User } from 'lucide-react';

type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  quantity: number;
  unit: string;
  responsibleId?: string;
  responsibleName?: string;
  location?: string;
  lastUpdate?: string;
}

interface EquipmentPanelProps {
  warehouseId: string;
  equipment: Equipment[];
  onAdd: (equipment: Omit<Equipment, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Equipment>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const WAREHOUSE_EQUIPMENT_TYPES = [
  { id: 'FORKLIFT', label: 'Forklift', icon: Package, color: 'text-yellow-500' },
  { id: 'PALLET', label: 'Pallet', icon: Box, color: 'text-brown-500' },
  { id: 'FREEZER', label: 'Freezer', icon: Snowflake, color: 'text-blue-500' },
  { id: 'TRUCK', label: 'Truck', icon: Truck, color: 'text-green-500' },
  { id: 'RACK', label: 'Rak', icon: Package, color: 'text-gray-500' },
  { id: 'SCALE', label: 'Timbangan', icon: Package, color: 'text-purple-500' },
  { id: 'PRINTER', label: 'Printer', icon: Package, color: 'text-orange-500' },
  { id: 'LAINNYA', label: 'Lainnya', icon: Package, color: 'text-gray-500' },
];

export function WarehouseEquipmentPanel({ warehouseId: _warehouseId, equipment, onAdd, onUpdate: _onUpdate, onRemove }: EquipmentPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'LAINNYA',
    quantity: 1,
    unit: 'unit',
    status: 'AVAILABLE' as EquipmentStatus,
  });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newEquipment.name) return;
    setAdding(true);
    try {
      await onAdd(newEquipment);
      setNewEquipment({
        name: '',
        type: 'LAINNYA',
        quantity: 1,
        unit: 'unit',
        status: 'AVAILABLE',
      });
      setShowAddForm(false);
    } finally {
      setAdding(false);
    }
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    const badges: Record<EquipmentStatus, { label: string; color: string }> = {
      AVAILABLE: { label: 'Tersedia', color: 'bg-green-500' },
      IN_USE: { label: 'Digunakan', color: 'bg-blue-500' },
      MAINTENANCE: { label: 'Perawatan', color: 'bg-yellow-500' },
      DAMAGED: { label: 'Rusak', color: 'bg-red-500' },
    };
    const b = badges[status];
    return <Badge className={b.color}>{b.label}</Badge>;
  };

  const getEquipmentIcon = (type: string) => {
    const eq = WAREHOUSE_EQUIPMENT_TYPES.find((e) => e.id === type);
    const Icon = eq?.icon || Package;
    return <Icon className={`w-5 h-5 ${eq?.color || 'text-gray-500'}`} />;
  };

  const totalEquipment = equipment.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Peralatan Gudang</CardTitle>
            <CardDescription>
              Kelola peralatan gudang
            </CardDescription>
          </div>
          <Badge variant="outline">
            {totalEquipment} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment List */}
        <div className="space-y-2">
          {equipment.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              Belum ada peralatan
            </p>
          ) : (
            equipment.map((eq) => (
              <div
                key={eq.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getEquipmentIcon(eq.type)}
                  <div>
                    <p className="font-medium">{eq.name}</p>
                    <p className="text-sm text-gray-500">
                      {eq.quantity} {eq.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {eq.responsibleName && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      {eq.responsibleName}
                    </div>
                  )}
                  {getStatusBadge(eq.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(eq.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Form */}
        {showAddForm ? (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Tambah Peralatan</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Nama</label>
                <Input
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  placeholder="Nama peralatan"
                />
              </div>
              <div>
                <label className="text-sm">Jenis</label>
                <Select
                  value={newEquipment.type}
                  onValueChange={(v) => setNewEquipment({ ...newEquipment, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSE_EQUIPMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Jumlah</label>
                <Input
                  type="number"
                  value={newEquipment.quantity}
                  onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm">Satuan</label>
                <Input
                  value={newEquipment.unit}
                  onChange={(e) => setNewEquipment({ ...newEquipment, unit: e.target.value })}
                  placeholder="unit, pcs, dll"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={adding}>
                {adding ? 'Menambahkan...' : 'Tambah'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Peralatan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default WarehouseEquipmentPanel;