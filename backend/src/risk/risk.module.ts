import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { HazardMappingService } from '../services/hazard-mapping.service';
import { VulnerabilityAnalysisService } from '../services/vulnerability-analysis.service';
import { RiskRegistryService } from '../services/risk-registry.service';

@Module({
  controllers: [RiskController],
  providers: [
    RiskService,
    HazardMappingService,
    VulnerabilityAnalysisService,
    RiskRegistryService,
    {
      provide: 'EventEmitter2',
      useValue: new EventEmitter2(),
    },
  ],
  exports: [RiskService, HazardMappingService, VulnerabilityAnalysisService, RiskRegistryService],
})
export class RiskModule {}