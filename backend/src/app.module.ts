import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { LoggerMiddleware } from './middleware/logger.middleware';

// Import all NestJS modules
import { AuthModule } from './auth/auth.module';
import { IncidentModule } from './incident/incident.module';
import { PrismaModule } from './prisma/prisma.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { BuildingsModule } from './buildings/buildings.module';
import { SheltersModule } from './shelters/shelters.module';
import { AssetsModule } from './assets/assets.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MapsModule } from './maps/maps.module';
import { RiskModule } from './risk/risk.module';
import { GatewayModule } from './gateway/gateway.module';
import { ExternalModule } from './external/external.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { LogisticsModule } from './logistics/logistics.module';
import { MissionsModule } from './missions/missions.module';
import { HealthModule } from './health/health.module';
import { EarlyWarningModule } from './early-warning/early-warning.module';
import { HazardModule } from './hazard/hazard.module';
import { AwarenessModule } from './awareness/awareness.module';
import { DecisionModule } from './decision/decision.module';
import { BriefingModule } from './briefing/briefing.module';
import { WeatherModule } from './weather/weather.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    // Global Infrastructure
    PrismaModule,

    // Core Modules
    AuthModule,
    IncidentModule,
    
    // Supporting Modules
    VolunteersModule,
    BuildingsModule,
    SheltersModule,
    AssetsModule,
    ChatModule,
    NotificationsModule,
    WarehousesModule,
    LogisticsModule,
    MissionsModule,
    
    // Analytics & Maps
    AnalyticsModule,
    MapsModule,
    
    // Risk & External
    RiskModule,
    ExternalModule,

    // Canonical Domain Modules (PHASE-08D)
    EarlyWarningModule,
    HazardModule,
    AwarenessModule,
    DecisionModule,
    BriefingModule,

    // Weather & Resources (PHASE-08)
    WeatherModule,
    ResourcesModule,
    
    // Gateway (Socket.IO)
    GatewayModule,
    
    // Health
    HealthModule,
  ],
  providers: [
    EventEmitter2,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
