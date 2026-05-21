import { Global, Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { Pool } from 'pg';
import { PrismaService } from './prisma.service';
import { DatabaseService, pool } from '../config/database';
import { AuditService } from '../common/services/audit.service';

@Global()
@Module({
  providers: [
    PrismaService,
    DatabaseService,
    AuditService,
    {
      provide: EventEmitter2,
      useValue: new EventEmitter2(),
    },
    {
      provide: Pool,
      useValue: pool,
    },
  ],
  exports: [PrismaService, DatabaseService, AuditService, EventEmitter2, Pool],
})
export class PrismaModule {}
