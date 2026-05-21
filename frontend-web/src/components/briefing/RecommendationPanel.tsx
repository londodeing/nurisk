'use client';

import { AlertTriangle, ArrowRight, MapPin, Users, MessageSquare, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPriorityColor, getPriorityLabel, getActionTypeLabel } from '@/services/briefingService';
import type { RecommendedAction } from '@/services/briefingService';

interface RecommendationPanelProps {
  actions: RecommendedAction[];
  className?: string;
  onActionClick?: (action: RecommendedAction) => void;
}

export function RecommendationPanel({
  actions,
  className,
  onActionClick,
}: RecommendationPanelProps) {
  // Sort by priority
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-slate-700">
        Rekomendasi Tindakan
      </h3>

      <div className="space-y-3">
        {sortedActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick?.(action)}
            className="w-full text-left bg-white rounded-lg shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ActionTypeIcon type={action.type} />
                  <span className="text-xs text-slate-500">
                    {getActionTypeLabel(action.type)}
                  </span>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    getPriorityColor(action.priority)
                  )}
                >
                  {getPriorityLabel(action.priority)}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                {action.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-500 mb-2">
                {action.description}
              </p>

              {/* Affected Regions */}
              {action.affectedRegions.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>{action.affectedRegions.join(', ')}</span>
                </div>
              )}

              {/* Arrow */}
              <div className="flex justify-end mt-2">
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {actions.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Tidak ada rekomendasi</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function ActionTypeIcon({ type }: { type: RecommendedAction['type'] }) {
  const icons: Record<RecommendedAction['type'], React.ReactNode> = {
    resource: <Truck className="w-4 h-4 text-blue-500" />,
    coordination: <Users className="w-4 h-4 text-green-500" />,
    communication: <MessageSquare className="w-4 h-4 text-purple-500" />,
    evacuation: <AlertTriangle className="w-4 h-4 text-red-500" />,
  };
  return icons[type];
}

export default RecommendationPanel;