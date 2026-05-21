import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { WeatherData, CurrentWeather, DailyForecast, WeatherAlert } from '@nurisk/shared-types/weather';

// ============================================
// Hooks
// ============================================

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useWeather(lat: number, lon: number) {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lon],
    queryFn: () => sdk.weather.getWeatherData(lat, lon),
    staleTime: REFRESH_INTERVAL,
    enabled: lat > 0 && lon > 0,
  });
}

export function useCurrentWeather(lat: number, lon: number) {
  return useQuery<CurrentWeather>({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => sdk.weather.getCurrentWeather(lat, lon),
    staleTime: REFRESH_INTERVAL,
    enabled: lat > 0 && lon > 0,
  });
}

export function useWeatherForecast(lat: number, lon: number, days: number = 3) {
  return useQuery<DailyForecast[]>({
    queryKey: ['weather', 'forecast', lat, lon, days],
    queryFn: () => sdk.weather.getForecast(lat, lon, days),
    staleTime: REFRESH_INTERVAL,
    enabled: lat > 0 && lon > 0,
  });
}

export function useWeatherAlerts(lat: number, lon: number) {
  return useQuery<WeatherAlert[]>({
    queryKey: ['weather', 'alerts', lat, lon],
    queryFn: () => sdk.weather.getAlerts(lat, lon),
    staleTime: 15 * 60 * 1000, // 15 minutes for alerts
    enabled: lat > 0 && lon > 0,
  });
}

// ============================================
// Mock Data (for development)
// ============================================

export const MOCK_WEATHER: WeatherData = {
  location: {
    name: 'Surabaya',
    region: 'Jawa Timur',
    country: 'Indonesia',
    latitude: -7.2575,
    longitude: 112.7521,
  },
  current: {
    temperature: 32,
    feelsLike: 36,
    humidity: 75,
    windSpeed: 15,
    windDirection: 'Timur',
    pressure: 1010,
    visibility: 10,
    uvIndex: 5,
    condition: 'clear',
    conditionText: 'Cerah',
    icon: '01d',
    updatedAt: new Date().toISOString(),
  },
  forecast: [
    {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0] || '2024-01-01',
      dayName: 'Sen',
      highTemp: 33,
      lowTemp: 26,
      condition: 'clear',
      conditionText: 'Cerah',
      icon: '01d',
      precipitation: 10,
      humidity: 70,
      windSpeed: 12,
    },
    {
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0] || '2024-01-02',
      dayName: 'Sel',
      highTemp: 31,
      lowTemp: 25,
      condition: 'rain',
      conditionText: 'Hujan Ringan',
      icon: '10d',
      precipitation: 60,
      humidity: 80,
      windSpeed: 18,
    },
    {
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0] || '2024-01-03',
      dayName: 'Rab',
      highTemp: 29,
      lowTemp: 24,
      condition: 'rain',
      conditionText: 'Hujan',
      icon: '10d',
      precipitation: 80,
      humidity: 85,
      windSpeed: 22,
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      title: 'Peringatan Cuaca Ekstrem',
      description:
        'Potensi hujan lebat disertai angin kencang dan petir di wilayah Jawa Timur bagian selatan.',
      severity: 'warning',
      area: 'Jawa Timur',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      source: 'BMKG',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const MOCK_CURRENT_WEATHER: CurrentWeather = MOCK_WEATHER.current;

export const MOCK_FORECAST: DailyForecast[] = MOCK_WEATHER.forecast;

export const MOCK_ALERTS: WeatherAlert[] = MOCK_WEATHER.alerts;