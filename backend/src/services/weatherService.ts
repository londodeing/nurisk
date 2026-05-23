import { Injectable, Logger } from '@nestjs/common';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'surface_pressure',
  'visibility',
  'uv_index',
].join(',');

const DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'weather_code',
  'wind_speed_10m_max',
  'relative_humidity_2m_max',
  'uv_index_max',
].join(',');

const WMO_CONDITION_MAP: Record<number, string> = {
  0: 'clear',
  1: 'partly_cloudy',
  2: 'partly_cloudy',
  3: 'partly_cloudy',
  45: 'fog',
  48: 'fog',
  51: 'rain',
  53: 'rain',
  55: 'rain',
  56: 'rain',
  57: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  85: 'snow',
  86: 'snow',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
};

function wmoToCondition(code: number): string {
  return WMO_CONDITION_MAP[code] || 'unknown';
}

function wmoToConditionText(code: number): string {
  if (code === 0) return 'Cerah';
  if (code <= 3) return 'Cerah Berawan';
  if (code <= 48) return 'Berkabut';
  if (code <= 57) return 'Gerimis';
  if (code <= 67) return 'Hujan';
  if (code <= 77) return 'Salju';
  if (code <= 82) return 'Hujan Deras';
  if (code <= 86) return 'Salju Deras';
  if (code >= 95) return 'Badai Petir';
  return 'Tidak Diketahui';
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 300_000;

  constructor() {}

  async getCurrentWeather(location: { lat: number; lng: number }): Promise<{
    location: { lat: number; lng: number };
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    conditionText: string;
    updatedAt: string;
  }> {
    const cacheKey = `current:${location.lat},${location.lng}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const url = `${OPEN_METEO_BASE}?latitude=${location.lat}&longitude=${location.lng}&current=${CURRENT_PARAMS}&timezone=auto`;
    this.logger.log(`[WeatherProvider] request=current url=${url}`);

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    this.logger.log(`[WeatherProvider] request=current status=${res.status}`);

    if (!res.ok) {
      throw new Error(`Open-Meteo current error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json() as {
      current: Record<string, unknown>;
      current_units?: Record<string, string>;
    };
    const c = json.current;
    const code = Number(c.weather_code ?? 0);

    const n = (v: unknown): number => (v == null ? 0 : Number(v));
    const data = {
      location: { lat: location.lat, lng: location.lng },
      temperature: n(c.temperature_2m),
      feelsLike: n(c.apparent_temperature) || n(c.temperature_2m),
      humidity: n(c.relative_humidity_2m),
      windSpeed: n(c.wind_speed_10m),
      windDirection: n(c.wind_direction_10m),
      precipitation: n(c.precipitation),
      pressure: n(c.surface_pressure),
      visibility: n(c.visibility) / 1000,
      uvIndex: n(c.uv_index),
      condition: wmoToCondition(code),
      conditionText: wmoToConditionText(code),
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getForecast(
    location: { lat: number; lng: number },
    days = 3,
  ): Promise<Array<{
    date: string;
    dayName: string;
    highTemp: number;
    lowTemp: number;
    condition: string;
    conditionText: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    uvIndex: number;
  }>> {
    const cacheKey = `forecast:${location.lat},${location.lng}:${days}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const url = `${OPEN_METEO_BASE}?latitude=${location.lat}&longitude=${location.lng}&daily=${DAILY_PARAMS}&timezone=auto&forecast_days=${days}`;
    this.logger.log(`[WeatherProvider] request=forecast url=${url}`);

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    this.logger.log(`[WeatherProvider] request=forecast status=${res.status}`);

    if (!res.ok) {
      throw new Error(`Open-Meteo forecast error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json() as {
      daily: Record<string, unknown[]>;
    };
    const d = json.daily;

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const forecast = ((d.time ?? []) as string[]).map((dateStr: string, i: number) => {
      const code = Number((d.weather_code as number[])?.[i] ?? 0);
      const dt = new Date(dateStr);
      return {
        date: dateStr,
        dayName: dayNames[dt.getDay()],
        highTemp: (d.temperature_2m_max as number[])?.[i] ?? 0,
        lowTemp: (d.temperature_2m_min as number[])?.[i] ?? 0,
        condition: wmoToCondition(code),
        conditionText: wmoToConditionText(code),
        humidity: (d.relative_humidity_2m_max as number[])?.[i] ?? 0,
        windSpeed: (d.wind_speed_10m_max as number[])?.[i] ?? 0,
        precipitation: (d.precipitation_sum as number[])?.[i] ?? 0,
        uvIndex: (d.uv_index_max as number[])?.[i] ?? 0,
      };
    });

    this.cache.set(cacheKey, { data: forecast, timestamp: Date.now() });
    return forecast;
  }

  async getAlerts(location: { lat: number; lng: number }): Promise<Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    area: string;
    source: string;
    startTime: string;
    endTime: string;
  }>> {
    const cacheKey = `alerts:${location.lat},${location.lng}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const url = `${OPEN_METEO_BASE}?latitude=${location.lat}&longitude=${location.lng}&daily=weather_code,precipitation_sum,wind_speed_10m_max,temperature_2m_max&timezone=auto&forecast_days=1`;
    this.logger.log(`[WeatherProvider] request=alerts url=${url}`);

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    this.logger.log(`[WeatherProvider] request=alerts status=${res.status}`);

    if (!res.ok) {
      throw new Error(`Open-Meteo alerts error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json() as {
      daily: Record<string, unknown[]>;
    };
    const d = json.daily;
    const alerts: Array<{
      id: string;
      title: string;
      description: string;
      severity: string;
      area: string;
      source: string;
      startTime: string;
      endTime: string;
    }> = [];

    const code = Number((d.weather_code as number[])?.[0] ?? 0);
    const precip = Number((d.precipitation_sum as number[])?.[0] ?? 0);
    const wind = Number((d.wind_speed_10m_max as number[])?.[0] ?? 0);
    const temp = Number((d.temperature_2m_max as number[])?.[0] ?? 0);

    if (code >= 95) {
      alerts.push({
        id: `alert-storm-${Date.now()}`,
        title: 'Peringatan Badai Petir',
        description: 'Potensi badai petir dengan angin kencang dan petir.',
        severity: 'warning',
        area: `Lat ${location.lat.toFixed(2)}, Lon ${location.lng.toFixed(2)}`,
        source: 'Open-Meteo',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86_400_000).toISOString(),
      });
    } else if (code >= 61 && precip > 20) {
      alerts.push({
        id: `alert-rain-${Date.now()}`,
        title: 'Peringatan Hujan Lebat',
        description: `Curah hujan ${precip.toFixed(1)} mm diperkirakan dalam 24 jam ke depan.`,
        severity: 'warning',
        area: `Lat ${location.lat.toFixed(2)}, Lon ${location.lng.toFixed(2)}`,
        source: 'Open-Meteo',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86_400_000).toISOString(),
      });
    }

    if (wind > 50) {
      alerts.push({
        id: `alert-wind-${Date.now()}`,
        title: 'Peringatan Angin Kencang',
        description: `Kecepatan angin mencapai ${wind.toFixed(0)} km/jam.`,
        severity: wind > 70 ? 'high' : 'medium',
        area: `Lat ${location.lat.toFixed(2)}, Lon ${location.lng.toFixed(2)}`,
        source: 'Open-Meteo',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86_400_000).toISOString(),
      });
    }

    if (temp > 37) {
      alerts.push({
        id: `alert-heat-${Date.now()}`,
        title: 'Peringatan Suhu Tinggi',
        description: `Suhu maksimum ${temp.toFixed(0)}°C.`,
        severity: temp > 40 ? 'high' : 'medium',
        area: `Lat ${location.lat.toFixed(2)}, Lon ${location.lng.toFixed(2)}`,
        source: 'Open-Meteo',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86_400_000).toISOString(),
      });
    }

    this.cache.set(cacheKey, { data: alerts, timestamp: Date.now() });
    return alerts;
  }

  async assessImpact(location: { lat: number; lng: number }) {
    const weather = await this.getCurrentWeather(location);
    const factors: Array<{
      factor: string;
      value: number;
      impact: string;
      description: string;
    }> = [];

    if (weather.temperature > 35) {
      factors.push({ factor: 'temperature', value: weather.temperature, impact: 'negative', description: 'Suhu tinggi berpotensi menyebabkan kejadian terkait panas' });
    } else if (weather.temperature < 20) {
      factors.push({ factor: 'temperature', value: weather.temperature, impact: 'neutral', description: 'Suhu rendah mengurangi beberapa risiko' });
    } else {
      factors.push({ factor: 'temperature', value: weather.temperature, impact: 'positive', description: 'Kisaran suhu normal' });
    }

    if (weather.precipitation > 20) {
      factors.push({ factor: 'precipitation', value: weather.precipitation, impact: 'negative', description: 'Hujan deras berpotensi menyebabkan banjir' });
    } else if (weather.precipitation > 5) {
      factors.push({ factor: 'precipitation', value: weather.precipitation, impact: 'neutral', description: 'Hujan sedang mungkin terjadi' });
    }

    if (weather.windSpeed > 30) {
      factors.push({ factor: 'wind', value: weather.windSpeed, impact: 'negative', description: 'Angin kencang berpotensi menyebabkan kerusakan' });
    }

    if (weather.humidity > 85) {
      factors.push({ factor: 'humidity', value: weather.humidity, impact: 'negative', description: 'Kelembaban tinggi mengindikasikan hujan' });
    }

    const negativeFactors = factors.filter(f => f.impact === 'negative').length;
    let riskLevel: string;
    if (negativeFactors >= 3) riskLevel = 'critical';
    else if (negativeFactors >= 2) riskLevel = 'high';
    else if (negativeFactors >= 1) riskLevel = 'medium';
    else riskLevel = 'low';

    let recommendation: string;
    switch (riskLevel) {
      case 'critical': recommendation = 'Pantau terus; bersiap untuk potensi kejadian'; break;
      case 'high': recommendation = 'Kewaspadaan ditingkatkan'; break;
      case 'medium': recommendation = 'Pemantauan standar'; break;
      default: recommendation = 'Operasi normal';
    }

    return { location, riskLevel, factors, recommendation };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
