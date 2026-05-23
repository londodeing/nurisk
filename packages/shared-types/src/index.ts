// NURisk Shared Types - Single Source of Truth for Business Contracts
// This package exports all domain types, interfaces, and enums

export type {
  Shelter,
  ShelterActivation,
  ShelterCapacity,
  Volunteer,
  Team,
  TeamMember,
  Assignment,
  CheckIn,
} from './entities'
export type {
  Session,
  Permission,
  RolePermissions,
  UserRole,
} from './auth'

// Explicit re-exports for commonly used auth types
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './auth/types'

export type {
  PriorityThresholds,
  IncidentSeverity,
  DisasterType,
  IncidentStatus,
  PriorityLevel,
  IncidentTimelineEventType,
} from './incident'

// Explicit re-exports for commonly used incident types
export type {
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentFilter,
  IncidentStatistics,
  IncidentTimelineEvent,
  DisasterTypeInfo,
} from './incident/types'

export type {
  Assessment,
  DamageReport,
  ImpactSummary,
  AssessmentFilter,
  AssessmentSection,
  BuildingAssessment,
  ResilienceScore,
  DamageLevel,
  ImpactCategory,
  AssessmentType,
  AssessmentStatus,
  DamageReportType,
} from './assessment'
export type {
  ChatUser,
  TypingIndicator,
  OnlineStatus,
  MessageType,
  ConversationType,
  MessageStatus,
  ConversationMemberRole,
} from './chat'

// Explicit re-exports for commonly used chat types
export type {
  Conversation,
  Message,
  ConversationMember,
  ChatFilter,
  SendMessageRequest,
} from './chat/types'

export type {
  PushNotificationPayload,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from './notification'

// Explicit re-exports for commonly used notification types
export type {
  Notification,
  NotificationPreferences,
  NotificationTypeSetting,
  NotificationFilter,
  NotificationStatistics,
} from './notification/types'

export type {
  SupplyCategory,
  SupplyStatus,
  SupplyRequestStatus,
  EvacuationStatus,
} from './inventory'

// Explicit re-exports for commonly used inventory types
export type {
  InventoryItem,
  SupplyRequest,
  SupplyRequestItem,
  Evacuation,
  InventoryFilter,
  Distribution,
  DistributionItem,
} from './inventory/types'

export type {
  LogisticsSupplyStatus,
  RequestPriority,
  TransportType,
  LogisticsRequestStatus,
} from './logistics'

// Explicit re-exports for commonly used logistics types
export type {
  SupplyItem,
  LogisticsItem,
  Transport,
  LogisticsRequest,
  LogisticsStats,
  LogisticsFilter,
  Fulfillment,
} from './logistics/types'

export type {
  MissionStatus,
  MissionType,
} from './mission'

// Explicit re-exports for commonly used mission types
export type {
  Mission,
  MissionAssignment,
  MissionReport,
  MissionPriority,
  MissionFilter,
} from './mission/types'

// P2 domains
// Note: WeatherAlert is exported from weather module (not analytics to avoid conflict)
export type {
  WeatherCondition,
  CurrentWeather,
  DailyForecast,
  WeatherAlert,
  WeatherData,
} from './weather'
export type {
  TrendDataPoint,
  MovingAverageData,
  ChangePoint,
  PeriodComparison,
  MovingAverageWindow,
  PeriodComparisonResult,
  SeasonalPattern,
  TrendFilters,
  TrendAnalysis,
} from './trend-analysis'
export type {
  StreamDataPoint,
  WindowAggregate,
  ThresholdAlert,
  StreamWindow,
  StreamFilters,
  StreamAnalytics,
} from './stream-analytics'
export type {
  Risk,
  RiskMatrixCell,
  RiskSummary,
} from './risk'
export type {
  ResourceType,
  ResourceOptimization,
} from './resource'
export type {
  SeasonalComponent,
} from './forecast'

// Explicit re-exports for forecast types
export type { ForecastRequest, ForecastSummary, ForecastDataPoint, AnomalyPoint } from './forecast/types'
export type {
  SearchCategory,
  SearchResult,
  SearchResponse,
} from './search'
export type {
  AvailabilitySlot,
  Deployment,
  SkillMatch,
  DispatchRequest,
} from './volunteer-dispatch'
export type { HazardZone, VulnerabilityAssessment } from './hazard'
export type {
  Warning,
  WarningFilter,
} from './early-warning'
export type {
  SituationSummary,
  KeyMetrics,
  ExecutiveBriefing,
  RecommendedAction,
  IncidentBrief,
} from './briefing'
export type {
  DecisionOption,
  Decision,
  DecisionStats,
  DecisionConfig,
} from './decision'
export type { TacticalData, EvacuationRoute, ExclusionZone, Asset, CommunicationChannel, BroadcastMessage, TimelineEvent } from './awareness';

// Shelter types - explicit to avoid conflict with canonical entities
export type {
  ShelterOccupancy,
  ShelterAmenity,
  ShelterEquipment,
  ShelterCrewAssignment,
  ShelterPIC,
  ShelterMissionAssignment,
  ShelterTimelineEvent,
  ShelterFilter,
  CreateShelterRequest,
  UpdateShelterRequest,
} from './shelter'
export type { ShelterStatus, ShelterCapacityStatus, ShelterCrewRole } from './shelter/enums'
export type {
  Warehouse,
  WarehouseStock,
  WarehouseMovement,
  WarehouseCrew,
  WarehouseEquipment,
  WarehouseAssignment,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  AssignWarehousePICRequest,
  AssignWarehouseCrewRequest,
  CreateStockRequest,
  MovementRequest,
  WarehouseStatus,
  MovementType,
  WarehouseCrewRole,
  WarehouseInventory,
  WarehouseFilter,
} from './warehouse'

export type {
  MapLayer,
  MapMarker,
  MapPopup,
  MapBounds,
  MapViewState,
  MapConfig,
  GeoJSONFeature,
  GeoJSONGeometry,
  GeoJSONCollection,
  Region,
  MapFilter,
  ClusterConfig,
  HeatmapPoint,
  MapLayerType,
  MapMarkerType,
  RegionType,
  HazardRiskLevel,
} from './map'
export type {
  MetricValue,
  TimeSeriesPoint,
  DashboardSummary,
  IncidentTrend,
  GeographicDistribution,
  DisasterTypeDistribution,
  ResponseTimeMetrics,
  ResourceUtilization,
  RiskScore,
  RiskFactor,
  AnalyticsWeatherAlert,
  Forecast,
  AnalyticsFilter,
  ChartData,
  ChartDataset,
  ReportRequest,
  TimeSeriesDataPoint,
  DashboardWidget,
  WidgetLayout,
  AnalyticsDashboard,
  TimeRange,
  ChartType,
  RiskLevel,
  WeatherAlertType,
  AlertSeverity,
  ReportType,
} from './analytics'
// Explicit re-exports for commonly used API types
export type {
  ApiResponse,
  ApiError,
  ApiMeta,
  PaginationMeta,
  PaginationRequest,
  ListResponse,
} from './api/types'

// Explicit re-exports for commonly used volunteer types (non-entity types)
export type {
  VolunteerFilter,
  TeamFilter,
  VolunteerStatistics,
} from './volunteer/types'

// Explicit re-exports for volunteer enums
export type { VolunteerStatus, VolunteerType, SkillType } from './volunteer/enums'

// Audit types
export type {
  AuditAction,
  AuditStatus,
  AuditLogEntry,
  AuditFilters,
} from './audit'

// Explicit re-exports for shelter request types
export type {
  ActivateShelterRequest,
  AssignPICRequest,
  AssignCrewRequest,
  UpdateOccupancyRequest,
} from './shelter/types'

// Explicit re-exports for resource types
export type { Resource, ResourceAllocation, ResourceForecast } from './resource/types'

export type {
  ISODateString,
  GeoLocation,
  EntityId,
  RiskFilters,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  RiskCategory,
  SearchOptions,
} from './types'
export {
  isValidUuid,
  isSoftDeleted,
  type DateRange,
  type DeepPartial,
  type Branch,
  type Rank,
  type IncidentSource,
  type AssetType,
  type TransactionType,
  type Condition,
  type Timestamps,
  type SoftDelete,
  type BaseEntity,
  type SoftDeletableEntity,
  type AuditFields,
  type EntityStatus,
} from './common'