import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { BriefingService } from './briefing.service';

@Controller('briefing')
export class BriefingController {
  constructor(private readonly service: BriefingService) {}

  @Post('generate')
  async generate(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('latest')
  async getLatest() {
    return this.service.getLatest();
  }

  @Get('metrics')
  async getMetrics() {
    return this.service.getMetrics();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
