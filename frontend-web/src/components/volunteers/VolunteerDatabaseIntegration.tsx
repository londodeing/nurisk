'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserCheck, UserX, MapPin } from 'lucide-react';
import type { Volunteer, VolunteerStatus } from '@nurisk/shared-types/volunteer';
import type { MissionAssignment } from '@nurisk/shared-types/mission';

// =============================================================================
// Types
// =============================================================================

export type { Volunteer, VolunteerStatus };
export type { MissionAssignment };

export interface VolunteerWithAssignment extends Volunteer {
  assignment?: MissionAssignment;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch volunteers from mission_volunteers table
 */
async function fetchMissionVolunteers(filters?: {
  status?: Volunteer['status'];
  region?: string;
  skills?: string[];
}): Promise<Volunteer[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.skills?.length) params.set('skills', filters.skills.join(','));

  const res = await fetch(`/api/volunteers?${params}`);
  return res.json();
}

/**
 * Fetch volunteer assignments from volunteer_assignments table
 */
async function fetchVolunteerAssignments(volunteerId?: string): Promise<MissionAssignment[]> {
  const url = volunteerId
    ? `/api/volunteer-assignments?volunteerId=${volunteerId}`
    : '/api/volunteer-assignments';
  const res = await fetch(url);
  return res.json();
}

/**
 * Validate volunteer for assignment
 */
function validateVolunteer(volunteer: Volunteer): {
  valid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (volunteer.status !== 'approved') {
    reasons.push(`Status: ${volunteer.status} (harus approved)`);
  }

  if (volunteer.status === 'suspended') {
    reasons.push('Volunteer sedang suspended');
  }

  if (volunteer.status === 'inactive') {
    reasons.push('Volunteer tidak aktif');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

/**
 * Check if volunteer has active mission assignment
 */
function hasActiveAssignment(assignment?: MissionAssignment): boolean {
  if (!assignment) return false;
  return ['assigned', 'en_route', 'on_scene'].includes(assignment.status);
}

// =============================================================================
// VolunteerDatabaseIntegration Component
// =============================================================================

interface VolunteerDatabaseIntegrationProps {
  missionId?: string;
  onAssign?: (volunteerId: string) => void;
}

export function VolunteerDatabaseIntegration({
  missionId: _missionId,
  onAssign,
}: VolunteerDatabaseIntegrationProps) {
  const [volunteers, setVolunteers] = useState<VolunteerWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch volunteers from mission_volunteers
        const volunteerData = await fetchMissionVolunteers(
          statusFilter !== 'all' ? { status: statusFilter as Volunteer['status'] } : undefined
        );

        // Fetch assignments from volunteer_assignments
        const assignmentData = await fetchVolunteerAssignments();

        // Merge data
        const merged: VolunteerWithAssignment[] = volunteerData.map((v) => {
          const assignment = assignmentData.find((a) => a.volunteerId === v.id);
          return { ...v, assignment };
        });

        setVolunteers(merged);
      } catch (error) {
        console.error('Failed to load volunteers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [statusFilter]);

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search);

    const validation = validateVolunteer(v);
    const available = !showAvailableOnly || (validation.valid && !hasActiveAssignment(v.assignment));

    return matchesSearch && available;
  });

  const availableCount = volunteers.filter(
    (v) => validateVolunteer(v).valid && !hasActiveAssignment(v.assignment)
  ).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Memuat data volunteer...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Database Volunteer</CardTitle>
          <Badge>{availableCount} tersedia</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, email, atau HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
            <span className="text-sm">Tampilkan hanya yang tersedia</span>
          </label>
        </div>

        {/* Volunteer List */}
        <div className="space-y-2">
          {filteredVolunteers.map((volunteer) => {
            const validation = validateVolunteer(volunteer);
            const hasAssignment = hasActiveAssignment(volunteer.assignment);
            const isValid = validation.valid && !hasAssignment;

            return (
              <div
                key={volunteer.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  !isValid ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isValid ? (
                      <UserCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <UserX className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{volunteer.name}</p>
                    <p className="text-sm text-gray-500">
                      {volunteer.email} • {volunteer.phone}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {volunteer.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      volunteer.status === 'approved'
                        ? 'default'
                        : volunteer.status === 'suspended'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {volunteer.status}
                  </Badge>
                  {volunteer.assignment && (
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {volunteer.assignment.missionName}
                    </Badge>
                  )}
                  {isValid && onAssign && (
                    <Button
                      size="sm"
                      onClick={() => onAssign(volunteer.id)}
                    >
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada volunteer ditemukan
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VolunteerDatabaseIntegration;