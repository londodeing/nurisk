import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import api from '@/services/api';

interface TrendDataPoint {
  date: string;
  flood: number;
  earthquake: number;
  landslide: number;
  fire: number;
  other: number;
}

type TimeRange = '7d' | '30d' | '90d';

const timeRangeLabels: Record<TimeRange, string> = {
  '7d': '7 Hari',
  '30d': '30 Hari',
  '90d': '90 Hari',
};

const COLORS = {
  flood: '#3b82f6',
  earthquake: '#6b7280',
  landslide: '#f59e0b',
  fire: '#ef4444',
  other: '#8b5cf6',
};

export function IncidentTrendChart() {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/trend?range=${timeRange}`);
        setData(res.data);
      } catch (error) {
        console.error('Trend fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrend();
  }, [timeRange]);

  const total = data.reduce((acc, d) => 
    acc + d.flood + d.earthquake + d.landslide + d.fire + d.other, 0
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tren Kejadian</CardTitle>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as TimeRange[]).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {timeRangeLabels[range]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nu-green"></div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-4">
              Total: {total} kejadian dalam {timeRangeLabels[timeRange]}
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFlood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.flood} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.flood} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEarthquake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.earthquake} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.earthquake} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLandslide" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.landslide} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.landslide} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.fire} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.fire} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="flood" 
                  stackId="1" 
                  stroke={COLORS.flood} 
                  fill="url(#colorFlood)" 
                  name="Banjir"
                />
                <Area 
                  type="monotone" 
                  dataKey="earthquake" 
                  stackId="1" 
                  stroke={COLORS.earthquake} 
                  fill="url(#colorEarthquake)" 
                  name="Gempa"
                />
                <Area 
                  type="monotone" 
                  dataKey="landslide" 
                  stackId="1" 
                  stroke={COLORS.landslide} 
                  fill="url(#colorLandslide)" 
                  name="Longsor"
                />
                <Area 
                  type="monotone" 
                  dataKey="fire" 
                  stackId="1" 
                  stroke={COLORS.fire} 
                  fill="url(#colorFire)" 
                  name="Kebakaran"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default IncidentTrendChart;