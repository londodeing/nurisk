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

import { MissionFilter, MissionStatus } from '@nurisk/shared-types/mission';
import { MissionsService } from './missions.service';

@Controller('missions')
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: {
    name: string;
    description?: string;
    incident_id?: number;
    status?: string;
    priority?: string;
    region?: string;
    start_date?: Date;
    end_date?: Date;
    capacity?: number;
  }) {
    if (!body.name) {
      throw new BadRequestException('Name is required');
    }
    return this.missionsService.create(body);
  }

  @Get()
  async findAll(
    @Query('incident_id') incidentId?: string,
    @Query('region') region?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    const filters: MissionFilter = {
      incidentId: incidentId ?? undefined,
      status: status as MissionStatus | undefined,
    };
    return this.missionsService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.missionsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      description?: string;
      incident_id?: number;
      status?: string;
      priority?: string;
      region?: string;
      start_date?: Date;
      end_date?: Date;
      capacity?: number;
    },
  ) {
    return this.missionsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.missionsService.delete(id);
  }

  @Post(':id/deploy')
  @HttpCode(HttpStatus.CREATED)
  async deploy(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { volunteer_id: number },
  ) {
    if (!body.volunteer_id) {
      throw new BadRequestException('volunteer_id is required');
    }
    return this.missionsService.deployVolunteer(id, body.volunteer_id);
  }

  @Post(':id/recall')
  async recall(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { volunteer_id: number },
  ) {
    if (!body.volunteer_id) {
      throw new BadRequestException('volunteer_id is required');
    }
    return this.missionsService.recallVolunteer(id, body.volunteer_id);
  }

  @Get(':id/deployments')
  async getDeployments(@Param('id', ParseIntPipe) id: number) {
    return this.missionsService.getDeployments(id);
  }
}