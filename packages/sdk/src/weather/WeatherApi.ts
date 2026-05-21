// Weather SDK Module

import { SdkClient } from '../core'
import type {
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
} from '@nurisk/shared-types/weather'

export class WeatherApi {
  constructor(private client: SdkClient) {}

  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    const res = await this.client.get<CurrentWeather>('/weather/current', {
      params: { lat, lon },
    })
    return res.data!
  }

  async getForecast(
    lat: number,
    lon: number,
    days: number = 3
  ): Promise<DailyForecast[]> {
    const res = await this.client.get<DailyForecast[]>('/weather/forecast', {
      params: { lat, lon, days },
    })
    return res.data!
  }

  async getAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    const res = await this.client.get<WeatherAlert[]>('/weather/alerts', {
      params: { lat, lon },
    })
    return res.data!
  }

  async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<CurrentWeather[]> {
    const res = await this.client.get<CurrentWeather[]>('/weather/historical', {
      params: { lat, lon, startDate, endDate },
    })
    return res.data!
  }

  async getWeatherData(lat: number, lon: number): Promise<{
    location: {
      name: string
      region: string
      country: string
      latitude: number
      longitude: number
    }
    current: CurrentWeather
    forecast: DailyForecast[]
    alerts: WeatherAlert[]
    lastUpdated: string
  }> {
    const res = await this.client.get<{
      location: {
        name: string
        region: string
        country: string
        latitude: number
        longitude: number
      }
      current: CurrentWeather
      forecast: DailyForecast[]
      alerts: WeatherAlert[]
      lastUpdated: string
    }>('/weather', {
      params: { lat, lon },
    })
    return res.data!
  }
}