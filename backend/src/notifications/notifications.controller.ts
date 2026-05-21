import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import {
  BroadcastDTO,
  broadcastSchema,
  CreateNotificationDTO,
  createNotificationSchema,
  NotificationsService,
} from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ZodValidationPipe(createNotificationSchema)) dto: CreateNotificationDTO) {
    return this.notificationsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('user_id') userId: string,
    @Query('role') role: string,
    @Query('region') region?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.notificationsService.findAll(userId, role, region, limitNum);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.notificationsService.findById(id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @Query('user_id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Query('user_id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('broadcast')
  @HttpCode(HttpStatus.CREATED)
  async broadcast(@Body(new ZodValidationPipe(broadcastSchema)) dto: BroadcastDTO) {
    return this.notificationsService.broadcast(dto);
  }

  @Get('unread/count')
  async getUnreadCount(
    @Query('user_id') userId: string,
    @Query('role') role: string,
    @Query('region') region?: string,
  ) {
    return this.notificationsService.getUnreadCount(userId, role, region);
  }
}