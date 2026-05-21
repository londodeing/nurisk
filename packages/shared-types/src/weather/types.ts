import type { GeoLocation } from '../common/types';

export interface WeatherCondition {
  id: string;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  location: GeoLocation;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  condition: WeatherCondition;
  visibility: number;
  uvIndex?: number;
  updatedAt: string;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  precipitation: number;
  uvIndex?: number;
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  headline: string;
  description: string;
  instructions?: string;
  startAt: string;
  endAt: string;
  area: string[];
}

export interface WeatherData {
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
}
