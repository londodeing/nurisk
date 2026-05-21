'use client';

import { Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSkillLabel, getVolunteerStatusColor, getVolunteerStatusLabel } from '@/services/volunteerDispatchService';
import type { SkillMatch } from '@/services/volunteerDispatchService';

interface VolunteerSuggestionProps {
  match: SkillMatch;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export function VolunteerSuggestion({
  match,
  isSelected,
  onSelect,
  className,
}: VolunteerSuggestionProps) {
  const { volunteer, matchScore, distanceText } = match;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-lg border-2 p-3 transition-all',
        isSelected
          ? 'border-amber-500 bg-amber-50'
          : 'border-slate-100 bg-white hover:border-slate-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              isSelected
                ? 'border-amber-500 bg-amber-500'
                : 'border-slate-300'
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
          <div>
            <p className="font-medium text-slate-700">{volunteer.name}</p>
            <p className="text-xs text-slate-500">{distanceText}</p>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span className="text-sm font-medium text-slate-700">
              {volunteer.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {Math.round(matchScore)}% match
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {volunteer.skills.map((skill: any) => {
          const isMatching = match.volunteer.skills.some((s: any) =>
            match.volunteer.skills.includes(s)
          );
          return (
            <span
              key={skill}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                isMatching
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {getSkillLabel(skill)}
            </span>
          );
        })}
      </div>

      {/* Status */}
      <div className="mt-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            getVolunteerStatusColor(volunteer.status)
          )}
        >
          {getVolunteerStatusLabel(volunteer.status)}
        </span>
      </div>
    </button>
  );
}

// ============================================
// Sub-components
// ============================================



export default VolunteerSuggestion;