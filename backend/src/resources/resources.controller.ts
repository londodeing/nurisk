import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.resourcesService.findAll({
      type,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  async getStats() {
    return this.resourcesService.getStats();
  }

  @Get('forecast')
  async getForecast(@Query('type') type?: string) {
    return this.resourcesService.getForecast(type);
  }

  @Get('optimization')
  async getOptimization() {
    return this.resourcesService.getOptimization();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.resourcesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: Record<string, unknown>) {
    return this.resourcesService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.resourcesService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.resourcesService.delete(id);
  }

  @Post('allocate')
  @HttpCode(HttpStatus.OK)
  async allocate(@Body() body: { resourceId?: string; incidentId?: string; quantity?: number }) {
    return this.resourcesService.allocate(body);
  }

  @Delete('allocate')
  @HttpCode(HttpStatus.OK)
  async deallocate(@Query('resourceId') resourceId?: string, @Query('incidentId') incidentId?: string) {
    return this.resourcesService.deallocate(resourceId, incidentId);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(@Body() body: { resourceId?: string; fromWarehouse?: string; toWarehouse?: string; quantity?: number }) {
    return this.resourcesService.transfer(body);
  }
}
