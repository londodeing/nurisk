/**
 * Rule Engine Models
 * ================
 * Data models for rule orchestration
 */

import { z } from 'zod';

// ==========================================================
// Rule Definition
// ==========================================================

export const RuleDefinitionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).default(''),
  rule_set_id: z.number().optional(),
  condition: z.record(z.string(), z.unknown()), // JSON Logic expression
  actions: z.array(z.record(z.string(), z.unknown())), // Array of action objects
  priority: z.number().min(0).max(1000).default(0),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type RuleDefinition = z.infer<typeof RuleDefinitionSchema>;

// ==========================================================
// Rule Set
// ==========================================================

export const MatchBehavior = z.enum(['ALL', 'ANY']);

export type MatchBehavior = z.infer<typeof MatchBehavior>;

export const RuleSetSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).default(''),
  match_behavior: MatchBehavior.default('ALL'),
  priority: z.number().min(0).max(1000).default(0),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type RuleSet = z.infer<typeof RuleSetSchema>;

// ==========================================================
// Action Types
// ==========================================================

export const ActionType = z.enum([
  'create_incident',
  'assign_volunteer',
  'send_notification',
  'escalate',
  'trigger_playbook',
  'update_status',
  'http_request',
  'webhook',
]);

export type ActionType = z.infer<typeof ActionType>;

// ==========================================================
// Evaluation Context
// ==========================================================

export const RuleEvaluationContextSchema = z.object({
  event: z.record(z.string(), z.unknown()).optional(), // Event payload
  system: z.record(z.string(), z.unknown()).optional(), // System state
  session: z.record(z.string(), z.unknown()).optional(), // User session
  incident: z.record(z.string(), z.unknown()).optional(), // Related incident
  user: z.record(z.string(), z.unknown()).optional(), // Current user
});

export type RuleEvaluationContext = z.infer<typeof RuleEvaluationContextSchema>;

// ==========================================================
// Evaluation Result
// ==========================================================

export const RuleEvaluationResultSchema = z.object({
  rule_id: z.number(),
  rule_name: z.string(),
  matched: z.boolean(),
  actions: z.array(z.record(z.string(), z.unknown())),
  evaluation_time_ms: z.number(),
  error: z.string().optional(),
});

export type RuleEvaluationResult = z.infer<typeof RuleEvaluationResultSchema>;

// ==========================================================
// DTOs
// ==========================================================

export const CreateRuleDefinitionDTO = RuleDefinitionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  rule_set_id: z.number().optional(),
});

export type CreateRuleDefinitionDTO = z.infer<typeof CreateRuleDefinitionDTO>;

export const UpdateRuleDefinitionDTO = RuleDefinitionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type UpdateRuleDefinitionDTO = z.infer<typeof UpdateRuleDefinitionDTO>;

export const CreateRuleSetDTO = RuleSetSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateRuleSetDTO = z.infer<typeof CreateRuleSetDTO>;

export const EvaluateRulesDTO = z.object({
  context: RuleEvaluationContextSchema,
  rule_set_id: z.number().optional(),
  rule_ids: z.array(z.number()).optional(),
  execute_actions: z.boolean().default(false),
});

export type EvaluateRulesDTO = z.infer<typeof EvaluateRulesDTO>;

export const EvaluateRulesResultSchema = z.object({
  results: z.array(RuleEvaluationResultSchema),
  executed_actions: z.array(z.record(z.string(), z.unknown())).default([]),
  total_evaluation_time_ms: z.number(),
});

export type EvaluateRulesResult = z.infer<typeof EvaluateRulesResultSchema>;