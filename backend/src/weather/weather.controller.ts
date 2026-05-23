import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from '../services/weatherService';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get()
  async getWeatherData(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : -7.2575;
    const longitude = lon ? parseFloat(lon) : 112.7521;
    const [current, forecast, alerts] = await Promise.all([
      this.weatherService.getCurrentWeather({ lat: latitude, lng: longitude }),
      this.weatherService.getForecast({ lat: latitude, lng: longitude }, 3),
      this.weatherService.getAlerts({ lat: latitude, lng: longitude }),
    ]);
    return {
      location: { name: 'Surabaya', region: 'Jawa Timur', country: 'Indonesia', latitude, longitude },
      current,
      forecast,
      alerts,
      lastUpdated: new Date().toISOString(),
    };
  }

  @Get('current')
  async getCurrentWeather(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : -7.2575;
    const longitude = lon ? parseFloat(lon) : 112.7521;
    return this.weatherService.getCurrentWeather({ lat: latitude, lng: longitude });
  }

  @Get('forecast')
  async getForecast(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('days') days?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : -7.2575;
    const longitude = lon ? parseFloat(lon) : 112.7521;
    const daysNum = days ? parseInt(days, 10) : 3;
    return this.weatherService.getForecast({ lat: latitude, lng: longitude }, daysNum);
  }

  @Get('alerts')
  async getAlerts(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : -7.2575;
    const longitude = lon ? parseFloat(lon) : 112.7521;
    return this.weatherService.getAlerts({ lat: latitude, lng: longitude });
  }
}
