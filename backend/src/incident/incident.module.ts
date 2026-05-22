import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';
import { IncidentRepository } from './incident.repository';

@Module({
  imports: [PrismaModule],
  controllers: [IncidentController],
  providers: [
    IncidentService,
    IncidentRepository,
  ],
  exports: [IncidentService, IncidentRepository],
})
export class IncidentModule {}