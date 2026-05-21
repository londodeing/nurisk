import { Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeRange, AnalyticsFilters } from '@/hooks/use-analytics';

interface ChartFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  isLoading?: boolean;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '90d', label: '90 Hari' },
  { value: '1y', label: '1 Tahun' },
];

const REGIONS = [
  { value: '', label: 'Semua Wilayah' },
  { value: 'jateng', label: 'Jawa Tengah' },
  { value: 'solo', label: 'Kota Surakarta' },
  { value: 'klaten', label: 'Kabupaten Klaten' },
  { value: 'boyolali', label: 'Kabupaten Boyolali' },
  { value: 'sukoharjo', label: 'Kabupaten Sukoharjo' },
  { value: 'wonogiri', label: 'Kabupaten Wonogiri' },
  { value: 'karanganyar', label: 'Kabupaten Karanganyar' },
];

const INCIDENT_TYPES = [
  { value: '', label: 'Semua Jenis' },
  { value: 'flood', label: 'Banjir' },
  { value: 'earthquake', label: 'Gempa Bumi' },
  { value: 'landslide', label: 'Tanah Longsor' },
  { value: 'fire', label: 'Kebakaran' },
  { value: 'storm', label: 'Badai' },
  { value: 'volcano', label: 'Gunung Berapi' },
];

export function ChartFilters({
  filters,
  onFiltersChange,
  isLoading = false,
}: ChartFiltersProps) {
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    onFiltersChange({ ...filters, timeRange });
  };

  const handleRegionChange = (region: string) => {
    onFiltersChange({ ...filters, region });
  };

  const handleTypeChange = (incidentType: string) => {
    onFiltersChange({ ...filters, incidentType });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap gap-4">
        {/* Time Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div className="flex gap-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => handleTimeRangeChange(range.value)}
                disabled={isLoading}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  filters.timeRange === range.value
                    ? 'bg-nu-green text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-500" />
          <select
            value={filters.region || ''}
            onChange={(e) => handleRegionChange(e.target.value)}
            disabled={isLoading}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-nu-green/50',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {REGIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        {/* Incident Type */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-500" />
          <select
            value={filters.incidentType || ''}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isLoading}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-nu-green/50',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {INCIDENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}