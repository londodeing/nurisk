// Enums Barrel - Centralized Re-export of All Enum Types
// Canonical source: backend/prisma/schema.prisma (for Prisma-mirrored enums)

// Canonical enum files (mirroring Prisma)
export type { AgentRunStatus } from './AgentRunStatus'
export type { AssetCategory } from './AssetCategory'
export type { AssetCondition } from './AssetCondition'
export type { AssetTransactionStatus } from './AssetTransactionStatus'
export type { AssetTransactionType } from './AssetTransactionType'
export type { CertificationStatus } from './CertificationStatus'
export type { ChatType } from './ChatType'
export type { CheckInStatus } from './CheckInStatus'
export type { DashboardPeriod } from './DashboardPeriod'
export type { DeploymentStatus } from './DeploymentStatus'
export type { EscalationTimerStatus } from './EscalationTimerStatus'
export type { EvacuationRouteStatus } from './EvacuationRouteStatus'
export type { FederationNodeStatus } from './FederationNodeStatus'
export type { HazardType } from './HazardType'
export type { InstructionPriority } from './InstructionPriority'
export type { InstructionStatus } from './InstructionStatus'
export type { IntelReportSeverity } from './IntelReportSeverity'
export type { NewsSeverity } from './NewsSeverity'
export type { NotificationStatus } from './NotificationStatus'
export type { Permission } from './Permission'
export type { PiiAction } from './PiiAction'
export type { PlaybookExecutionStatus } from './PlaybookExecutionStatus'
export type { PlaybookStatus } from './PlaybookStatus'
export type { ReportStatus } from './ReportStatus'
export type { Role } from './Role'
export type { ScrapedSourceStatus } from './ScrapedSourceStatus'
export type { ScrapedSourceType } from './ScrapedSourceType'
export type { SeverityLevel } from './SeverityLevel'
export type { ShelterType } from './ShelterType'
export type { SourceReliabilityStatus } from './SourceReliabilityStatus'
export type { SourceReliabilityType } from './SourceReliabilityType'
export type { StatusSP } from './StatusSP'
export type { SyncDirection } from './SyncDirection'
export type { SyncStatus } from './SyncStatus'
export type { VerificationStatus } from './VerificationStatus'
export type { WarehouseType } from './WarehouseType'
export type { WebhookStatus } from './WebhookStatus'

// Domain enums (canonical value definitions sourced from Prisma)
export type {
  DisasterType,
  IncidentStatus,
  PriorityLevel,
  IncidentTimelineEventType,
} from '../incident/enums'

export type {
  VolunteerStatus,
  VolunteerType,
  SkillType,
  TeamType,
  TeamStatus,
  TeamMemberRole,
  AssignmentType,
  AssignmentStatus,
  CheckInType,
} from '../volunteer/enums'

export type {
  DamageLevel,
  ImpactCategory,
  AssessmentType,
  AssessmentStatus,
  DamageReportType,
} from '../assessment/enums'

export type {
  ConversationType,
  MessageType,
  MessageStatus,
  ConversationMemberRole,
} from '../chat/enums'

export type {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '../notification/enums'

export type {
  SupplyCategory,
  SupplyStatus,
  SupplyRequestStatus,
  EvacuationStatus,
} from '../inventory/enums'

export type {
  LogisticsSupplyStatus,
  RequestPriority,
  TransportType,
  LogisticsRequestStatus,
} from '../logistics/enums'

export type {
  MissionStatus,
  MissionType,
} from '../mission/enums'

export type {
  ShelterStatus,
  ShelterCapacityStatus,
  ShelterCrewRole,
} from '../shelter/enums'

export type {
  WarehouseStatus,
  MovementType,
  WarehouseCrewRole,
} from '../warehouse/enums'

export type {
  MapLayerType,
  MapMarkerType,
  RegionType,
  HazardRiskLevel,
} from '../map/enums'

export type {
  UserRole,
} from '../auth/enums'

export type {
  TimeRange,
  ChartType,
  RiskLevel,
  WeatherAlertType,
  AlertSeverity,
  ReportType,
} from '../analytics/enums'

export type {
  Branch,
  Rank,
  IncidentSource,
  AssetType,
  TransactionType,
  Condition,
} from '../common/enums'

// Phase-08A canonical enums (mirroring Prisma PHASE-08A expansion)
export type { WarningSeverity } from './WarningSeverity'
export type { WarningStatus } from './WarningStatus'
export type { HazardSeverity } from './HazardSeverity'
export type { ExclusionZoneType } from './ExclusionZoneType'
export type { ExclusionZoneLevel } from './ExclusionZoneLevel'
export type { DecisionImpact } from './DecisionImpact'
export type { DecisionUrgency } from './DecisionUrgency'
export type { DecisionStatus } from './DecisionStatus'
export type { BriefingStatus } from './BriefingStatus'
export type { TacticalPriority } from './TacticalPriority'
