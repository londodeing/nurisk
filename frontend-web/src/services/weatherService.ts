// Weather Service - pure utility functions and type re-exports
// SDK calls should use hooks from @/hooks/use-weather or sdk from @/services/api

import type {
  WeatherCondition,
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
} from '@nurisk/shared-types/weather'

export type {
  WeatherCondition,
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
}

export const getUVIndexLevel = (index: number): string => {
  if (index <= 2) return 'Low'
  if (index <= 5) return 'Moderate'
  if (index <= 7) return 'High'
  if (index <= 10) return 'Very High'
  return 'Extreme'
}

export const formatWindSpeed = (speed: number, unit: 'kmh' | 'ms' | 'mph' = 'kmh'): string => {
  if (unit === 'ms') return `${speed.toFixed(1)} m/s`
  if (unit === 'mph') return `${(speed * 0.621371).toFixed(1)} mph`
  return `${speed.toFixed(1)} km/h`
}
