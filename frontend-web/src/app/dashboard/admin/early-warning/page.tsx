'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, MapIcon, Plus, Bell, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAllWarningData,
  useCreateWarning,
  useDismissWarning,
  useBroadcastWarning,
} from '@/hooks/use-early-warning';
import {
  MOCK_WARNINGS,
  MOCK_ACTIVE_WARNINGS,
  type Warning,
  type WarningCreateRequest,
} from '@/services/earlyWarningService';
import { WarningBanner } from '@/components/warnings/WarningBanner';
import { WarningList } from '@/components/warnings/WarningList';
import { WarningDetail } from '@/components/warnings/WarningDetail';
import { WarningCreation } from '@/components/warnings/WarningCreation';
import { WarningMap } from '@/components/warnings/WarningMap';

export default function EarlyWarningPage() {
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [showCreation, setShowCreation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Fetch all warning data
  const { data: warnings, active, isLoading, isError } = useAllWarningData();

  // Use mock data in development
  const allWarnings = warnings ?? MOCK_WARNINGS;
  const activeWarnings = active ?? MOCK_ACTIVE_WARNINGS;

  // Mutations
  const createMutation = useCreateWarning();
  const dismissMutation = useDismissWarning();
  const broadcastMutation = useBroadcastWarning();

  // Socket effect for real-time updates
  useEffect(() => {
    // In production, connect to socket for real-time warning broadcasts
    // const socket = io(SOCKET_URL);
    // socket.on('warning:new', (warning) => { ... });
  }, []);

  // Handle warning selection
  const handleWarningClick = (warning: Warning) => {
    setSelectedWarning(warning);
  };

  // Handle dismiss
  const handleDismiss = async (warningId: string) => {
    try {
      await dismissMutation.mutateAsync(warningId);
    } catch (error) {
      console.error('Failed to dismiss warning:', error);
    }
  };

  // Handle broadcast
  const handleBroadcast = async (warningId: string) => {
    try {
      await broadcastMutation.mutateAsync({ id: warningId });
    } catch (error) {
      console.error('Failed to broadcast warning:', error);
    }
  };

  // Handle create
  const handleCreate = async (warning: WarningCreateRequest) => {
    try {
      await createMutation.mutateAsync(warning);
      setShowCreation(false);
    } catch (error) {
      console.error('Failed to create warning:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">
              Early Warning System
            </h1>
            <p className="text-sm text-slate-500">
              Kelola peringatan dini dari BMKG dan sistem deteksi dini
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                📋 Daftar
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'map'
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                🗺️ Peta
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreation(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              <Plus className="w-4 h-4" />
              Buat Peringatan
            </button>

            {/* Refresh */}
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Active Warnings Banner */}
        {activeWarnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <Bell className="w-4 h-4" />
              <span>{activeWarnings.length} Peringatan Aktif</span>
            </div>
            {activeWarnings.slice(0, 2).map((warning) => (
              <WarningBanner
                key={warning.id}
                warning={warning}
                onClick={() => handleWarningClick(warning)}
                onDismiss={() => handleDismiss(warning.id)}
                autoDismiss={true}
                showCountdown={true}
              />
            ))}
          </div>
        )}

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
              <WarningMapSkeleton />
            </div>
            <div>
              <WarningListSkeleton />
            </div>
          </div>
        ) : viewMode === 'map' ? (
          /* Map View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WarningMap
                warnings={allWarnings}
                selectedWarning={selectedWarning || undefined}
                onWarningSelect={handleWarningClick}
              />
            </div>
            <div>
              <WarningList
                warnings={allWarnings}
                onWarningClick={handleWarningClick}
                onDismiss={handleDismiss}
                showFilters={true}
              />
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main List */}
            <div className="lg:col-span-2 space-y-4">
              <WarningList
                warnings={allWarnings}
                onWarningClick={handleWarningClick}
                onDismiss={handleDismiss}
                showFilters={true}
                showActiveOnly={false}
              />
            </div>

            {/* Sidebar - Active Warnings */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-slate-100 p-4">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Peringatan Aktif
                </h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {activeWarnings.length}
                </p>
                <p className="text-sm text-slate-500">peringatan</p>
              </div>

              {/* Mini active list */}
              <div className="bg-white rounded-lg border border-slate-100 p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Terbaru
                </h4>
                <div className="space-y-2">
                  {activeWarnings.slice(0, 5).map((warning) => (
                    <div
                      key={warning.id}
                      onClick={() => handleWarningClick(warning)}
                      className="cursor-pointer rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            warning.severity === 'WARNING' || warning.severity === 'EMERGENCY'
                              ? 'bg-red-500'
                              : warning.severity === 'WATCH'
                              ? 'bg-orange-500'
                              : warning.severity === 'ADVISORY'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          )}
                        />
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {warning.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {typeof warning.affectedAreas[0] === 'string' ? warning.affectedAreas[0] : (warning.affectedAreas as any)[0]?.name || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Detail Modal */}
        {selectedWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6">
              <WarningDetail
                warning={selectedWarning}
                onClose={() => setSelectedWarning(null)}
                onBroadcast={() => handleBroadcast(selectedWarning.id)}
                onDismiss={() => {
                  handleDismiss(selectedWarning.id);
                  setSelectedWarning(null);
                }}
                showMap={true}
                showHistory={true}
              />
            </div>
          </div>
        )}

        {/* Warning Creation Modal */}
        {showCreation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-700">
                  Buat Peringatan Baru
                </h2>
                <button
                  onClick={() => setShowCreation(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <WarningCreation
                onSubmit={handleCreate}
                onCancel={() => setShowCreation(false)}
                isLoading={createMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeletons
function WarningMapSkeleton({ className }: { className?: string }) {
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

function WarningListSkeleton({ className }: { className?: string }) {
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