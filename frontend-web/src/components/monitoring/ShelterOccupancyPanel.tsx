'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, UserMinus, UserPlus, Accessibility, Baby } from 'lucide-react';

interface OccupancyData {
  total: number;
  capacity: number;
  male: number;
  female: number;
  children: number;
  elderly: number;
  specialNeeds: number;
  lastUpdate: string;
}

interface OccupancyPanelProps {
  shelterId: string;
  occupancy: OccupancyData;
  onUpdate?: (updates: Partial<OccupancyData>) => Promise<void>;
}

export function ShelterOccupancyPanel({ shelterId: _shelterId, occupancy, onUpdate: _onUpdate }: OccupancyPanelProps) {
  const [occupancyRate, setOccupancyRate] = useState(0);

  useEffect(() => {
    if (occupancy.capacity > 0) {
      setOccupancyRate((occupancy.total / occupancy.capacity) * 100);
    }
  }, [occupancy.total, occupancy.capacity]);

  const getOccupancyStatus = () => {
    if (occupancyRate >= 100) {
      return { label: 'PENUH', color: 'bg-red-500', icon: AlertTriangle };
    }
    if (occupancyRate >= 75) {
      return { label: 'HAMPIR PENUH', color: 'bg-yellow-500', icon: AlertTriangle };
    }
    return { label: 'TERSEDIA', color: 'bg-green-500', icon: Users };
  };

  const getOccupancyColor = () => {
    if (occupancyRate >= 100) return 'bg-red-500';
    if (occupancyRate >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const remaining = Math.max(0, occupancy.capacity - occupancy.total);
  const isOverCapacity = occupancy.total > occupancy.capacity;

  const status = getOccupancyStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={isOverCapacity ? 'border-red-500' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Penghuni Shelter</CardTitle>
            <CardDescription>
              Monitoring kapasitas dan demografi
            </CardDescription>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Occupancy Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Tingkat Penghunaan</span>
            <span className="font-medium">
              {occupancy.total} / {occupancy.capacity} ({occupancyRate.toFixed(0)}%)
            </span>
          </div>
          <Progress 
            value={Math.min(occupancyRate, 100)} 
            className="h-3"
            indicatorClassName={getOccupancyColor()}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <p className="text-2xl font-bold">{occupancy.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>

          {/* Remaining */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <UserMinus className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{remaining}</p>
            <p className="text-xs text-gray-500">Tersedia</p>
          </div>

          {/* Over Capacity */}
          {isOverCapacity && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <UserPlus className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-red-600">{isOverCapacity ? occupancy.total - occupancy.capacity : 0}</p>
              <p className="text-xs text-red-500">Lebih</p>
            </div>
          )}
        </div>

        {/* Gender Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Jenis Kelamin</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Laki-laki</span>
              </div>
              <span className="font-medium">{occupancy.male}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span>Perempuan</span>
              </div>
              <span className="font-medium">{occupancy.female}</span>
            </div>
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Kelompok Rentan</h4>
          <div className="grid grid-cols-3 gap-3">
            {/* Children */}
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <Baby className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-lg font-bold">{occupancy.children}</p>
                <p className="text-xs text-gray-500">Anak</p>
              </div>
            </div>

            {/* Elderly */}
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Accessibility className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{occupancy.elderly}</p>
                <p className="text-xs text-gray-500">Lansia</p>
              </div>
            </div>

            {/* Special Needs */}
            <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
              <Accessibility className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-lg font-bold">{occupancy.specialNeeds}</p>
                <p className="text-xs text-gray-500">Disabilitas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {occupancyRate >= 75 && (
          <div className={`p-4 rounded-lg ${
            occupancyRate >= 100 ? 'bg-red-50' : 'bg-yellow-50'
          }`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                occupancyRate >= 100 ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  occupancyRate >= 100 ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {occupancyRate >= 100 
                    ? 'Kapasitas Penuh!' 
                    : 'Warning: Kapasitas Hampir Penuh'}
                </p>
                <p className="text-sm text-gray-600">
                  {occupancyRate >= 100
                    ? `Terjadi overcapacity ${occupancy.total - occupancy.capacity} orang. Segera cari shelter alternatif.`
                    : `Kapasitas ${remaining} tempat tidur tersisa.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Update */}
        <p className="text-xs text-gray-400 text-center">
          Terakhir diperbarui: {occupancy.lastUpdate 
            ? new Date(occupancy.lastUpdate).toLocaleString('id-ID')
            : '-'}
        </p>
      </CardContent>
    </Card>
  );
}

export default ShelterOccupancyPanel;