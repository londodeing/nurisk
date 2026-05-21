// Weather Domain - CRUD-friendly
import { client } from '../../core/client'
import type {
  WeatherData,
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
} from '@nurisk/shared-types/weather'

export const weatherApi = {
  getWeatherData: (lat: number, lon: number): Promise<WeatherData> =>
    client.get<WeatherData>('/api/v1/weather', { params: { lat, lon } }).then((res) => res.data!),

  getCurrentWeather: (lat: number, lon: number): Promise<CurrentWeather> =>
    client.get<CurrentWeather>('/api/v1/weather/current', { params: { lat, lon } }).then((res) => res.data!),

  getForecast: (
    lat: number,
    lon: number,
    days: number = 3
  ): Promise<DailyForecast[]> =>
    client.get<DailyForecast[]>('/api/v1/weather/forecast', { params: { lat, lon, days } }).then(
      (res) => res.data!
    ),

  getAlerts: (lat: number, lon: number): Promise<WeatherAlert[]> =>
    client.get<WeatherAlert[]>('/api/v1/weather/alerts', { params: { lat, lon } }).then(
      (res) => res.data!
    ),

  getHistoricalWeather: (
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<CurrentWeather[]> =>
    client.get<CurrentWeather[]>('/api/v1/weather/historical', {
      params: { lat, lon, startDate, endDate },
    }).then((res) => res.data!),
}