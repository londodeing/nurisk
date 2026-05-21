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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { ShelterFilter } from '@nurisk/shared-types/shelter';
import { PaginationRequest } from '@nurisk/shared-types/api';
import {
  CreateShelterDTO,
  createShelterSchema,
  UpdateShelterDTO,
  updateShelterSchema,
  SheltersService,
} from './shelters.service';

@Controller('shelters')
export class SheltersController {
  constructor(private sheltersService: SheltersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createShelterSchema)) dto: CreateShelterDTO) {
    return this.sheltersService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('incident_id') incidentId?: string,
  ) {
    const options: PaginationRequest = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: (sortOrder?.toLowerCase() as 'asc' | 'desc') ?? 'desc',
    };

    const filters: ShelterFilter = {
      status: status as any,
      region,
      incidentId,
    };

    return this.sheltersService.findAll(filters, options);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sheltersService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateShelterSchema)) dto: UpdateShelterDTO,
  ) {
    return this.sheltersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.sheltersService.delete(id);
  }

  @Get('incident/:incidentId')
  async findByIncident(@Param('incidentId') incidentId: string) {
    return this.sheltersService.findByIncident(incidentId);
  }
}