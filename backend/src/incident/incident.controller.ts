import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { IncidentFilter, IncidentStatus, DisasterType, PriorityLevel, PaginationRequest } from './incident.types';
import {
  CreateIncidentDTO,
  createIncidentSchema,
  IncidentService,
  UpdateIncidentDTO,
  updateIncidentSchema,
} from './incident.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('incidents')
export class IncidentController {
  constructor(private incidentService: IncidentService) {}

  /**
   * POST /incidents - Create new incident
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createIncidentSchema)) dto: CreateIncidentDTO) {
    return this.incidentService.create(dto);
  }

  /**
   * GET /incidents - Get all incidents with pagination
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('disaster_type') disasterType?: string,
    @Query('region') region?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    const options: PaginationRequest = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: (sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc'),
    };

    const filters: any = {
      status: status?.toUpperCase() as any,
      severity: priority?.toUpperCase() as any,
      type: disasterType?.toUpperCase() as any,
      province: region,
      startDate,
      endDate,
      search,
    };

    const include = includeDeleted === 'true';

    const result = await this.incidentService.findAll(options, filters, include);

    return {
      success: true,
      data: result.items,
      items: result.items,
      pagination: result.pagination,
      total: result.pagination.total,
    };
  }

  /**
   * GET /incidents/geo - Get incidents as GeoJSON
   */
  @Get('geo')
  async findAllGeoJSON(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('disaster_type') disasterType?: string,
    @Query('region') region?: string
  ) {
    const filters: any = {
      status: status?.toUpperCase() as IncidentStatus | undefined,
      severity: priority?.toUpperCase() as PriorityLevel | undefined,
      type: disasterType?.toUpperCase() as DisasterType | undefined,
      province: region,
    };

    const geojson = await this.incidentService.findAllGeoJSON(filters);
    // Return raw geojson for map compatibility
    return geojson;
  }

  /**
   * GET /incidents/:id - Get incident by ID
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    const include = includeDeleted === 'true';
    return this.incidentService.findById(id, include);
  }

  /**
   * PATCH /incidents/:id - Update incident
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateIncidentSchema)) dto: UpdateIncidentDTO,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    const include = includeDeleted === 'true';
    return this.incidentService.update(id, dto, include);
  }

  /**
   * DELETE /incidents/:id - Soft delete incident
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.incidentService.delete(id);
  }

  /**
   * POST /incidents/:id/restore - Restore soft-deleted incident
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string) {
    return this.incidentService.restore(id);
  }
}