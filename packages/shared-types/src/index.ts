// NURisk Shared Types - Single Source of Truth for Business Contracts
// This package exports all domain types, interfaces, and enums

export * from './entities'
export * from './auth'

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

export * from './incident'

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

export * from './assessment'
export * from './chat'

// Explicit re-exports for commonly used chat types
export type {
  Conversation,
  Message,
  ConversationMember,
  ChatFilter,
  SendMessageRequest,
} from './chat/types'

export * from './notification'

// Explicit re-exports for commonly used notification types
export type {
  Notification,
  NotificationPreferences,
  NotificationTypeSetting,
  NotificationFilter,
  NotificationStatistics,
} from './notification/types'

export * from './inventory'

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

export * from './logistics'

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

export * from './mission'

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
export * from './weather'
export * from './trend-analysis'
export * from './stream-analytics'
export * from './risk'
export * from './resource'
export * from './forecast'

// Explicit re-exports for forecast types
export type { ForecastRequest, ForecastSummary, ForecastDataPoint, AnomalyPoint } from './forecast/types'
export * from './search'
export * from './volunteer-dispatch'
export type { HazardZone, VulnerabilityAssessment } from './hazard'
export * from './early-warning'
export * from './briefing'
export * from './decision'
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

export * from './map'
export * from './analytics'
export * from './api'

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
export * from './audit'

// Explicit re-exports for shelter request types
export type {
  ActivateShelterRequest,
  AssignPICRequest,
  AssignCrewRequest,
  UpdateOccupancyRequest,
} from './shelter/types'

// Explicit re-exports for resource types
export type { Resource, ResourceAllocation, ResourceForecast } from './resource/types'

export * from './types'
export * from './common'