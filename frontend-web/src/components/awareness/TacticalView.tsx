'use client';

import { useState, useEffect, useCallback } from 'react';
import { Map, Layers, Radio, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveMap } from './LiveMap';
import { AssetStatus } from './AssetStatus';
import { CommunicationPanel } from './CommunicationPanel';
import { TimelinePanel } from './TimelinePanel';
import {
  useTacticalData,
  useAssets,
  useIncidents,
  useVolunteers,
  useEvacuationRoutes,
  useExclusionZones,
  useCommunicationChannels,
  useBroadcasts,
  useTimeline,
} from '@/hooks/use-awareness';
import type { Asset, Incident, Volunteer } from '@/services/awarenessService';
import { sendBroadcast } from '@/services/awarenessService';

type ViewMode = 'map' | 'assets' | 'comm' | 'timeline';

interface TacticalViewProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function TacticalView({
  className,
  autoRefresh = true,
  refreshInterval = 10000,
}: TacticalViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use React Query hooks with auto-refresh
  const { isLoading: tacticalLoading } = useTacticalData();
  const { data: assets, isLoading: assetsLoading } = useAssets();
  const { data: incidents, isLoading: incidentsLoading } = useIncidents();
  const { data: volunteers, isLoading: volunteersLoading } = useVolunteers();
  const { data: routes, isLoading: routesLoading } = useEvacuationRoutes();
  const { data: zones, isLoading: zonesLoading } = useExclusionZones();
  const { data: channels, isLoading: channelsLoading } = useCommunicationChannels();
  const { data: broadcasts, isLoading: broadcastsLoading } = useBroadcasts();
  const { data: timeline, isLoading: timelineLoading } = useTimeline(24);

  const assetList = assets ?? [];
  const incidentList = incidents ?? [];
  const volunteerList = volunteers ?? [];
  const routeList = routes ?? [];
  const zoneList = zones ?? [];
  const channelList = channels ?? [];
  const broadcastList = broadcasts ?? [];
  const timelineList = timeline ?? [];

  const isLoading =
    tacticalLoading ||
    assetsLoading ||
    incidentsLoading ||
    volunteersLoading ||
    routesLoading ||
    zonesLoading ||
    channelsLoading ||
    broadcastsLoading ||
    timelineLoading;

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Handle broadcast send
  const handleSendBroadcast = async (
    channelId: string,
    message: string,
    priority: 'normal' | 'urgent' | 'emergency'
  ) => {
    try {
      await sendBroadcast(channelId, message, priority);
    } catch (error) {
      console.error('Failed to send broadcast:', error);
    }
  };

  // Handle click handlers
  const handleIncidentClick = (incident: Incident) => {
    console.log('Incident clicked:', incident);
  };

  const handleAssetClick = (asset: Asset) => {
    console.log('Asset clicked:', asset);
  };

  const handleVolunteerClick = (volunteer: Volunteer) => {
    console.log('Volunteer clicked:', volunteer);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100">
        <div>
          <h1 className="text-lg font-semibold text-slate-700">
            Tactical Awareness
          </h1>
          <p className="text-xs text-slate-500">
            Update: {lastUpdate.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'map'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Peta</span>
            </button>
            <button
              onClick={() => setViewMode('assets')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'assets'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Aset</span>
            </button>
            <button
              onClick={() => setViewMode('comm')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'comm'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Kom</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'timeline'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Aktivitas</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors',
              isRefreshing && 'animate-spin'
            )}
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" />
              <p className="text-sm text-slate-400">Memuat data...</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Map View */}
            {viewMode === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
                <div className="lg:col-span-2">
                  <LiveMap
                    assets={assetList}
                    incidents={incidentList}
                    volunteers={volunteerList}
                    evacuationRoutes={routeList}
                    exclusionZones={zoneList}
                    onIncidentClick={handleIncidentClick}
                    onAssetClick={handleAssetClick}
                    onVolunteerClick={handleVolunteerClick}
                    className="h-full"
                  />
                </div>
                <div className="space-y-4 overflow-y-auto">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                      <p className="text-xs text-slate-500">Incident Aktif</p>
                      <p className="text-xl font-bold text-red-600">
                        {incidentList.length}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                      <p className="text-xs text-slate-500">Volunteer Aktif</p>
                      <p className="text-xl font-bold text-green-600">
                        {volunteerList.filter((v: any) => v.status === 'active').length}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                      <p className="text-xs text-slate-500">Aset Ditugaskan</p>
                      <p className="text-xl font-bold text-blue-600">
                        {assetList.filter((a: any) => a.status === 'deployed').length}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                      <p className="text-xs text-slate-500">Aset Tersedia</p>
                      <p className="text-xl font-bold text-green-600">
                        {assetList.filter((a: any) => a.status === 'available').length}
                      </p>
                    </div>
                  </div>

                  {/* Mini Timeline */}
                  <TimelinePanel
                    events={timelineList.slice(0, 5)}
                    className="max-h-[300px]"
                  />
                </div>
              </div>
            )}

            {/* Assets View */}
            {viewMode === 'assets' && (
              <div className="p-4 overflow-y-auto h-full">
                <AssetStatus
                  assets={assetList}
                  onAssetClick={handleAssetClick}
                />
              </div>
            )}

            {/* Communication View */}
            {viewMode === 'comm' && (
              <div className="p-4 overflow-y-auto h-full">
                <CommunicationPanel
                  channels={channelList}
                  broadcasts={broadcastList}
                  onSendBroadcast={handleSendBroadcast}
                />
              </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="p-4 overflow-y-auto h-full">
                <TimelinePanel events={timelineList} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            Aset:{' '}
            <span className="font-medium text-slate-700">
              {assetList.length}
            </span>
          </span>
          <span>
            Incident:{' '}
            <span className="font-medium text-red-600">
              {incidentList.length}
            </span>
          </span>
          <span>
            Volunteer:{' '}
            <span className="font-medium text-green-600">
              {volunteerList.filter((v: any) => v.status === 'active').length}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}

export default TacticalView;