'use client';

import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Thermometer,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherIcon } from './WeatherIcon';
import { ForecastCard } from './ForecastCard';
import { WeatherAlertBanner } from './WeatherAlert';
import {
  useWeather,
  useCurrentWeather,
  useWeatherForecast,
  useWeatherAlerts,
  MOCK_WEATHER,
  MOCK_CURRENT_WEATHER,
  MOCK_FORECAST,
  MOCK_ALERTS,
} from '@/hooks/use-weather';
import {
  getUVIndexLevel,
  formatWindSpeed,
  type CurrentWeather,
} from '@/services/weatherService';

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  locationName?: string;
  className?: string;
  compact?: boolean;
  showAlerts?: boolean;
  showForecast?: boolean;
}

// Default coordinates (Surabaya)
const DEFAULT_LAT = -7.2575;
const DEFAULT_LON = 112.7521;

export function WeatherWidget({
  lat = DEFAULT_LAT,
  lon = DEFAULT_LON,
  locationName,
  className,
  compact = false,
  showAlerts = true,
  showForecast = true,
}: WeatherWidgetProps) {

  // Try to fetch from API, fall back to mock data
  const { isLoading, error } = useWeather(lat, lon);
  const { data: currentWeather } = useCurrentWeather(lat, lon);
  const { data: forecast } = useWeatherForecast(lat, lon, 3);
  const { data: alerts } = useWeatherAlerts(lat, lon);

  // Use API data or mock data
  const current = currentWeather || MOCK_CURRENT_WEATHER;
  const forecastData = forecast || MOCK_FORECAST;
  const alertData = alerts || MOCK_ALERTS;

  if (isLoading) {
    return <WeatherWidgetSkeleton compact={compact} />;
  }

  if (error && !current) {
    return <WeatherWidgetError />;
  }

  if (compact) {
    return (
      <WeatherWidgetCompact
        current={current}
        locationName={locationName || MOCK_WEATHER.location.name}
        className={className}
      />
    );
  }

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200', className)}>
      {/* Current Weather */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {locationName || MOCK_WEATHER.location.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <WeatherIcon condition={current.condition} size="xl" />
          <div>
            <p className="text-4xl font-bold text-slate-900">
              {current.temperature}°C
            </p>
            <p className="text-sm text-slate-600">{current.conditionText}</p>
            <p className="text-xs text-slate-500">
              Terasa seperti {current.feelsLike}°C
            </p>
          </div>
        </div>

        {/* High/Low */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-red-500" />
            <span className="text-slate-600">Tinggi: {forecastData[0]?.highTemp || 34}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600">Rendah: {forecastData[0]?.lowTemp || 26}°C</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Weather Details */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center">
            <Droplets className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-sm font-semibold text-slate-900">{current.humidity}%</p>
            <p className="text-xs text-slate-500">Kelembaban</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Wind className="w-5 h-5 text-slate-500 mb-1" />
            <p className="text-sm font-semibold text-slate-900">
              {formatWindSpeed(current.windSpeed)}
            </p>
            <p className="text-xs text-slate-500">Angin</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Sun className="w-5 h-5 text-amber-500 mb-1" />
            <p className="text-sm font-semibold text-slate-900">
              {current.uvIndex} ({getUVIndexLevel(current.uvIndex)})
            </p>
            <p className="text-xs text-slate-500">UV Index</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Forecast */}
      {showForecast && (
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Prakiraan 3 Hari</p>
          <div className="grid grid-cols-3 gap-2">
            {forecastData.map((day, index) => (
              <ForecastCard
                key={day.date}
                forecast={day}
                isToday={index === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {showAlerts && alertData.length > 0 && (
        <>
          <div className="border-t border-slate-100" />
          <div className="p-4">
            <WeatherAlertBanner alerts={alertData} />
          </div>
        </>
      )}
    </div>
  );
}

// Compact version
function WeatherWidgetCompact({
  current,
  locationName,
  className,
}: {
  current: CurrentWeather;
  locationName: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200',
        className
      )}
    >
      <WeatherIcon condition={current.condition} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-slate-900">{current.temperature}°C</p>
        <p className="text-xs text-slate-500 truncate">{current.conditionText}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-slate-600 truncate">{locationName}</p>
        <p className="text-xs text-slate-400">H: {current.humidity}%</p>
      </div>
    </div>
  );
}

// Loading skeleton
function WeatherWidgetSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
        <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-16 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-200 animate-pulse rounded-full" />
        <div className="space-y-2">
          <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Error state
function WeatherWidgetError({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 bg-red-50 rounded-xl border border-red-200',
        className
      )}
    >
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-sm font-medium text-red-800">Gagal memuat data cuaca</p>
      <p className="text-xs text-red-600">Silakan coba lagi nanti</p>
    </div>
  );
}

export default WeatherWidget;