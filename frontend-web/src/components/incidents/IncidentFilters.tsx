import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  LayoutGrid, 
  List 
} from 'lucide-react';
import type { IncidentFilter, DisasterType, IncidentStatus, PriorityLevel } from '@nurisk/shared-types/incident';

interface IncidentFiltersProps {
  onFilterChange: (filters: IncidentFilter) => void;
  onViewChange: (view: 'table' | 'card') => void;
  view?: 'table' | 'card';
}

// Canonical disaster types
const incidentTypes: { value: DisasterType; label: string }[] = [
  { value: 'BANJIR', label: 'Banjir' },
  { value: 'LONGSOR', label: 'Tanah Longsor' },
  { value: 'GEMPA', label: 'Gempa Bumi' },
  { value: 'TSUNAMI', label: 'Tsunami' },
  { value: 'VOLKANO', label: 'Erupsi Gunung Api' },
  { value: 'KEBAKARAN_HUTAN', label: 'Kebakaran Hutan' },
  { value: 'KEBAKARAN_BANGUNAN', label: 'Kebakaran Bangunan' },
  { value: 'EKSTREM_CUACA', label: 'Ekstrem Cuaca' },
  { value: 'WABAH_PENYAKIT', label: 'Wabah Penyakit' },
];

// Canonical status options
const statusOptions: { value: IncidentStatus; label: string }[] = [
  { value: 'REPORTED', label: 'Dilaporkan' },
  { value: 'ASSIGNED', label: 'Ditugaskan' },
  { value: 'IN_PROGRESS', label: 'Sedang Berlangsung' },
  { value: 'RESOLVED', label: 'Terselesaikan' },
  { value: 'CLOSED', label: 'Ditutup' },
];

// Canonical severity options
const severityOptions: { value: PriorityLevel; label: string }[] = [
  { value: 'CRITICAL', label: 'Kritis' },
  { value: 'HIGH', label: 'Tinggi' },
  { value: 'MEDIUM', label: 'Sedang' },
  { value: 'LOW', label: 'Rendah' },
];

export function IncidentFilters({ onFilterChange, onViewChange, view = 'table' }: IncidentFiltersProps) {
  const [filters, setFilters] = useState<IncidentFilter>({
    search: '',
    type: undefined,
    status: undefined,
    severity: undefined,
    startDate: '',
    endDate: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof IncidentFilter, value: string) => {
    const newFilters: IncidentFilter = { 
      ...filters, 
      [key]: value || undefined 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const emptyFilters: IncidentFilter = {
      search: '',
      type: undefined,
      status: undefined,
      severity: undefined,
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasFilters = filters.type || filters.status || filters.severity || filters.startDate || filters.endDate;

  return (
    <div className="space-y-3">
      {/* Search Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari incident..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'bg-slate-100' : ''}
        >
          <Filter className="w-4 h-4" />
        </Button>
        <div className="flex border rounded-md">
          <Button
            variant={view === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('table')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('card')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-md">
          <Select
            value={filters.type || ''}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <option value="">Semua Jenis</option>
            {incidentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <option value="">Semua Status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.severity || ''}
            onValueChange={(value) => handleFilterChange('severity', value)}
          >
            <option value="">Semua Tingkat</option>
            {severityOptions.map((severity) => (
              <option key={severity.value} value={severity.value}>
                {severity.label}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full"
          />

          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="col-span-full md:col-span-5"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default IncidentFilters;