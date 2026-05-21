import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, CloudSun, Sun, Wind, Droplets, AlertTriangle } from 'lucide-react';
import api from '@/services/api';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

interface ForecastDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
}

interface WeatherAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  expiresAt: string;
}

const conditionIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-8 h-8 text-warning-yellow" />,
  cloudy: <Cloud className="w-8 h-8 text-slate-400" />,
  'partly-cloudy': <CloudSun className="w-8 h-8 text-slate-400" />,
  rainy: <CloudRain className="w-8 h-8 text-blue-500" />,
};

const severityColors = {
  low: 'border-l-blue-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-danger-red',
};

export function WeatherWidget() {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const [currentRes, forecastRes, alertsRes] = await Promise.all([
          api.get('/weather/current'),
          api.get('/weather/forecast'),
          api.get('/weather/alerts'),
        ]);
        setCurrent(currentRes.data);
        setForecast(forecastRes.data);
        setAlerts(alertsRes.data);
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cuaca Jawa Tengah</CardTitle>
        </CardHeader>
        <CardContent>
          {current && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {conditionIcons[current.condition] || <Cloud className="w-8 h-8" />}
                <div>
                  <p className="text-3xl font-bold">{current.temperature}°C</p>
                  <p className="text-sm text-slate-600">{current.location}</p>
                </div>
              </div>
              <div className="text-sm text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  <span>{current.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  <span>{current.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Prakiraan 5 Hari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {forecast.map((day, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 text-center p-3 bg-slate-50 rounded-lg min-w-[80px]"
              >
                <p className="text-sm text-slate-600">
                  {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                </p>
                <div className="my-2">
                  {conditionIcons[day.condition] || <Cloud className="w-6 h-6" />}
                </div>
                <p className="font-bold">{day.tempHigh}°</p>
                <p className="text-sm text-slate-500">{day.tempLow}°</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-yellow" />
              Peringatan Cuaca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 border-l-4 bg-slate-50 rounded ${severityColors[alert.severity]}`}
              >
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs text-slate-500">
                  Berlaku hingga: {new Date(alert.expiresAt).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WeatherWidget;