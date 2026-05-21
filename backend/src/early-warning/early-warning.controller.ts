import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { EarlyWarningService } from './early-warning.service';

@Controller('early-warning')
export class EarlyWarningController {
  constructor(private readonly service: EarlyWarningService) {}

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('active')
  async getActive(@Query() query: any) {
    return this.service.list({ ...query, status: 'ACTIVE' });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/expire')
  async expire(@Param('id') id: string) {
    return this.service.update(id, { status: 'EXPIRED' });
  }
}
