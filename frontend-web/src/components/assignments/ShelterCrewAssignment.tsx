'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Clock, Plus, Trash2 } from 'lucide-react';
import type { Volunteer } from '@nurisk/shared-types/volunteer';

type CrewRole = 'LOGISTICS' | 'MEDICAL' | 'SECURITY' | 'KITCHEN' | 'REGISTRATION' | 'COMMUNICATION' | 'TRANSPORT' | 'WAREHOUSE';

interface CrewMember {
  id: string;
  volunteerId: string;
  name: string;
  role: CrewRole;
  shift: 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3';
  assignedAt: string;
}

interface Shift {
  id: 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3';
  name: string;
  time: string;
  start: string;
  end: string;
}

interface CrewAssignmentProps {
  shelterId: string;
  crew: CrewMember[];
  onAssign: (volunteerId: string, role: CrewRole, shift: 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3') => Promise<void>;
  onRemove: (crewId: string) => Promise<void>;
}

const CREW_ROLES: { id: CrewRole; label: string; color: string }[] = [
  { id: 'LOGISTICS', label: 'Logistik', color: 'bg-blue-500' },
  { id: 'MEDICAL', label: 'Medis', color: 'bg-red-500' },
  { id: 'SECURITY', label: 'Keamanan', color: 'bg-yellow-500' },
  { id: 'KITCHEN', label: 'Dapur', color: 'bg-orange-500' },
  { id: 'REGISTRATION', label: 'Registrasi', color: 'bg-purple-500' },
  { id: 'COMMUNICATION', label: 'Komunikasi', color: 'bg-pink-500' },
  { id: 'TRANSPORT', label: 'Transportasi', color: 'bg-green-500' },
  { id: 'WAREHOUSE', label: 'Gudang', color: 'bg-gray-500' },
];

const SHIFTS: Shift[] = [
  { id: 'SHIFT_1', name: 'Shift 1', time: '06:00 - 14:00', start: '06:00', end: '14:00' },
  { id: 'SHIFT_2', name: 'Shift 2', time: '14:00 - 22:00', start: '14:00', end: '22:00' },
  { id: 'SHIFT_3', name: 'Shift 3', time: '22:00 - 06:00', start: '22:00', end: '06:00' },
];

export function ShelterCrewAssignment({ shelterId: _shelterId, crew, onAssign, onRemove }: CrewAssignmentProps) {
  const [search, setSearch] = useState('');
  const [filterRole, _setFilterRole] = useState<CrewRole | 'all'>('all');
  const [_filterShift, _setFilterShift] = useState<'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3' | 'all'>('all');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [selectedRole, setSelectedRole] = useState<CrewRole>('LOGISTICS');
  const [selectedShift, setSelectedShift] = useState<'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3'>('SHIFT_1');

  useEffect(() => {
    fetchVolunteers();
  }, [search, filterRole]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      if (filterRole !== 'all') params.append('skill', filterRole);
      
      const response = await fetch(`/api/volunteers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data.volunteers || []);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedVolunteer) return;
    setAssigning(true);
    try {
      await onAssign(selectedVolunteer.id, selectedRole, selectedShift);
      setSelectedVolunteer(null);
    } finally {
      setAssigning(false);
    }
  };

  const getCrewByShift = (shiftId: 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3') => {
    return crew.filter((c) => c.shift === shiftId);
  };

  const getRoleBadge = (role: CrewRole) => {
    const r = CREW_ROLES.find((r) => r.id === role);
    return r ? (
      <Badge className={r.color}>{r.label}</Badge>
    ) : null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Penugasan Crew Shelter</CardTitle>
        <CardDescription>
          Kelola penugasan crew berdasarkan role dan shift
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Crew by Shift */}
        <div className="space-y-4">
          {SHIFTS.map((shift) => (
            <div key={shift.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <h3 className="font-medium">{shift.name}</h3>
                  <span className="text-sm text-gray-500">({shift.time})</span>
                </div>
                <Badge variant="outline">
                  {getCrewByShift(shift.id).length} orang
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {getCrewByShift(shift.id).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div>
                      <p className="font-medium truncate">{member.name}</p>
                      {getRoleBadge(member.role)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(member.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Crew Form */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Tambah Crew</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari volunteer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role */}
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as CrewRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREW_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Shift */}
            <Select value={selectedShift} onValueChange={(v) => setSelectedShift(v as 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFTS.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.time})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volunteer List */}
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {loading ? (
              <p className="text-center py-4 text-gray-500">Memuat...</p>
            ) : volunteers.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Tidak ada volunteer ditemukan</p>
            ) : (
              volunteers.map((volunteer) => (
                <div
                  key={volunteer.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedVolunteer(volunteer)}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{volunteer.name}</p>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Assign Button */}
          {selectedVolunteer && (
            <Button
              className="w-full mt-4"
              onClick={handleAssign}
              disabled={assigning}
            >
              <Plus className="w-4 h-4 mr-2" />
              {assigning ? 'Menambahkan...' : `Tambah ${selectedVolunteer.name} sebagai ${CREW_ROLES.find(r => r.id === selectedRole)?.label}`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShelterCrewAssignment;