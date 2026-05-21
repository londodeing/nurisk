"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaModule = void 0;
const common_1 = require("@nestjs/common");
const eventemitter2_1 = require("eventemitter2");
const pg_1 = require("pg");
const prisma_service_1 = require("./prisma.service");
const database_1 = require("../config/database");
const audit_service_1 = require("../common/services/audit.service");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            database_1.DatabaseService,
            audit_service_1.AuditService,
            {
                provide: eventemitter2_1.EventEmitter2,
                useValue: new eventemitter2_1.EventEmitter2(),
            },
            {
                provide: pg_1.Pool,
                useValue: database_1.pool,
            },
        ],
        exports: [prisma_service_1.PrismaService, database_1.DatabaseService, audit_service_1.AuditService, eventemitter2_1.EventEmitter2, pg_1.Pool],
    })
], PrismaModule);
//# sourceMappingURL=prisma.module.js.map