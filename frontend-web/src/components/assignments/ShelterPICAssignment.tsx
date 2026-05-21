'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Volunteer } from '@nurisk/shared-types/volunteer';

interface PICAssignmentProps {
  shelterId: string;
  currentPIC?: Volunteer;
  onAssign: (volunteerId: string) => Promise<void>;
}

export function ShelterPICAssignment({ shelterId: _shelterId, currentPIC, onAssign }: PICAssignmentProps) {
  const [search, setSearch] = useState('');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, [search]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/volunteers?search=${search}&status=active&approved=true`);
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

  const validateVolunteer = (volunteer: Volunteer): { valid: boolean; reasons: string[] } => {
    const reasons: string[] = [];

    // Check status
    if (volunteer.status !== 'active') {
      reasons.push('Status volunteer tidak aktif');
    }

    // Check qualifications
    if (!volunteer.qualification.includes('SHELTER_MANAGEMENT')) {
      reasons.push('Tidak memiliki kualifikasi Shelter Management');
    }

    // Check mission history
    if (volunteer.missionsCompleted < 3) {
      reasons.push('Minimal 3 misi harus diselesaikan');
    }

    return {
      valid: reasons.length === 0,
      reasons,
    };
  };

  const handleAssign = async (volunteerId: string) => {
    setAssigning(volunteerId);
    try {
      await onAssign(volunteerId);
      setSelectedVolunteer(null);
    } finally {
      setAssigning(null);
    }
  };

  const getStatusBadge = (status: Volunteer['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Tidak Aktif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Menunggu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Penugasan PIC Shelter</CardTitle>
        <CardDescription>
          Pilih volunteer yang memenuhi syarat sebagai Penanggung Jawab
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current PIC */}
        {currentPIC && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">PIC Saat Ini</p>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <span className="font-medium">{currentPIC.name}</span>
              {getStatusBadge(currentPIC.status)}
            </div>
          </div>
        )}

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

        {/* Volunteer List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-center py-4 text-gray-500">Memuat...</p>
          ) : volunteers.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Tidak ada volunteer ditemukan</p>
          ) : (
            volunteers.map((volunteer) => {
              const validation = validateVolunteer(volunteer);
              const isSelected = selectedVolunteer?.id === volunteer.id;

              return (
                <div
                  key={volunteer.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-nu-green bg-green-50' : 'hover:bg-gray-50'
                  } ${!validation.valid ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedVolunteer(volunteer)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{volunteer.name}</span>
                        {getStatusBadge(volunteer.status)}
                      </div>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                      
                      {/* Qualifications */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {volunteer.qualification.map((q: any) => (
                          <Badge key={q} variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {q}
                          </Badge>
                        ))}
                      </div>

                      {/* Mission History */}
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {volunteer.missionsCompleted} misi diselesaikan
                      </div>
                    </div>

                    {/* Validation Status */}
                    <div>
                      {validation.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <div className="text-xs text-red-500">
                            {validation.reasons.map((r, i) => (
                              <p key={i}>• {r}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assign Button */}
                  {isSelected && validation.valid && (
                    <Button
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssign(volunteer.id);
                      }}
                      disabled={assigning === volunteer.id}
                    >
                      {assigning === volunteer.id ? 'Menugaskan...' : 'Tugaskan sebagai PIC'}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShelterPICAssignment;