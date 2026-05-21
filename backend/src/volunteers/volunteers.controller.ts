import {
  BadRequestException,
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

import { VolunteerFilter } from '@nurisk/shared-types/volunteer';
import { PaginationRequest } from '@nurisk/shared-types/api';
import {
  CreateVolunteerDTO,
  createVolunteerSchema,
  DeployVolunteerDTO,
  deployVolunteerSchema,
  UpdateVolunteerDTO,
  updateVolunteerSchema,
  VolunteersService,
} from './volunteers.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { toSafeVolunteer } from './dto/volunteer.dto';

@Controller('volunteers')
export class VolunteersController {
  constructor(private volunteersService: VolunteersService) {}

  /**
   * POST /volunteers - Create new volunteer profile
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createVolunteerSchema)) dto: CreateVolunteerDTO) {
    return toSafeVolunteer(await this.volunteersService.create(dto));
  }

  /**
   * GET /volunteers - Get all volunteers with pagination
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('expertise') expertise?: string,
    @Query('search') search?: string,
  ) {
    const options: PaginationRequest = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: (sortOrder?.toLowerCase() as 'asc' | 'desc') ?? 'desc',
    };

    const filters: VolunteerFilter = {
      status: status as any,
      province: region,
      search,
    };

    const result = await this.volunteersService.findAll(filters, options);
    if (result.items && Array.isArray(result.items)) {
      result.items = result.items.map(toSafeVolunteer);
    }
    return result;
  }

  /**
   * GET /volunteers/:id - Get volunteer by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return toSafeVolunteer(await this.volunteersService.findById(id));
  }

  /**
   * PATCH /volunteers/:id - Update volunteer profile
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateVolunteerSchema)) dto: UpdateVolunteerDTO,
  ) {
    return toSafeVolunteer(await this.volunteersService.update(id, dto));
  }

  /**
   * DELETE /volunteers/:id - Delete volunteer profile
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.volunteersService.delete(id);
  }

  /**
   * GET /volunteers/nearby - Find nearby volunteers
   */
  @Get('nearby/list')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('expertise') expertise?: string,
  ) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusKm = radius ? parseInt(radius, 10) : 50;

    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new BadRequestException('Latitude dan Longitude wajib diisi dengan format angka');
    }

    return this.volunteersService.findNearby(latNum, lngNum, radiusKm, expertise);
  }

  /**
   * GET /volunteers/region/:region - Find volunteers by region
   */
  @Get('region/list/:region')
  async findByRegion(@Param('region') region: string) {
    return this.volunteersService.findByRegion(region);
  }

  /**
   * POST /volunteers/deploy - Deploy volunteer to incident
   */
  @Post('deploy')
  @HttpCode(HttpStatus.CREATED)
  async deploy(@Body(new ZodValidationPipe(deployVolunteerSchema)) dto: DeployVolunteerDTO) {
    return this.volunteersService.deploy(dto);
  }

  /**
   * GET /volunteers/:id/deployments - Get volunteer deployments
   */
  @Get(':id/deployments')
  async getDeployments(@Param('id') id: string) {
    return this.volunteersService.getDeployments(id);
  }

  /**
   * POST /volunteers/:id/availability - Set availability schedule
   */
  @Post(':id/availability')
  @HttpCode(HttpStatus.CREATED)
  async setAvailability(
    @Param('id') id: string,
    @Body() body: { date: string; shift_start?: string; shift_end?: string; status?: string },
  ) {
    const { date, shift_start, shift_end, status } = body;

    if (!date) {
      throw new BadRequestException('Tanggal wajib diisi');
    }

    return this.volunteersService.setAvailability(id, date, shift_start, shift_end, status);
  }

  /**
   * GET /volunteers/:id/availability - Get availability schedule
   */
  @Get(':id/availability')
  async getAvailability(
    @Param('id') id: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.volunteersService.getAvailability(id, startDate, endDate);
  }
}