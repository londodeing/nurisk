import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { WarehouseFilter, WarehouseStatus } from '@nurisk/shared-types/warehouse';
import { WarehousesService } from './warehouses.service';

@Controller('warehouses')
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: {
    name: string;
    type?: string;
    region?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    contact_person?: string;
    phone?: string;
    email?: string;
    operating_hours?: string;
  }) {
    if (!body.name) {
      throw new BadRequestException('Name is required');
    }
    return this.warehousesService.create(body);
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('region') region?: string,
    @Query('status') status?: string,
  ) {
    const filters: WarehouseFilter = {
      type,
      region,
      status: status as WarehouseStatus | undefined,
    };
    return this.warehousesService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      type?: string;
      region?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      contact_person?: string;
      phone?: string;
      email?: string;
      operating_hours?: string;
      status?: string;
    },
  ) {
    return this.warehousesService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.delete(id);
  }
}