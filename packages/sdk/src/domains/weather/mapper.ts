// Weather DTO Mapper - transforms backend response to frontend types
import type {
  WeatherData,
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
  WeatherCondition,
} from '@nurisk/shared-types/weather'

// Backend response types (from Open-Meteo via NestJS)
interface BackendCurrentWeather {
  location: { lat: number; lng: number }
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  precipitation: number
  pressure: number
  visibility: number
  uvIndex: number
  condition: string
  conditionText: string
  updatedAt: string
}

interface BackendForecast {
  date: string
  dayName: string
  highTemp: number
  lowTemp: number
  condition: string
  conditionText: string
  humidity: number
  windSpeed: number
  precipitation: number
  uvIndex: number
}

interface BackendAlert {
  id: string
  title: string
  description: string
  severity: string
  area: string
  source: string
  startTime: string
  endTime: string
}

interface BackendWeatherData {
  location: {
    name: string
    region: string
    country: string
    latitude: number
    longitude: number
  }
  current: BackendCurrentWeather
  forecast: BackendForecast[]
  alerts: BackendAlert[]
  lastUpdated: string
}

// WMO condition code to WeatherCondition mapping
const CONDITION_MAP: Record<string, WeatherCondition> = {
  clear: { id: '800', main: 'Clear', description: 'clear sky', icon: '01d' },
  partly_cloudy: { id: '801', main: 'Clouds', description: 'few clouds', icon: '02d' },
  cloudy: { id: '803', main: 'Clouds', description: 'broken clouds', icon: '04d' },
  overcast: { id: '804', main: 'Clouds', description: 'overcast clouds', icon: '04d' },
  fog: { id: '741', main: 'Fog', description: 'fog', icon: '50d' },
  drizzle: { id: '300', main: 'Drizzle', description: 'light intensity drizzle', icon: '09d' },
  rain: { id: '500', main: 'Rain', description: 'light rain', icon: '10d' },
  snow: { id: '600', main: 'Snow', description: 'snow', icon: '13d' },
  thunderstorm: { id: '200', main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
  unknown: { id: '0', main: 'Unknown', description: 'unknown', icon: '' },
}

function mapCondition(condition: string): WeatherCondition {
  return CONDITION_MAP[condition] || { id: '0', main: 'Unknown', description: condition, icon: '' }
}

export function mapCurrentWeather(data: BackendCurrentWeather | unknown): CurrentWeather {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid current weather data')
  }
  const d = data as BackendCurrentWeather
  return {
    location: {
      lat: d.location?.lat ?? 0,
      lng: d.location?.lng ?? 0,
      name: '',
      region: '',
      country: '',
    },
    temperature: d.temperature ?? 0,
    feelsLike: d.feelsLike ?? d.temperature ?? 0,
    humidity: d.humidity ?? 0,
    pressure: d.pressure ?? 0,
    windSpeed: d.windSpeed ?? 0,
    windDirection: d.windDirection ?? 0,
    condition: mapCondition(d.condition ?? 'unknown'),
    visibility: d.visibility ?? 0,
    uvIndex: d.uvIndex,
    updatedAt: d.updatedAt ?? new Date().toISOString(),
  }
}

export function mapForecast(data: BackendForecast[] | unknown): DailyForecast[] {
  if (!Array.isArray(data)) {
    return []
  }
  return data.map((f) => ({
    date: f.date ?? '',
    tempMin: f.lowTemp ?? 0,
    tempMax: f.highTemp ?? 0,
    humidity: f.humidity ?? 0,
    windSpeed: f.windSpeed ?? 0,
    condition: mapCondition(f.condition ?? 'unknown'),
    precipitation: f.precipitation ?? 0,
    uvIndex: f.uvIndex,
  }))
}

export function mapAlerts(data: BackendAlert[] | unknown): WeatherAlert[] {
  if (!Array.isArray(data)) {
    return []
  }
  return data.map((a) => ({
    id: a.id ?? crypto.randomUUID(),
    type: a.source ?? 'weather',
    severity: (a.severity === 'high' || a.severity === 'warning'
      ? 'severe'
      : a.severity === 'medium'
        ? 'moderate'
        : 'minor') as 'minor' | 'moderate' | 'severe' | 'extreme',
    headline: a.title ?? '',
    description: a.description ?? '',
    instructions: undefined,
    startAt: a.startTime ?? new Date().toISOString(),
    endAt: a.endTime ?? new Date().toISOString(),
    area: a.area ? [a.area] : [],
  }))
}

export function mapWeatherData(data: BackendWeatherData | unknown): WeatherData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid weather data')
  }
  const d = data as BackendWeatherData
  return {
    location: d.location ?? { name: '', region: '', country: '', latitude: 0, longitude: 0 },
    current: mapCurrentWeather(d.current),
    forecast: mapForecast(d.forecast),
    alerts: mapAlerts(d.alerts),
    lastUpdated: d.lastUpdated ?? new Date().toISOString(),
  }
}