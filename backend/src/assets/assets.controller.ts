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

import { AssetFilter } from './assets.repository';
import { PaginationRequest } from '@nurisk/shared-types/api';
import {
  CreateAssetDTO,
  createAssetSchema,
  CreateTransactionDTO,
  createTransactionSchema,
  UpdateAssetDTO,
  updateAssetSchema,
  AssetsService,
} from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createAssetSchema)) dto: CreateAssetDTO) {
    return this.assetsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    const options: PaginationRequest = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: (sortOrder?.toLowerCase() as 'asc' | 'desc') ?? 'desc',
    };

    const filters: AssetFilter = {
      category,
      status,
      region,
      search,
    };

    return this.assetsService.findAll(filters, options);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.assetsService.findById(id);
  }

  @Get('qr/:qrCode')
  async findByQrCode(@Param('qrCode') qrCode: string) {
    return this.assetsService.findByQrCode(qrCode);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAssetSchema)) dto: UpdateAssetDTO,
  ) {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.assetsService.delete(id);
  }

  @Post('transaction')
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(@Body(new ZodValidationPipe(createTransactionSchema)) dto: CreateTransactionDTO) {
    return this.assetsService.createTransaction(dto);
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id') id: string) {
    return this.assetsService.getTransactions(id);
  }
}