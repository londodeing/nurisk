'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useShelterOperations, useMissionVolunteers } from '@/hooks/use-shelters';
import { User, CheckCircle } from 'lucide-react';
import type { Shelter } from '@nurisk/shared-types';

interface ShelterPICAssignmentProps {
  shelter: Shelter;
  incidentId?: string;
  onSuccess: () => void;
}

export function ShelterPICAssignment({ shelter, incidentId, onSuccess }: ShelterPICAssignmentProps) {
  const { assignPIC, loading } = useShelterOperations();
  const { volunteers } = useMissionVolunteers(incidentId || '');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(shelter.picId || '');
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedVolunteerId) {
      setError('Pilih volunteer terlebih dahulu');
      return;
    }

    try {
      await assignPIC({
        shelterId: shelter.id,
        volunteerId: selectedVolunteerId,
        assignedBy: 'current-user',
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign PIC');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Penanggung Jawab (PIC)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shelter.picId ? (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">PIC Ditunjuk</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">ID: {shelter.picId}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Pilih volunteer dari database mission untuk menjadi PIC shelter ini.
            </p>
            
            {/* Volunteer Selection */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedVolunteerId === vol.id ? 'border-nu-green bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVolunteerId(vol.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vol.name}</p>
                      <p className="text-xs text-gray-500">{vol.role}</p>
                    </div>
                    {selectedVolunteerId === vol.id && (
                      <CheckCircle className="h-4 w-4 text-nu-green" />
                    )}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {vol.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleAssign} disabled={!selectedVolunteerId || loading} className="w-full">
              {loading ? 'Menetapkan...' : 'Tetapkan PIC'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ShelterPICAssignment;