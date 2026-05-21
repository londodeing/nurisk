import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { IncidentRegionData } from '@/hooks/use-analytics';

interface IncidentRegionBarProps {
  data: IncidentRegionData[];
  isLoading?: boolean;
}

export function IncidentRegionBar({ data, isLoading = false }: IncidentRegionBarProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Insiden per Kabupaten/Kota
        </h3>
        <div className="h-80 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Insiden per Kabupaten/Kota
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
        Insiden per Kabupaten/Kota
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              type="category"
              dataKey="region"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value, 'Jumlah']}
            />
            <Legend />
            <Bar
              dataKey="count"
              name="Insiden"
              fill="#16a34a"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}