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

import { LogisticsFilter, LogisticsRequestStatus } from '@nurisk/shared-types/logistics';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
export class LogisticsController {
  constructor(private logisticsService: LogisticsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: {
    incident_id: number;
    item_name?: string;
    quantity_requested?: number;
    requester_region?: string;
  }) {
    if (!body.incident_id) {
      throw new BadRequestException('incident_id is required');
    }
    return this.logisticsService.create(body);
  }

  @Get()
  async findAll(
    @Query('incident_id') incidentId?: string,
    @Query('region') region?: string,
    @Query('status') status?: string,
  ) {
    const filters: LogisticsFilter = {
      incidentId: incidentId ?? undefined,
      status: status as LogisticsRequestStatus | undefined,
    };
    return this.logisticsService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.logisticsService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; admin_note?: string },
  ) {
    return this.logisticsService.updateStatus(id, body.status, body.admin_note);
  }

  @Post(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approved_by: string },
  ) {
    return this.logisticsService.approve(id, body.approved_by);
  }

  @Post(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ) {
    return this.logisticsService.reject(id, body.reason);
  }

  @Post(':id/fulfill')
  async fulfill(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { items: { inventory_id: number; quantity: number }[]; fulfilled_by: string },
  ) {
    if (!body.items || !Array.isArray(body.items)) {
      throw new BadRequestException('items array required');
    }
    return this.logisticsService.fulfill(id, body.items, body.fulfilled_by);
  }
}