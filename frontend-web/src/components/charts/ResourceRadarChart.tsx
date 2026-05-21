import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ResourceData } from '@/hooks/use-analytics';

interface ResourceRadarChartProps {
  data: ResourceData[];
  isLoading?: boolean;
}

export function ResourceRadarChart({
  data,
  isLoading = false,
}: ResourceRadarChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Penggunaan Sumber Daya
        </h3>
        <div className="h-80 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Penggunaan Sumber Daya
        </h3>
        <div className="h-80 flex items-center justify-center text-slate-500">
          Tidak ada data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Penggunaan Sumber Daya
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="resource"
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <PolarRadiusAxis
              angle={30}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value, '']}
            />
            <Legend />
            <Radar
              name="Terpakai"
              dataKey="used"
              stroke="#16a34a"
              fill="#16a34a"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Tersedia"
              dataKey="available"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}