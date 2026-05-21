'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

type ShelterActivationStatus = 'PROPOSED' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'INACTIVE';

interface ShelterActivationProps {
  shelterId: string;
  onStatusChange?: (status: ShelterActivationStatus) => void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function ShelterActivationPanel({ shelterId: _shelterId, onStatusChange }: ShelterActivationProps) {
  const user = useAuthStore((s) => s.user);
  const [shelterStatus, setShelterStatus] = useState<ShelterActivationStatus>('PROPOSED');
  const [pic, setPic] = useState<string>('');
  const [crewCount, setCrewCount] = useState<number>(0);
  const [incidentId, setIncidentId] = useState<string>('');
  const [commanderApproved, setCommanderApproved] = useState<boolean>(false);
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [] });

  // Validation rules
  useEffect(() => {
    const errors: string[] = [];

    if (!pic) {
      errors.push('PIC (Penanggung Jawab) belum ditugaskan');
    }
    if (crewCount < 3) {
      errors.push('Minimal 3 crew harus ditugaskan');
    }
    if (!incidentId) {
      errors.push('Incident belum dipilih');
    }
    if (!commanderApproved) {
      errors.push('Belum ada persetujuan commander');
    }

    setValidation({
      valid: errors.length === 0,
      errors,
    });
  }, [pic, crewCount, incidentId, commanderApproved]);

  const handleStatusChange = (newStatus: ShelterActivationStatus) => {
    if (newStatus === 'PENDING_APPROVAL' && !validation.valid) {
      return;
    }
    setShelterStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const getStatusBadge = (status: ShelterActivationStatus) => {
    const variants: Record<ShelterActivationStatus, string> = {
      PROPOSED: 'bg-gray-500',
      PENDING_APPROVAL: 'bg-yellow-500',
      APPROVED: 'bg-blue-500',
      ACTIVE: 'bg-green-500',
      INACTIVE: 'bg-red-500',
    };
    const labels: Record<ShelterActivationStatus, string> = {
      PROPOSED: 'Diusulkan',
      PENDING_APPROVAL: 'Menunggu Persetujuan',
      APPROVED: 'Disetujui',
      ACTIVE: 'Aktif',
      INACTIVE: 'Tidak Aktif',
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const canApprove = user?.role === 'COMMANDER' || user?.role === 'SUPER_ADMIN';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle> Aktivasi Shelter</CardTitle>
            <CardDescription>
              Kelola aktivasi shelter berdasarkan approval commander
            </CardDescription>
          </div>
          {getStatusBadge(shelterStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {!validation.valid && shelterStatus !== 'PROPOSED' && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Aktivasi Diblokir
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-red-600 dark:text-red-400">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PIC */}
          <div>
            <label className="block text-sm font-medium mb-1">PIC (Penanggung Jawab)</label>
            <Input
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="Nama PIC"
              disabled={shelterStatus === 'ACTIVE'}
            />
          </div>

          {/* Crew Count */}
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah Crew</label>
            <Input
              type="number"
              value={crewCount}
              onChange={(e) => setCrewCount(parseInt(e.target.value) || 0)}
              min={0}
              disabled={shelterStatus === 'ACTIVE'}
            />
          </div>

          {/* Incident */}
          <div>
            <label className="block text-sm font-medium mb-1">Incident</label>
            <Input
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              placeholder="ID Incident"
              disabled={shelterStatus === 'ACTIVE'}
            />
          </div>

          {/* Commander Approval */}
          <div>
            <label className="block text-sm font-medium mb-1">Persetujuan Commander</label>
            <div className="flex items-center gap-2 h-10">
              {commanderApproved ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Disetujui
                </span>
              ) : (
                <span className="text-gray-400">Menunggu persetujuan</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {shelterStatus === 'PROPOSED' && (
            <Button
              onClick={() => handleStatusChange('PENDING_APPROVAL')}
              disabled={!validation.valid}
            >
              Ajukan Persetujuan
            </Button>
          )}

          {shelterStatus === 'PENDING_APPROVAL' && canApprove && (
            <>
              <Button
                onClick={() => {
                  setCommanderApproved(true);
                  handleStatusChange('APPROVED');
                }}
                variant="default"
              >
                <Shield className="mr-2 h-4 w-4" />
                Setuju
              </Button>
              <Button
                onClick={() => handleStatusChange('PROPOSED')}
                variant="outline"
              >
                Tolak
              </Button>
            </>
          )}

          {shelterStatus === 'APPROVED' && (
            <Button
              onClick={() => handleStatusChange('ACTIVE')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aktifkan Shelter
            </Button>
          )}

          {shelterStatus === 'ACTIVE' && (
            <Button
              onClick={() => handleStatusChange('INACTIVE')}
              variant="destructive"
            >
              Nonaktifkan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShelterActivationPanel;