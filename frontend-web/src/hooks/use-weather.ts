import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { WeatherData, CurrentWeather, DailyForecast, WeatherAlert } from '@nurisk/shared-types/weather';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useWeather(lat: number, lon: number) {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lon],
    queryFn: () => sdk.weather.getWeatherData(lat, lon),
    staleTime: REFRESH_INTERVAL,
    enabled: lat !== 0 && lon !== 0,
  });
}

export function useCurrentWeather(lat: number, lon: number) {
  return useQuery<CurrentWeather>({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => sdk.weather.getCurrentWeather(lat, lon),
    staleTime: REFRESH_INTERVAL,
    enabled: lat !== 0 && lon !== 0,
  });
}

export function useWeatherForecast(lat: number, lon: number, days: number = 3) {
  return useQuery<DailyForecast[]>({
    queryKey: ['weather', 'forecast', lat, lon, days],
    queryFn: () => sdk.weather.getForecast(lat, lon, days),
    staleTime: REFRESH_INTERVAL,
    enabled: lat !== 0 && lon !== 0,
  });
}

export function useWeatherAlerts(lat: number, lon: number) {
  return useQuery<WeatherAlert[]>({
    queryKey: ['weather', 'alerts', lat, lon],
    queryFn: () => sdk.weather.getAlerts(lat, lon),
    staleTime: 15 * 60 * 1000, // 15 minutes for alerts
    enabled: lat !== 0 && lon !== 0,
  });
}
