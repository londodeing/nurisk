import { PrismaService } from '../../prisma/prisma.service';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN';
export declare class AuditService {
    private prisma?;
    constructor(prisma?: PrismaService | undefined);
    log(actorId: string | null, action: AuditAction, entityType: string, entityId?: string, oldValue?: Record<string, unknown>, newValue?: Record<string, unknown>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        actorId: string | null;
        action: string | null;
        entityType: string | null;
        entityId: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
    } | null | undefined>;
}
//# sourceMappingURL=audit.service.d.ts.map