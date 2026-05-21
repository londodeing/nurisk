import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

export interface WeatherData {
  location: { lat: number; lng: number };
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  pressure: number;
  visibility: number;
  condition: string;
  timestamp: Date;
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'storm' | 'flood' | 'heat' | 'cold' | 'wind';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  startTime: Date;
  endTime: Date;
  affectedAreas: string[];
}

export interface ImpactAssessment {
  location: { lat: number; lng: number };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: ImpactFactor[];
  recommendation: string;
}

export interface ImpactFactor {
  factor: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

const BMKG_API_KEY = process.env.BMKG_API_KEY;
const BMKG_BASE_URL = 'https://api.bmkg.go.id';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Get current weather
   */
  async getCurrentWeather(location: { lat: number; lng: number }): Promise<WeatherData> {
    const cacheKey = `${location.lat},${location.lng}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Try BMKG API first
      if (BMKG_API_KEY) {
        const data = await this.fetchBMKGWeather(location);
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    } catch (error) {
      this.logger.warn(`BMKG API error: ${error}`);
    }

    // Fallback to mock data
    const mockData = this.generateMockWeather(location);
    this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
    return mockData;
  }

  /**
   * Fetch weather from BMKG
   */
  private async fetchBMKGWeather(
    location: { lat: number; lng: number }
  ): Promise<WeatherData> {
    const url = `${BMKG_BASE_URL}/weather/v1/current?lat=${location.lat}&lon=${location.lng}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${BMKG_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`BMKG API error: ${response.status}`);
    }

    const json = await response.json();
    return this.parseBMKGResponse(json, location);
  }

  /**
   * Parse BMKG response
   */
  private parseBMKGResponse(
    data: any,
    location: { lat: number; lng: number }
  ): WeatherData {
    return {
      location,
      temperature: data.temperature || 25,
      humidity: data.humidity || 70,
      windSpeed: data.wind_speed || 5,
      windDirection: data.wind_direction || 0,
      precipitation: data.precipitation || 0,
      pressure: data.pressure || 1013,
      visibility: data.visibility || 10,
      condition: data.condition || 'clear',
      timestamp: new Date(),
    };
  }

  /**
   * Generate mock weather data
   */
  private generateMockWeather(location: { lat: number; lng: number }): WeatherData {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 18;

    return {
      location,
      temperature: isDay ? 28 + Math.random() * 4 : 24 + Math.random() * 2,
      humidity: 70 + Math.random() * 20,
      windSpeed: 5 + Math.random() * 10,
      windDirection: Math.random() * 360,
      precipitation: Math.random() > 0.7 ? Math.random() * 20 : 0,
      pressure: 1010 + Math.random() * 10,
      visibility: 8 + Math.random() * 4,
      condition: Math.random() > 0.5 ? 'clear' : 'cloudy',
      timestamp: new Date(),
    };
  }

  /**
   * Get weather alerts
   */
  async getAlerts(location?: { lat: number; lng: number }): Promise<WeatherAlert[]> {
    const alerts: WeatherAlert[] = [];

    try {
      // Get current weather
      const weather = location
        ? await this.getCurrentWeather(location)
        : await this.getCurrentWeather({ lat: -6.2, lng: 106.8 });

      // Check for rain alert
      if (weather.precipitation > 10) {
        alerts.push({
          id: `alert-rain-${Date.now()}`,
          type: 'rain',
          severity: weather.precipitation > 50 ? 'high' : 'medium',
          message: `Heavy rainfall: ${Math.round(weather.precipitation)}mm/h`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          affectedAreas: [],
        });
      }

      // Check for wind alert
      if (weather.windSpeed > 20) {
        alerts.push({
          id: `alert-wind-${Date.now()}`,
          type: 'wind',
          severity: weather.windSpeed > 40 ? 'extreme' : 'high',
          message: `Strong winds: ${Math.round(weather.windSpeed)}km/h`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 7200000),
          affectedAreas: [],
        });
      }

      // Check for heat alert
      if (weather.temperature > 35) {
        alerts.push({
          id: `alert-heat-${Date.now()}`,
          type: 'heat',
          severity: weather.temperature > 40 ? 'high' : 'medium',
          message: `High temperature: ${Math.round(weather.temperature)}°C`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 14400000),
          affectedAreas: [],
        });
      }

      // Emit alerts
      for (const alert of alerts) {
        this.eventEmitter.emit('weather.alert', alert);
      }
    } catch (error) {
      this.logger.warn(`Failed to get alerts: ${error}`);
    }

    return alerts;
  }

  /**
   * Assess weather impact
   */
  async assessImpact(location: { lat: number; lng: number }): Promise<ImpactAssessment> {
    const weather = await this.getCurrentWeather(location);
    const factors: ImpactFactor[] = [];

    // Temperature impact
    if (weather.temperature > 35) {
      factors.push({
        factor: 'temperature',
        value: weather.temperature,
        impact: 'negative',
        description: 'High temperature may cause heat-related incidents',
      });
    } else if (weather.temperature < 20) {
      factors.push({
        factor: 'temperature',
        value: weather.temperature,
        impact: 'neutral',
        description: 'Low temperature reduces certain risks',
      });
    } else {
      factors.push({
        factor: 'temperature',
        value: weather.temperature,
        impact: 'positive',
        description: 'Normal temperature range',
      });
    }

    // Precipitation impact
    if (weather.precipitation > 20) {
      factors.push({
        factor: 'precipitation',
        value: weather.precipitation,
        impact: 'negative',
        description: 'Heavy rain may cause flooding',
      });
    } else if (weather.precipitation > 5) {
      factors.push({
        factor: 'precipitation',
        value: weather.precipitation,
        impact: 'neutral',
        description: 'Moderate rain possible',
      });
    }

    // Wind impact
    if (weather.windSpeed > 30) {
      factors.push({
        factor: 'wind',
        value: weather.windSpeed,
        impact: 'negative',
        description: 'Strong winds may cause damage',
      });
    }

    // Humidity impact
    if (weather.humidity > 85) {
      factors.push({
        factor: 'humidity',
        value: weather.humidity,
        impact: 'negative',
        description: 'High humidity may indicate rain',
      });
    }

    // Calculate risk level
    const negativeFactors = factors.filter((f) => f.impact === 'negative').length;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';

    if (negativeFactors >= 3) riskLevel = 'critical';
    else if (negativeFactors >= 2) riskLevel = 'high';
    else if (negativeFactors >= 1) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate recommendation
    let recommendation: string;
    switch (riskLevel) {
      case 'critical':
        recommendation = 'Monitor closely; prepare for potential incidents';
        break;
      case 'high':
        recommendation = 'Increased vigilance recommended';
        break;
      case 'medium':
        recommendation = 'Standard monitoring';
        break;
      default:
        recommendation = 'Normal operations';
    }

    return {
      location,
      riskLevel,
      factors,
      recommendation,
    };
  }

  /**
   * Get forecast
   */
  async getForecast(
    location: { lat: number; lng: number },
    days = 3
  ): Promise<WeatherData[]> {
    const forecast: WeatherData[] = [];

    for (let i = 0; i < days * 24; i += 6) {
      const date = new Date();
      date.setHours(date.getHours() + i);

      forecast.push({
        location,
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        windDirection: Math.random() * 360,
        precipitation: Math.random() > 0.6 ? Math.random() * 30 : 0,
        pressure: 1008 + Math.random() * 12,
        visibility: 5 + Math.random() * 10,
        condition: Math.random() > 0.4 ? 'clear' : 'rain',
        timestamp: date,
      });
    }

    return forecast;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}