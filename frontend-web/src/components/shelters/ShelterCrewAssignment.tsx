'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useShelterOperations, useMissionVolunteers, useShelterCrew } from '@/hooks/use-shelters';
import { Users, Plus } from 'lucide-react';
import type { Shelter, ShelterCrewRole, ShelterCrewAssignment } from '@nurisk/shared-types';

interface ShelterCrewAssignmentProps {
  shelter: Shelter;
  incidentId?: string;
  onSuccess: () => void;
}

const crewRoles: { value: ShelterCrewRole; label: string }[] = [
  { value: 'LOGISTICS', label: 'Logistik' },
  { value: 'MEDICAL', label: 'Medis' },
  { value: 'SECURITY', label: 'Keamanan' },
  { value: 'KITCHEN', label: 'Dapur' },
  { value: 'REGISTRATION', label: 'Registrasi' },
  { value: 'COMMUNICATION', label: 'Komunikasi' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'WAREHOUSE', label: 'Gudang' },
];

export function ShelterCrewAssignment({ shelter, incidentId, onSuccess }: ShelterCrewAssignmentProps) {
  const { assignCrew, loading } = useShelterOperations();
  const { volunteers } = useMissionVolunteers(incidentId || '');
  const { crew, refetch } = useShelterCrew(shelter.id);
  const [showForm, setShowForm] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [selectedRole, setSelectedRole] = useState<ShelterCrewRole>('LOGISTICS');
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedVolunteerId) {
      setError('Pilih volunteer terlebih dahulu');
      return;
    }

    try {
      await assignCrew({
        shelterId: shelter.id,
        volunteerId: selectedVolunteerId,
        role: selectedRole,
        shiftStart: new Date().toISOString(),
        assignedBy: 'current-user',
      });
      setShowForm(false);
      setSelectedVolunteerId('');
      refetch();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign crew');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tim Crew
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Crew List */}
        <div className="space-y-2">
          {crew.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada crew ditugaskan</p>
          ) : (
            crew.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{member.volunteerName}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  member.status === 'ON_DUTY' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add Crew Form */}
        {showForm && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Volunteer</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {volunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className={`p-2 border rounded cursor-pointer ${
                      selectedVolunteerId === vol.id ? 'border-nu-green bg-green-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVolunteerId(vol.id)}
                  >
                    <p className="text-sm font-medium">{vol.name}</p>
                    <p className="text-xs text-gray-500">{vol.role}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Peran</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ShelterCrewRole)}
                className="w-full p-2 border rounded"
              >
                {crewRoles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleAssign} disabled={loading} className="flex-1">
                {loading ? 'Menambahkan...' : 'Tambah Crew'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ShelterCrewAssignment;