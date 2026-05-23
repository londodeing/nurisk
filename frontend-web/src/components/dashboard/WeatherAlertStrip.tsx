import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useWeatherForecast, useWeatherAlerts } from '@/hooks/use-weather';
import { WeatherIcon } from '@/components/weather/WeatherIcon';

const SEVERITY_COLORS: Record<string, string> = {
  extreme: 'border-l-red-500',
  severe: 'border-l-orange-500',
  moderate: 'border-l-[#D4AF37]',
  minor: 'border-l-blue-400',
};

const SEVERITY_BG: Record<string, string> = {
  extreme: 'bg-red-50',
  severe: 'bg-orange-50',
  moderate: 'bg-[#FFF8E1]',
  minor: 'bg-blue-50',
};

const SEVERITY_ICON: Record<string, string> = {
  extreme: '⛈️',
  severe: '🌊',
  moderate: '🌍',
  minor: '🌤️',
};

interface WeatherAlertStripProps {
  lat: number;
  lon: number;
}

export const WeatherAlertStrip = memo(function WeatherAlertStrip({ lat, lon }: WeatherAlertStripProps) {
  const { data: forecastData, isLoading: forecastLoading, error: forecastError } = useWeatherForecast(lat, lon, 3);
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useWeatherAlerts(lat, lon);

  const loading = forecastLoading || alertsLoading;
  const error = forecastError || alertsError;

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Ramalan Cuaca</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="min-w-[100px] h-24 rounded-[20px] flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Ramalan Cuaca</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="text-center py-6 bg-white rounded-[20px] shadow-sm border border-gray-100">
          <AlertTriangle className="w-8 h-8 mx-auto mb-1.5 text-amber-400" />
          <p className="text-xs text-[#6B7280]">Data cuaca tidak tersedia</p>
        </div>
      </div>
    );
  }

  const forecast = forecastData ?? [];
  const alerts = alertsData ?? [];

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Ramalan Cuaca</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {forecast.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {forecast.slice(0, 3).map((day, i) => (
            <div
              key={i}
              className={`min-w-[100px] p-4 rounded-[20px] text-center shadow-[0_15px_35px_rgba(0,104,55,0.08)] flex-shrink-0 ${i === 0 ? 'bg-[#006837] text-white' : 'bg-white'}`}
            >
              <div className={`text-[10px] font-bold mb-1.5 ${i === 0 ? 'opacity-80' : 'opacity-60'}`}>
                {i === 0 ? 'HARI INI' : i === 1 ? 'BESOK' : 'LUSA'}
              </div>
              <div className="text-xl mb-1">
                <WeatherIcon condition={day.condition} size="sm" />
              </div>
              <div className="font-extrabold text-sm">
                {day.tempMax}°
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-white rounded-[20px] shadow-sm border border-gray-100">
          <span className="text-3xl block mb-1">🌤️</span>
          <p className="text-xs text-[#6B7280]">Prakiraan cuaca belum tersedia</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-[20px] p-4 flex gap-3.5 items-center shadow-[0_15px_35px_rgba(0,104,55,0.08)] border-l-[5px] ${SEVERITY_COLORS[alert.severity] || 'border-l-[#D4AF37]'}`}
            >
              <div className={`w-[50px] h-[50px] rounded-[15px] flex items-center justify-center text-2xl flex-shrink-0 ${SEVERITY_BG[alert.severity] || 'bg-[#EBF5EF]'}`}>
                {SEVERITY_ICON[alert.severity] || '🌍'}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold mb-0.5">{alert.headline}</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});