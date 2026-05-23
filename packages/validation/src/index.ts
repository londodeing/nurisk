// NURisk Validation Package - Zod-based validation schemas
// Explicit exports to avoid DTS export collisions

export {
  paginationSchema,
  type PaginationInput,
  paginationMetaSchema,
  type PaginationMetaInput,
  listResponseSchema,
  apiResponseSchema,
} from './api'

export {
  loginSchema,
  type LoginInput,
  registerSchema,
  type RegisterInput,
  userProfileSchema,
  type UserProfileInput,
  changePasswordSchema,
  type ChangePasswordInput,
  forgotPasswordSchema,
  type ForgotPasswordInput,
  resetPasswordSchema,
  type ResetPasswordInput,
  verifyAccountSchema,
  type VerifyAccountInput,
} from './auth'
export {
  createIncidentSchema,
  type CreateIncidentInput,
  updateIncidentSchema,
  type UpdateIncidentInput,
  incidentFilterSchema,
  type IncidentFilterInput,
} from './incident'
export {
  createVolunteerSchema,
  type CreateVolunteerInput,
  updateVolunteerSchema,
  type UpdateVolunteerInput,
  createTeamSchema,
  type CreateTeamInput,
  updateTeamSchema,
  type UpdateTeamInput,
  assignTeamSchema,
  type AssignTeamInput,
  checkInSchema,
  type CheckInInput,
  deployVolunteerSchema,
  type DeployVolunteerInput,
} from './volunteer'
export {
  createAssessmentSchema,
  type CreateAssessmentInput,
  updateAssessmentSchema,
  type UpdateAssessmentInput,
  damageReportSchema,
  type DamageReportInput,
} from './assessment'
export {
  createShelterSchema,
  type CreateShelterInput,
  updateShelterSchema,
  type UpdateShelterInput,
  shelterCapacitySchema,
  type ShelterCapacityInput,
  shelterCrewSchema,
  type ShelterCrewInput,
} from './shelter'
export {
  createWarehouseSchema,
  type CreateWarehouseInput,
  updateWarehouseSchema,
  type UpdateWarehouseInput,
  movementSchema,
  type MovementInput,
  warehouseCrewSchema,
  type WarehouseCrewInput,
} from './warehouse'
export {
  createConversationSchema,
  type CreateConversationInput,
  sendMessageSchema,
  type SendMessageInput,
  updateConversationSchema,
  type UpdateConversationInput,
  addParticipantSchema,
  type AddParticipantInput,
  broadcastSchema,
  type BroadcastInput,
} from './chat'
export {
  createNotificationSchema,
  type CreateNotificationInput,
  broadcastNotificationSchema,
  type BroadcastNotificationInput,
  markAsReadSchema,
  type MarkAsReadInput,
  bulkMarkAsReadSchema,
  type BulkMarkAsReadInput,
} from './notification'
export {
  createSupplySchema,
  type CreateSupplyInput,
  updateSupplySchema,
  type UpdateSupplyInput,
  supplyRequestSchema,
  type SupplyRequestInput,
  allocationSchema,
  type AllocationInput,
} from './inventory'
export {
  supplyItemSchema,
  type SupplyItemInput,
  transportSchema,
  type TransportInput,
  createLogisticsRequestSchema,
  type CreateLogisticsRequestInput,
  updateLogisticsRequestSchema,
  type UpdateLogisticsRequestInput,
} from './logistics'
export {
  createMissionSchema,
  type CreateMissionInput,
  updateMissionSchema,
  type UpdateMissionInput,
  missionAssignmentSchema,
  type MissionAssignmentInput,
  missionReportSchema,
  type MissionReportInput,
} from './mission'

// Explicit: common has internal-only pagination (re-exported from api)
export {
  dateRangeSchema,
  type DateRangeInput,
  geoLocationSchema,
  type GeoLocationInput,
  idParamSchema,
  type IdParamInput,
  bulkIdsSchema,
  type BulkIdsInput,
  searchSchema,
  type SearchInput,
} from './common'

export {
  resourceTypeSchema,
  resourceStatusSchema,
  resourceSchema,
  type ResourceInput,
  resourceAllocationStatusSchema,
  resourceAllocationSchema,
  type ResourceAllocationInput,
  resourceForecastSchema,
  type ResourceForecastInput,
  resourceOptimizationSchema,
  type ResourceOptimizationInput,
  resourceFilterSchema,
  type ResourceFilterInput,
} from './resource'