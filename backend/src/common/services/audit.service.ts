import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN';

@Injectable()
export class AuditService {
  constructor(private prisma?: PrismaService) {}

  async log(
    actorId: string | null,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
  ) {
    if (!this.prisma) {
      console.warn('AuditService: Prisma not available, skipping audit log');
      return null;
    }
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          oldValue: oldValue as any,
          newValue: newValue as any,
        },
      });
    } catch (error) {
      console.error('[AuditService] Failed to create audit log:', error);
    }
  }
}
