'use client';

import { AlertTriangle, Truck, Users, Settings, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/services/awarenessService';

interface TimelinePanelProps {
  events: TimelineEvent[];
  className?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

export function TimelinePanel({
  events,
  className,
  onEventClick,
}: TimelinePanelProps) {
  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Aktivitas 24 Jam</h3>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>Real-time</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

        {/* Events */}
        <div className="space-y-4">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                <span className="text-xs font-medium text-slate-500">{date}</span>
              </div>

              {/* Events for this date */}
              {dateEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="relative w-full text-left pl-10 group"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-2.5 w-3 h-3 rounded-full border-2 border-white',
                      getEventColor(event.type)
                    )}
                  />

                  {/* Event card */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          getEventBgColor(event.type)
                        )}
                      >
                        <EventIcon type={event.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">
                          {event.action}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {event.description}
                        </p>
                        {event.entityName && (
                          <p className="text-xs text-slate-400 mt-1">
                            {event.entityName}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">Belum ada aktivitas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function EventIcon({ type }: { type: TimelineEvent['type'] }) {
  const icons: Record<TimelineEvent['type'], React.ReactNode> = {
    incident: <AlertTriangle className="w-4 h-4 text-red-600" />,
    asset: <Truck className="w-4 h-4 text-blue-600" />,
    volunteer: <Users className="w-4 h-4 text-green-600" />,
    system: <Settings className="w-4 h-4 text-slate-600" />,
  };
  return icons[type];
}

function getEventColor(type: TimelineEvent['type']): string {
  const colors: Record<TimelineEvent['type'], string> = {
    incident: 'bg-red-500',
    asset: 'bg-blue-500',
    volunteer: 'bg-green-500',
    system: 'bg-slate-500',
  };
  return colors[type];
}

function getEventBgColor(type: TimelineEvent['type']): string {
  const colors: Record<TimelineEvent['type'], string> = {
    incident: 'bg-red-50',
    asset: 'bg-blue-50',
    volunteer: 'bg-green-50',
    system: 'bg-slate-50',
  };
  return colors[type];
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default TimelinePanel;