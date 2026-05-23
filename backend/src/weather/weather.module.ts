import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from '../services/weatherService';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
