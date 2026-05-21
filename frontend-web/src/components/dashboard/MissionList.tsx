import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw } from 'lucide-react';
import { MissionCard } from './MissionCard';
import type { Mission } from '@nurisk/shared-types/mission';

interface MissionListProps {
  missions: Mission[];
  loading?: boolean;
  onJoin?: (missionId: string) => void;
  onView?: (missionId: string) => void;
  onRefresh?: () => void;
}

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'CRITICAL', label: 'Kritis' },
  { key: 'HIGH', label: 'Tinggi' },
  { key: 'MEDIUM', label: 'Menengah' },
  { key: 'LOW', label: 'Rendah' },
];

export function MissionList({ missions, loading, onJoin, onView, onRefresh }: MissionListProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = missions
    .filter((m) => activeFilter === 'all' || m.priority === activeFilter)
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.location?.address ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Misi Tersedia</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filtered.length} misi</Badge>
            {onRefresh && (
              <button onClick={onRefresh} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Refresh">
                <RefreshCw size={14} className="text-slate-500" />
              </button>
            )}
          </div>
        </div>

        <div className="relative mt-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari misi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? 'bg-nu-green text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg bg-slate-50">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Search size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Tidak ada misi ditemukan</p>
          </div>
        )}

        {!loading && filtered.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onJoin={onJoin}
            onView={onView}
            loading={loading}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default MissionList;
