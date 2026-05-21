import { Wind, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherIcon } from './WeatherIcon';
import type { DailyForecast } from '@/services/weatherService';

interface ForecastCardProps {
  forecast: DailyForecast;
  isToday?: boolean;
  className?: string;
}

export function ForecastCard({
  forecast,
  isToday = false,
  className,
}: ForecastCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center p-3 rounded-lg bg-slate-50',
        isToday && 'bg-nu-green/10',
        className
      )}
    >
      {/* Day Name */}
      <p className={cn('text-sm font-medium text-slate-600', isToday && 'text-nu-green')}>
        {isToday ? 'Hari Ini' : forecast.dayName}
      </p>

      {/* Weather Icon */}
      <div className="my-2">
        <WeatherIcon condition={forecast.condition} size="lg" />
      </div>

      {/* Temperature */}
      <div className="text-center">
        <p className="text-lg font-bold text-slate-900">
          {forecast.highTemp}°
          <span className="text-sm font-normal text-slate-500">
            /{forecast.lowTemp}°
          </span>
        </p>
      </div>

      {/* Condition Text */}
      <p className="text-xs text-slate-500 mt-1">{forecast.conditionText}</p>

      {/* Additional Info */}
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{forecast.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{forecast.windSpeed} km/h</span>
        </div>
      </div>

      {/* Precipitation */}
      {forecast.precipitation > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <Droplets className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-blue-600">{forecast.precipitation}%</span>
        </div>
      )}
    </div>
  );
}

// Compact version for inline display
interface ForecastCompactProps {
  forecasts: DailyForecast[];
  className?: string;
}

export function ForecastCompact({ forecasts, className }: ForecastCompactProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {forecasts.map((forecast, index) => (
        <div key={forecast.date} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-slate-600">
              {index === 0 ? 'Hari Ini' : forecast.dayName}
            </span>
            <WeatherIcon condition={forecast.condition} size="sm" />
            <span className="text-sm font-semibold text-slate-900">
              {forecast.highTemp}°
            </span>
          </div>
          {index < forecasts.length - 1 && (
            <div className="h-8 w-px bg-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}