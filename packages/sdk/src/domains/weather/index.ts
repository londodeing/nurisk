// Weather Domain - CRUD-friendly
import { client } from '../../core/client'
import type {
  WeatherData,
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
} from '@nurisk/shared-types/weather'
import { mapCurrentWeather, mapForecast, mapAlerts, mapWeatherData } from './mapper'

export const weatherApi = {
  getWeatherData: (lat: number, lon: number): Promise<WeatherData> =>
    client.get<WeatherData>('/weather', { params: { lat, lon } }).then((res) => mapWeatherData(res.data)),

  getCurrentWeather: (lat: number, lon: number): Promise<CurrentWeather> =>
    client.get<CurrentWeather>('/weather/current', { params: { lat, lon } }).then((res) => mapCurrentWeather(res.data)),

  getForecast: (
    lat: number,
    lon: number,
    days: number = 3
  ): Promise<DailyForecast[]> =>
    client.get<DailyForecast[]>('/weather/forecast', { params: { lat, lon, days } }).then(
      (res) => mapForecast(res.data)
    ),

  getAlerts: (lat: number, lon: number): Promise<WeatherAlert[]> =>
    client.get<WeatherAlert[]>('/weather/alerts', { params: { lat, lon } }).then(
      (res) => mapAlerts(res.data)
    ),

  getHistoricalWeather: (
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<CurrentWeather[]> =>
    client.get<CurrentWeather[]>('/weather/historical', {
      params: { lat, lon, startDate, endDate },
    }).then((res) => (res.data || []).map(mapCurrentWeather)),
}