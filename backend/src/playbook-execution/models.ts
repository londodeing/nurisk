/**
 * Playbook Execution Models
 * ====================
 * Data models for playbook execution
 */

import { z } from 'zod';

// ==========================================================
// Step Status
// ==========================================================

export const StepStatus = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'SKIPPED',
  'PAUSED',
]);

export type StepStatus = z.infer<typeof StepStatus>;

// ==========================================================
// Execution Status
// ==========================================================

export const ExecutionStatus = z.enum([
  'PENDING',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export type ExecutionStatus = z.infer<typeof ExecutionStatus>;

// ==========================================================
// Playbook Execution
// ==========================================================

export const PlaybookExecutionSchema = z.object({
  id: z.number().optional(),
  playbook_id: z.number(),
  incident_id: z.number().optional(),
  status: ExecutionStatus.default('PENDING'),
  context: z.record(z.string(), z.unknown()).default({}),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type PlaybookExecution = z.infer<typeof PlaybookExecutionSchema>;

// ==========================================================
// Step Execution
// ==========================================================

export const StepExecutionSchema = z.object({
  id: z.number().optional(),
  execution_id: z.number(),
  step_id: z.number(),
  step_order: z.number(),
  status: StepStatus.default('PENDING'),
  output: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
});

export type StepExecution = z.infer<typeof StepExecutionSchema>;

// ==========================================================
// Step with Dependencies
// ==========================================================

export const PlaybookStepWithDepsSchema = z.object({
  id: z.number().optional(),
  order: z.number().min(1),
  action_type: z.string(),
  config: z.record(z.string(), z.unknown()),
  timeout_seconds: z.number().default(300),
  retry_count: z.number().default(0),
  on_failure: z.enum(['CONTINUE', 'STOP', 'ROLLBACK']).default('STOP'),
  depends_on: z.array(z.number()).default([]),
  run_parallel: z.boolean().default(false),
});

export type PlaybookStepWithDeps = z.infer<typeof PlaybookStepWithDepsSchema>;

// ==========================================================
// DTOs
// ==========================================================

export const StartExecutionDTO = z.object({
  playbook_id: z.number(),
  incident_id: z.number().optional(),
  context: z.record(z.string(), z.unknown()).default({}),
});

export type StartExecutionDTO = z.infer<typeof StartExecutionDTO>;

export const PauseExecutionDTO = z.object({
  reason: z.string().optional(),
});

export type PauseExecutionDTO = z.infer<typeof PauseExecutionDTO>;

export const ResumeExecutionDTO = z.object({
  context: z.record(z.string(), z.unknown()).optional(),
});

export type ResumeExecutionDTO = z.infer<typeof ResumeExecutionDTO>;

// ==========================================================
// Execution Result
// ==========================================================

export const ExecutionResultSchema = z.object({
  execution_id: z.number(),
  status: ExecutionStatus,
  steps: z.array(StepExecutionSchema),
  total_time_ms: z.number(),
  error: z.string().optional(),
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;