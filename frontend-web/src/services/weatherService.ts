// Weather Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import { WeatherApi } from '@nurisk/sdk/weather'
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

// Helper functions for UI components
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

// Create SDK instance
const weatherApi = new WeatherApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getCurrentWeather = (lat: number, lng: number) => weatherApi.getCurrentWeather(lat, lng)
export const getForecast = (lat: number, lng: number, days?: number) => weatherApi.getForecast(lat, lng, days)
export const getWeatherAlerts = (lat?: number, lng?: number) => weatherApi.getWeatherAlerts(lat, lng)