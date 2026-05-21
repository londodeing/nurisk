"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("./guards/optional-jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const region_guard_1 = require("./guards/region.guard");
function getJwtSecret() {
    // RS256 requires public key - fail if not configured
    if (!process.env.JWT_PUBLIC_KEY) {
        throw new Error('JWT_PUBLIC_KEY environment variable is required for RS256 authentication');
    }
    return process.env.JWT_PUBLIC_KEY;
}
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: getJwtSecret(),
                signOptions: {
                    algorithm: 'RS256',
                    expiresIn: '15m', // Default, overridden in service for refresh token
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            optional_jwt_auth_guard_1.OptionalJwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            region_guard_1.RegionGuard,
        ],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, optional_jwt_auth_guard_1.OptionalJwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard, region_guard_1.RegionGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map