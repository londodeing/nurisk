'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, User, Baby, Accessibility, AlertCircle } from 'lucide-react';

interface OccupancyData {
  shelterId: string;
  shelterName: string;
  capacity: number;
  currentOccupancy: number;
  male: number;
  female: number;
  children: number;
  elderly: number;
  specialNeeds: number;
  lastUpdated: string;
}

interface ShelterOccupancyPanelProps {
  shelterId?: string;
}

const WARNING_THRESHOLD = 75;
const FULL_THRESHOLD = 100;

export function ShelterOccupancyPanel({ shelterId }: ShelterOccupancyPanelProps) {
  const [data, setData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOccupancy() {
      if (!shelterId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/shelters/${shelterId}/occupancy`);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    }

    fetchOccupancy();
  }, [shelterId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Memuat data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-500">{error || 'Data tidak tersedia'}</p>
        </CardContent>
      </Card>
    );
  }

  const occupancyPercent = (data.currentOccupancy / data.capacity) * 100;
  const remaining = data.capacity - data.currentOccupancy;
  const isWarning = occupancyPercent >= WARNING_THRESHOLD;
  const isFull = occupancyPercent >= FULL_THRESHOLD;
  const isOvercapacity = occupancyPercent > FULL_THRESHOLD;

  const getStatusColor = () => {
    if (isOvercapacity) return 'bg-red-600';
    if (isFull) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isOvercapacity) return 'KELEBIHAN KAPASITAS';
    if (isFull) return 'PENUH';
    if (isWarning) return 'MENDEKATI KAPASITAS';
    return 'TERSEDIA';
  };

  return (
    <Card className={isOvercapacity ? 'border-red-500 border-2' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{data.shelterName}</CardTitle>
          <Badge className={getStatusColor()}>{getStatusText()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Occupancy Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-nu-green">
            {data.currentOccupancy}
            <span className="text-lg text-gray-400">/{data.capacity}</span>
          </div>
          <p className="text-sm text-gray-500">
            {remaining} tempat tidur tersedia
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${getStatusColor()}`}
              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Laki-laki</p>
              <p className="font-semibold">{data.male}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-pink-500" />
            <div>
              <p className="text-sm text-gray-500">Perempuan</p>
              <p className="font-semibold">{data.female}</p>
            </div>
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Grup Rentan</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              <Baby className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Anak: {data.children}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Lansia: {data.elderly}</span>
            </div>
            <div className="flex items-center gap-1">
              <Accessibility className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Disabilitas: {data.specialNeeds}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {isWarning && !isFull && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              Kapasitas mencapai {WARNING_THRESHOLD}%. Segera lakukan koordinasi.
            </div>
          </div>
        )}

        {isFull && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="text-sm text-red-700">
              Shelter sudah penuh. Tidak menerima pengungsi baru.
            </div>
          </div>
        )}

        {isOvercapacity && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="text-sm text-red-800">
              PERINGATAN: Melebihi kapasitas! Evakuasi segera ke shelter terdekat.
            </div>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-gray-400 mt-4 text-right">
          Diperbarui: {new Date(data.lastUpdated).toLocaleString('id-ID')}
        </p>
      </CardContent>
    </Card>
  );
}

export default ShelterOccupancyPanel;