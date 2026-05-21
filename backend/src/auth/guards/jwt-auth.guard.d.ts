import { ExecutionContext } from '@nestjs/common';
import type { Observable } from 'rxjs';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/**
 * JWT Authentication Guard
 * Extends Passport's JWT strategy with proper error responses
 * Returns 401 for unauthenticated, 403 for unauthorized
 */
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    handleRequest<TUser = any>(err: Error | null, user: TUser, info: Error | null): TUser;
    /**
     * Override to customize 403 response for authorization failures
     */
    handleRequestError(err: any): never;
}
export {};
//# sourceMappingURL=jwt-auth.guard.d.ts.map