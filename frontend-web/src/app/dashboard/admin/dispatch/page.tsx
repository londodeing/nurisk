'use client';

import { useState } from 'react';
import { RefreshCw, MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDispatchData } from '@/hooks/use-volunteer-dispatch';
import { MOCK_INCIDENT, MOCK_SKILL_MATCHES } from '@/services/volunteerDispatchService';
import { DispatchMap } from '@/components/volunteers/DispatchMap';
import { DispatchPanel } from '@/components/volunteers/DispatchPanel';

export default function DispatchPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(MOCK_INCIDENT.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: incidentData, isLoading, isError } = useDispatchData(selectedIncidentId);

  // Use mock data in development
  const incident = incidentData.incident ?? MOCK_INCIDENT;
  const matches = incidentData.matches ?? MOCK_SKILL_MATCHES;

  // Handle volunteer selection
  const handleSelectVolunteer = (id: string) => {
    setSelectedIds((prev) => [...prev, id]);
  };

  const handleDeselectVolunteer = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">
              Volunteer Dispatch
            </h1>
            <p className="text-sm text-slate-500">
              Kirim volunteer ke lokasi incident
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Incident Selector */}
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
            >
              <option value={MOCK_INCIDENT.id}>{MOCK_INCIDENT.title}</option>
            </select>

            {/* Refresh */}
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">
              Gagal memuat data. Menggunakan data simulasi.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DispatchMapSkeleton />
            </div>
            <div>
              <DispatchPanelSkeleton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map */}
            <div className="lg:col-span-2">
              <DispatchMap
                incident={incident}
                matches={matches}
                selectedIds={selectedIds}
                onSelectVolunteer={handleSelectVolunteer}
              />
            </div>

            {/* Panel */}
            <div>
              <DispatchPanel
                incident={incident}
                matches={matches}
                selectedIds={selectedIds}
                onSelectVolunteer={handleSelectVolunteer}
                onDeselectVolunteer={handleDeselectVolunteer}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeletons
function DispatchMapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-slate-100 rounded-lg animate-pulse',
        className
      )}
      style={{ minHeight: '500px' }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
          <MapIcon className="w-12 h-12 mx-auto mb-2" />
          <p>Memuat peta...</p>
        </div>
      </div>
    </div>
  );
}

function DispatchPanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 animate-pulse', className)}>
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-4 w-24 bg-slate-100 rounded mt-2" />
      </div>
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="h-5 w-20 bg-slate-100 rounded mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}