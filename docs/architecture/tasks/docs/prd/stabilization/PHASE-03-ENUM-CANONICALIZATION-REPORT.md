# Enum Canonicalization Report

## Summary
- **Prisma enums total**: 43
- **Canonical shared-types coverage**: 43 (100%)
- **Value mismatches fixed**: 7 domain enum files aligned to Prisma
- **New canonical enum files created**: 35

## Prisma Enum Coverage Map

| # | Prisma Enum | shared-types Location | Status |
|---|---|---|---|
| 1 | `Role` | `enums/Role.ts` | ✅ New canonical file created |
| 2 | `Permission` | `enums/Permission.ts` | ✅ New canonical file created |
| 3 | `DisasterType` | `incident/enums.ts` | ✅ Fixed — removed non-P risma values (GEMBALA, GEREK, LANAU) |
| 4 | `IncidentStatus` | `incident/enums.ts` | ✅ Fixed — replaced VERIFIED with ASSIGNED, removed REOPENED |
| 5 | `IncidentSeverity` | `enums/SeverityLevel.ts` | ✅ Already matched |
| 6 | `StatusSP` | `enums/StatusSP.ts` | ✅ New canonical file created |
| 7 | `ShelterStatus` | `shelter/enums.ts` | ✅ Fixed — reduced to AKTIF, FULL, CLOSED |
| 8 | `WarehouseType` | `enums/WarehouseType.ts` | ✅ New canonical file created |
| 9 | `ShelterType` | `enums/ShelterType.ts` | ✅ New canonical file created |
| 10 | `AssetCategory` | `enums/AssetCategory.ts` | ✅ New canonical file created |
| 11 | `AssetCondition` | `enums/AssetCondition.ts` | ✅ New canonical file created |
| 12 | `AssetTransactionType` | `enums/AssetTransactionType.ts` | ✅ New canonical file created |
| 13 | `AssetTransactionStatus` | `enums/AssetTransactionStatus.ts` | ✅ New canonical file created |
| 14 | `NotificationStatus` | `enums/NotificationStatus.ts` | ✅ New canonical file created |
| 15 | `ChatType` | `enums/ChatType.ts` | ✅ New canonical file created |
| 16 | `MessageType` | `chat/enums.ts` | ✅ Fixed — replaced VIDEO with SYSTEM, removed LOCATION |
| 17 | `NewsSeverity` | `enums/NewsSeverity.ts` | ✅ New canonical file created |
| 18 | `ReportStatus` | `enums/ReportStatus.ts` | ✅ New canonical file created |
| 19 | `MissionStatus` | `mission/enums.ts` | ✅ Fixed — replaced ABORTED with CANCELLED |
| 20 | `LogisticsRequestStatus` | `logistics/enums.ts` | ✅ Fixed — replaced DRAFT/SUBMITTED/DISPATCHED/COMPLETED with PENDING/FULFILLED/CANCELLED |
| 21 | `DeploymentStatus` | `enums/DeploymentStatus.ts` | ✅ New canonical file created |
| 22 | `CheckInStatus` | `enums/CheckInStatus.ts` | ✅ New canonical file created |
| 23 | `CertificationStatus` | `enums/CertificationStatus.ts` | ✅ New canonical file created |
| 24 | `IntelReportSeverity` | `enums/IntelReportSeverity.ts` | ✅ New canonical file created |
| 25 | `ScrapedSourceType` | `enums/ScrapedSourceType.ts` | ✅ New canonical file created |
| 26 | `ScrapedSourceStatus` | `enums/ScrapedSourceStatus.ts` | ✅ New canonical file created |
| 27 | `DashboardPeriod` | `enums/DashboardPeriod.ts` | ✅ New canonical file created |
| 28 | `InstructionStatus` | `enums/InstructionStatus.ts` | ✅ New canonical file created |
| 29 | `InstructionPriority` | `enums/InstructionPriority.ts` | ✅ New canonical file created |
| 30 | `PlaybookStatus` | `enums/PlaybookStatus.ts` | ✅ New canonical file created |
| 31 | `PlaybookExecutionStatus` | `enums/PlaybookExecutionStatus.ts` | ✅ New canonical file created |
| 32 | `EscalationTimerStatus` | `enums/EscalationTimerStatus.ts` | ✅ New canonical file created |
| 33 | `AgentRunStatus` | `enums/AgentRunStatus.ts` | ✅ New canonical file created |
| 34 | `SourceReliabilityType` | `enums/SourceReliabilityType.ts` | ✅ New canonical file created |
| 35 | `SourceReliabilityStatus` | `enums/SourceReliabilityStatus.ts` | ✅ New canonical file created |
| 36 | `VerificationStatus` | `enums/VerificationStatus.ts` | ✅ New canonical file created |
| 37 | `RegionType` | `map/enums.ts` | ✅ Fixed — added SUB_DISTRICT, VILLAGE; removed REGENCY |
| 38 | `EvacuationRouteStatus` | `enums/EvacuationRouteStatus.ts` | ✅ New canonical file created |
| 39 | `FederationNodeStatus` | `enums/FederationNodeStatus.ts` | ✅ New canonical file created |
| 40 | `SyncDirection` | `enums/SyncDirection.ts` | ✅ New canonical file created |
| 41 | `SyncStatus` | `enums/SyncStatus.ts` | ✅ New canonical file created |
| 42 | `WebhookStatus` | `enums/WebhookStatus.ts` | ✅ New canonical file created |
| 43 | `PiiAction` | `enums/PiiAction.ts` | ✅ New canonical file created |

## Domain Enum Value Fixes

The following 7 domain enum files had values that diverged from Prisma and were corrected:

### `incident/enums.ts`
- **DisasterType**: Removed fake/extra values (GEMBALA, GEREK, LANAU) that didn't exist in Prisma
- **IncidentStatus**: Replaced VERIFIED → ASSIGNED, removed REOPENED to match Prisma's 5-value set

### `shelter/enums.ts`
- **ShelterStatus**: Reduced from 7 values to 3 (AKTIF, FULL, CLOSED) matching Prisma

### `mission/enums.ts`
- **MissionStatus**: Replaced ABORTED → CANCELLED to match Prisma

### `logistics/enums.ts`
- **LogisticsRequestStatus**: Replaced DRAFT/SUBMITTED/DISPATCHED/COMPLETED with PENDING/FULFILLED/CANCELLED

### `chat/enums.ts`
- **MessageType**: Replaced VIDEO → SYSTEM, removed LOCATION, kept TEXT/IMAGE/FILE

### `map/enums.ts`
- **RegionType**: Added SUB_DISTRICT, VILLAGE; removed REGENCY; kept PROVINCE, DISTRICT

## New Canonical Enum Files

35 new canonical enum files created in `packages/shared-types/src/enums/`, each mirroring a Prisma enum exactly:

AgentRunStatus, AssetCategory, AssetCondition, AssetTransactionStatus, AssetTransactionType, CertificationStatus, ChatType, CheckInStatus, DashboardPeriod, DeploymentStatus, EscalationTimerStatus, EvacuationRouteStatus, FederationNodeStatus, InstructionPriority, InstructionStatus, IntelReportSeverity, NewsSeverity, NotificationStatus, Permission, PiiAction, PlaybookExecutionStatus, PlaybookStatus, ReportStatus, Role, ScrapedSourceStatus, ScrapedSourceType, ShelterType, SourceReliabilityStatus, SourceReliabilityType, StatusSP, SyncDirection, SyncStatus, VerificationStatus, WarehouseType, WebhookStatus

## Remaining Work

- **PHASE-03-DISASTER-TYPE-UNIFICATION**: Update consumers to use canonical DisasterType
- **PHASE-03-INCIDENT-STATUS-UNIFICATION**: Update consumers to use canonical IncidentStatus
- **PHASE-03-ENUM-CONSUMER-AUDIT**: Audit all enum imports across monorepo
- **PHASE-03-ENUM-IMPORT-STANDARDIZATION**: Redirect all enums imports to shared-types
- **PHASE-03-ENUM-RUNTIME-COMPATIBILITY**: Verify runtime serialization compatibility
- **PHASE-03-ENUM-TSC-VALIDATION**: Full strict type check validation
