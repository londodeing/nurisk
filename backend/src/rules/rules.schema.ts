import { z } from 'zod';

// JSON Logic condition schema
export const JsonLogicConditionSchema = z.record(z.string(), z.any());

// Rule action schema
export const RuleActionSchema = z.object({
  type: z.enum([
    'http',
    'notification',
    'webhook',
    'script',
    'assign',
    'update',
    'create',
    'delete',
    'escalate',
  ]),
  config: z.record(z.string(), z.any()),
  retry: z
    .object({
      maxAttempts: z.number(),
      delay: z.number(),
    })
    .optional(),
});

// Rule definition schema
export const RuleSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  priority: z.number().default(0),
  eventType: z.string(),
  conditions: JsonLogicConditionSchema,
  actions: z.array(RuleActionSchema),
  cooldown: z
    .object({
      enabled: z.boolean(),
      duration: z.number(),
      unit: z.enum(['seconds', 'minutes', 'hours', 'days']),
    })
    .optional(),
  config: z
    .object({
      async: z.boolean().default(false),
      continueOnError: z.boolean().default(true),
    })
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Rule = z.infer<typeof RuleSchema>;
export type RuleAction = z.infer<typeof RuleActionSchema>;

// Execution types
export enum RuleExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface RuleExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  eventId: string;
  eventType: string;
  status: RuleExecutionStatus;
  conditionsMet: boolean;
  actionsExecuted: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  output: Record<string, any>;
}

export interface RuleAuditLog {
  id: string;
  ruleId: string;
  ruleName: string;
  eventId: string;
  eventType: string;
  action: string;
  status: 'success' | 'failure';
  input: Record<string, any>;
  output: Record<string, any>;
  duration: number;
  timestamp: Date;
}