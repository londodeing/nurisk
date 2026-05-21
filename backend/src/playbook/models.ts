/**
 * Playbook Models
 * ============
 * Domain models for playbook definition engine
 */

import { z } from 'zod';

// ==========================================================
// PlaybookStep Model
// ==========================================================

export const PlaybookStepActionType = z.enum([
  'NOTIFY',
  'ESCALATE',
  'ASSIGN_VOLUNTEER',
  'CREATE_TASK',
  'SEND_BROADCAST',
  'UPDATE_STATUS',
  'WAIT',
  'CONDITIONAL_BRANCH',
  'HTTP_REQUEST',
  'WEBHOOK',
]);

export type PlaybookStepActionType = z.infer<typeof PlaybookStepActionType>;

export const PlaybookStepSchema = z.object({
  id: z.number().optional(),
  order: z.number().min(1),
  action_type: PlaybookStepActionType,
  config: z.record(z.string(), z.unknown()),
  timeout_seconds: z.number().min(1).max(3600).default(300),
  retry_count: z.number().min(0).max(5).default(0),
  on_failure: z.enum(['CONTINUE', 'STOP', 'ROLLBACK', 'ESCALATE']).default('STOP'),
});

export type PlaybookStep = z.infer<typeof PlaybookStepSchema>;

// ==========================================================
// PlaybookTrigger Model
// ==========================================================

export const PlaybookTriggerEventType = z.enum([
  'INCIDENT_CREATED',
  'INCIDENT_UPDATED',
  'INCIDENT_ESCALATED',
  'PRIORITY_CHANGED',
  'STATUS_CHANGED',
  'MANUAL_TRIGGER',
  'SCHEDULED',
]);

export type PlaybookTriggerEventType = z.infer<typeof PlaybookTriggerEventType>;

export const PlaybookTriggerSchema = z.object({
  id: z.number().optional(),
  event_type: PlaybookTriggerEventType,
  condition_expression: z.string().default(''),
  cooldown_minutes: z.number().min(0).max(1440).default(0),
  is_active: z.boolean().default(true),
});

export type PlaybookTrigger = z.infer<typeof PlaybookTriggerSchema>;

// ==========================================================
// Playbook Model
// ==========================================================

export const PlaybookStatus = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']);

export type PlaybookStatus = z.infer<typeof PlaybookStatus>;

export const PlaybookSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).default(''),
  disaster_type: z.string().min(1).max(100),
  status: PlaybookStatus.default('DRAFT'),
  version: z.number().min(1).default(1),
  steps: z.array(PlaybookStepSchema),
  triggers: z.array(PlaybookTriggerSchema).default([]),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Playbook = z.infer<typeof PlaybookSchema>;

// ==========================================================
// PlaybookTemplate Model
// ==========================================================

export const PlaybookTemplateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).default(''),
  disaster_type: z.string().min(1).max(100),
  category: z.string().max(100).default('general'),
  steps: z.array(PlaybookStepSchema),
  variables: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
        default_value: z.unknown().optional(),
        required: z.boolean().default(false),
      })
    )
    .default([]),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type PlaybookTemplate = z.infer<typeof PlaybookTemplateSchema>;

// ==========================================================
// DTOs
// ==========================================================

export const CreatePlaybookDTO = PlaybookSchema.omit({
  id: true,
  version: true,
  created_at: true,
  updated_at: true,
}).extend({
  created_by: z.number().optional(),
});

export type CreatePlaybookDTO = z.infer<typeof CreatePlaybookDTO>;

export const UpdatePlaybookDTO = PlaybookSchema.omit({
  id: true,
  version: true,
  created_at: true,
  updated_at: true,
  created_by: true,
}).partial();

export type UpdatePlaybookDTO = z.infer<typeof UpdatePlaybookDTO>;

export const CreatePlaybookFromTemplateDTO = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  variables: z.record(z.string(), z.unknown()).default({}),
  created_by: z.number().optional(),
});

export type CreatePlaybookFromTemplateDTO = z.infer<typeof CreatePlaybookFromTemplateDTO>;

// ==========================================================
// Query Params
// ==========================================================

export const PlaybookQueryParams = z.object({
  disaster_type: z.string().optional(),
  status: PlaybookStatus.optional(),
  version: z.number().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type PlaybookQueryParams = z.infer<typeof PlaybookQueryParams>;

// ==========================================================
// Variable Substitution
// ==========================================================

export function substituteVariables(
  config: Record<string, unknown>,
  variables: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      let substituted = value;
      for (const [varName, varValue] of Object.entries(variables)) {
        substituted = substituted.replace(
          new RegExp(`\\{\\{${varName}\}\\}`, 'g'),
          String(varValue)
        );
      }
      result[key] = substituted;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return substituteVariables(item as Record<string, unknown>, variables);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = substituteVariables(value as Record<string, unknown>, variables);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}