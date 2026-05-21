import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { DecisionService } from './decision.service';

@Controller('decision')
export class DecisionController {
  constructor(private readonly service: DecisionService) {}

  @Post('execute')
  async execute(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('stats')
  async getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() body: any) {
    return this.service.approve(id, body.selectedOption, body.rationale);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, { status: 'REJECTED', rationale: body.rationale });
  }

  @Post(':id/defer')
  async defer(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, { status: 'DEFERRED', reasoning: body.reason });
  }
}
