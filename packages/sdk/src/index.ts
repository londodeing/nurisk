// NURisk SDK - HTTP Client Library

export {
  SdkClient,
  type SdkClientConfig,
  client,
  SdkError,
  NetworkError,
  AuthError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ApiContractError,
  type AuthStorage,
  LocalStorageAuthStorage,
  MemoryAuthStorage,
  setupRequestInterceptor,
  setupResponseInterceptor,
  type ApiResponse,
  buildPaginationParams,
  hasNextPage,
  hasPrevPage,
  getPageNumbers,
  type PaginationMeta,
  type PaginationRequest,
  type RetryConfig,
  DEFAULT_RETRY,
  shouldRetry,
  getRetryDelay,
  withRetry,
  parse,
  parseOptional,
  parseArray,
} from './core'
export { AuthApi } from './auth'
export { IncidentsApi } from './incidents'
export { VolunteersApi } from './volunteers'
export { SheltersApi } from './shelters'
export { WarehousesApi } from './warehouses'
export { NotificationsApi } from './notifications'
export { ChatApi } from './chat'
export { InventoryApi } from './inventory'
export { LogisticsApi } from './logistics'
export { MissionsApi } from './mission'
export { WeatherApi } from './weather'
export { TrendAnalysisApi } from './trend-analysis'
export { StreamAnalyticsApi } from './stream-analytics'
export { RiskRegistryApi } from './risk-registry'
export { ResourceApi } from './resource'
export { ProphetApi } from './prophet'
export { SearchApi } from './search'
export { VolunteerDispatchApi } from './volunteer-dispatch'
export { HazardApi } from './hazard'
export { EarlyWarningApi } from './early-warning'
export { BriefingApi } from './briefing'
export { DecisionApi } from './decision'
export { AwarenessApi } from './awareness'
export { ShelterApi } from './shelter'
export { AgentApi } from './agent'

// Domain SDKs (new structure)
export { weatherApi } from './domains/weather'
export { searchApi, type SearchParams } from './domains/search'
export { resourceApi, type ResourceFilters } from './domains/resource'
export { trendAnalysisApi } from './domains/trend-analysis'
export { streamAnalyticsApi } from './domains/stream-analytics'
export { forecastApi, type ForecastParams } from './domains/forecast'
export { riskApi } from './domains/risk'
export { hazardApi, type HazardFilters } from './domains/hazard'
export { earlyWarningApi } from './domains/early-warning'
export { decisionApi, type DecisionCreatePayload } from './domains/decision'
export { briefingApi } from './domains/briefing'
export { volunteerDispatchApi, type DispatchPayload } from './domains/volunteer-dispatch'
export { auditApi } from './domains/audit'
export { awarenessApi } from './domains/awareness'