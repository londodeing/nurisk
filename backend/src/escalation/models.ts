/**
 * Escalation Models
 * =============
 * Data models for automated escalation
 */

import { z } from 'zod';

// ==========================================================
// Escalation Level
// ==========================================================

export const EscalationLevel = z.enum([
  'STEP_TIMEOUT',
  'STEP_RETRY',
  'INCIDENT_AGE',
  'MANUAL',
]);

export type EscalationLevel = z.infer<typeof EscalationLevel>;

// ==========================================================
// Escalation Target
// ==========================================================

export const EscalationTarget = z.enum([
  'SUPERVISOR',
  'COMMAND_CENTER',
  'BNPB',
  'LOCAL_GOVERNMENT',
  'VOLUNTEER_COORDINATOR',
]);

export type EscalationTarget = z.infer<typeof EscalationTarget>;

// ==========================================================
// Escalation Action
// ==========================================================

export const EscalationActionType = z.enum([
  'notify_supervisor',
  'increase_priority',
  'trigger_fallback_playbook',
  'assign_additional_volunteers',
  'send_alert',
  'escalate_to_command',
]);

export type EscalationActionType = z.infer<typeof EscalationActionType>;

// ==========================================================
// Escalation Timer
// ==========================================================

export const EscalationTimerSchema = z.object({
  id: z.number().optional(),
  step_execution_id: z.number(),
  execution_id: z.number(),
  timeout_ms: z.number(),
  fire_at: z.date(),
  escalation_action: z.record(z.string(), z.unknown()),
  status: z.enum(['PENDING', 'FIRED', 'CANCELLED', 'COMPLETED']).default('PENDING'),
  created_at: z.date().optional(),
});

export type EscalationTimer = z.infer<typeof EscalationTimerSchema>;

// ==========================================================
// Escalation Log
// ==========================================================

export const EscalationLogSchema = z.object({
  id: z.number().optional(),
  execution_id: z.number(),
  step_execution_id: z.number().optional(),
  level: EscalationLevel,
  target: EscalationTarget,
  action: EscalationActionType,
  details: z.record(z.string(), z.unknown()).default({}),
  resolved: z.boolean().default(false),
  resolved_at: z.date().optional(),
  resolved_by: z.number().optional(),
  created_at: z.date().optional(),
});

export type EscalationLog = z.infer<typeof EscalationLogSchema>;

// ==========================================================
// Escalation Rule
// ==========================================================

export const EscalationRuleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).default(''),
  trigger_type: EscalationLevel,
  condition: z.record(z.string(), z.unknown()).optional(),
  action: EscalationActionType,
  target: EscalationTarget,
  config: z.record(z.string(), z.unknown()).default({}),
  is_active: z.boolean().default(true),
  priority: z.number().min(0).default(0),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type EscalationRule = z.infer<typeof EscalationRuleSchema>;

// ==========================================================
// DTOs
// ==========================================================

export const StartEscalationTimerDTO = z.object({
  step_execution_id: z.number(),
  execution_id: z.number(),
  timeout_ms: z.number(),
  escalation_action: z.record(z.string(), z.unknown()),
});

export type StartEscalationTimerDTO = z.infer<typeof StartEscalationTimerDTO>;

export const EscalationResultDTO = z.object({
  execution_id: z.number(),
  step_execution_id: z.number().optional(),
  level: EscalationLevel,
  target: EscalationTarget,
  action: EscalationActionType,
  success: z.boolean(),
  error: z.string().optional(),
});

export type EscalationResultDTO = z.infer<typeof EscalationResultDTO>;