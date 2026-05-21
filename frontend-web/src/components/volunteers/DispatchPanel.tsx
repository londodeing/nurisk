'use client';

import { useState } from 'react';
import { Users, Filter, Send, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPriorityColor, getPriorityLabel, getSkillLabel } from '@/services/volunteerDispatchService';
import { useDeployVolunteers } from '@/hooks/use-volunteer-dispatch';
import { VolunteerSuggestion } from './VolunteerSuggestion';
import type { Incident, SkillMatch } from '@/services/volunteerDispatchService';

interface DispatchPanelProps {
  incident: Incident;
  matches: SkillMatch[];
  selectedIds: string[];
  onSelectVolunteer: (id: string) => void;
  onDeselectVolunteer: (id: string) => void;
  className?: string;
}

export function DispatchPanel({
  incident,
  matches,
  selectedIds,
  onSelectVolunteer,
  onDeselectVolunteer,
  className,
}: DispatchPanelProps) {
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const deployMutation = useDeployVolunteers();

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    if (showOnlyAvailable && match.volunteer.status !== 'available') return false;
    if (skillFilter !== 'all' && !match.volunteer.skills.includes(skillFilter)) return false;
    return true;
  });

  // Sort by distance
  const sortedMatches = [...filteredMatches].sort((a, b) => a.distance - b.distance);

  // Selected volunteers
  const selectedMatches = matches.filter((m) => selectedIds.includes(m.volunteer.id));

  // Handle deploy
  const handleDeploy = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deployMutation.mutateAsync({
        incidentId: incident.id,
        volunteerIds: selectedIds,
      });
    } catch (error) {
      console.error('Deploy failed:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Incident Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">
              {incident.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  getPriorityColor(incident.priority)
                )}
              >
                {getPriorityLabel(incident.priority)}
              </span>
              <span className="text-xs text-slate-500">
                {incident.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-700">
              {incident.assignedCount}/{incident.requiredCount}
            </p>
            <p className="text-xs text-slate-500">terpenuhi</p>
          </div>
        </div>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-slate-500">Kebutuhan:</span>
          {incident.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
            >
              {getSkillLabel(skill)}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSkillFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              skillFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Semua
          </button>
          {incident.requiredSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSkillFilter(skill)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                skillFilter === skill
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {getSkillLabel(skill)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-xs text-slate-600">
              Tampilkan hanya volunteer tersedia
            </span>
          </label>
        </div>
      </div>

      {/* Volunteer List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              Volunteer Tersedia ({sortedMatches.length})
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedMatches.map((match) => (
            <VolunteerSuggestion
              key={match.volunteer.id}
              match={match}
              isSelected={selectedIds.includes(match.volunteer.id)}
              onSelect={() => {
                if (selectedIds.includes(match.volunteer.id)) {
                  onDeselectVolunteer(match.volunteer.id);
                } else {
                  onSelectVolunteer(match.volunteer.id);
                }
              }}
            />
          ))}

          {sortedMatches.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada volunteer yang cocok</p>
            </div>
          )}
        </div>
      </div>

      {/* Deploy Button */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              {selectedIds.length} volunteer dipilih
            </p>
            <p className="text-xs text-slate-500">
              {incident.requiredCount - incident.assignedCount} lagi dibutuhkan
            </p>
          </div>
          <button
            onClick={handleDeploy}
            disabled={selectedIds.length === 0 || deployMutation.isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              selectedIds.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400',
              deployMutation.isPending && 'opacity-50'
            )}
          >
            {deployMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Deploy</span>
          </button>
        </div>

        {deployMutation.isError && (
          <p className="text-xs text-red-500 mt-2">
            Gagal menugaskan volunteer. Silakan coba lagi.
          </p>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
function DispatchPanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 animate-pulse', className)}>
      {/* Incident Header */}
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-100 rounded" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="flex gap-1">
            <div className="h-5 w-16 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="h-5 w-20 bg-slate-100 rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-slate-100 rounded-lg" />
          <div className="h-8 w-16 bg-slate-100 rounded-lg" />
          <div className="h-8 w-16 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Volunteer List */}
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="h-5 w-32 bg-slate-100 rounded mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Deploy Button */}
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-slate-100 rounded" />
          <div className="h-10 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default DispatchPanel;