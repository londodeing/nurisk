'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useShelterOperations } from '@/hooks/use-shelters';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Shelter } from '@nurisk/shared-types';

interface ShelterActivationPanelProps {
  shelter: Shelter;
  onSuccess: () => void;
}

export function ShelterActivationPanel({ shelter, onSuccess }: ShelterActivationPanelProps) {
  const { activateShelter, loading } = useShelterOperations();
  const [commanderId, setCommanderId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Validation checks
  const canActivate = shelter.picId && shelter.status !== 'CLOSED';
  const isApproved = shelter.status === 'APPROVED';

  const handleActivate = async () => {
    if (!canActivate) {
      setError('Shelter belum memenuhi syarat aktivasi');
      return;
    }

    try {
      await activateShelter({
        shelterId: shelter.id,
        commanderApprovedBy: commanderId,
        notes,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate');
    }
  };

  const statusFlow = [
    { status: 'PROPOSED', label: 'Diusulkan', icon: Clock },
    { status: 'PENDING_APPROVAL', label: 'Menunggu Persetujuan', icon: Clock },
    { status: 'APPROVED', label: 'Disetujui', icon: CheckCircle },
    { status: 'ACTIVE', label: 'Aktif', icon: CheckCircle },
  ];

  const currentIndex = statusFlow.findIndex(s => s.status === shelter.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Aktivasi Shelter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Flow */}
        <div className="flex items-center justify-between">
          {statusFlow.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={step.status} className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${isComplete ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-xs mt-1 ${isCurrent ? 'font-bold' : ''}`}>{step.label}</p>
              </div>
            );
          })}
        </div>

        {/* Validation Checklist */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Syarat Aktivasi:</h4>
          <div className="flex items-center gap-2">
            {shelter.picId ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">PIC ditunjuk</span>
          </div>
          <div className="flex items-center gap-2">
            {shelter.incidentId ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">Incident ditugaskan</span>
          </div>
        </div>

        {/* Activation Form */}
        {isApproved && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commander ID</label>
              <Input
                value={commanderId}
                onChange={(e) => setCommanderId(e.target.value)}
                placeholder="Masukkan ID Commander"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catatan</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan aktivasi"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleActivate} disabled={!canActivate || loading} className="w-full">
              {loading ? 'Mengaktifkan...' : 'Aktifkan Shelter'}
            </Button>
          </div>
        )}

        {shelter.status === 'ACTIVE' && (
          <p className="text-green-600 text-center font-medium">Shelter Aktif</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ShelterActivationPanel;