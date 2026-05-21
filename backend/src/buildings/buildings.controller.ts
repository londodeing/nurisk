import {
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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { BuildingFilter } from './buildings.repository';
import { PaginationRequest } from '@nurisk/shared-types/api';
import {
  CreateBuildingDTO,
  createBuildingSchema,
  UpdateBuildingDTO,
  updateBuildingSchema,
  BuildingsService,
} from './buildings.service';

@Controller('buildings')
export class BuildingsController {
  constructor(private buildingsService: BuildingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createBuildingSchema)) dto: CreateBuildingDTO) {
    return this.buildingsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('region') region?: string,
    @Query('struktur') struktur?: string,
    @Query('search') search?: string,
  ) {
    const options: PaginationRequest = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: (sortOrder?.toLowerCase() as 'asc' | 'desc') ?? 'desc',
    };

    const filters: BuildingFilter = {
      region,
      struktur,
      search,
    };

    return this.buildingsService.findAll(filters, options);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateBuildingSchema)) dto: UpdateBuildingDTO,
  ) {
    return this.buildingsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.delete(id);
  }

  @Get('region/list/:region')
  async findByRegion(@Param('region') region: string) {
    return this.buildingsService.findByRegion(region);
  }
}