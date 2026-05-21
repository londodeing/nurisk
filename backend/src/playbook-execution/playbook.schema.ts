import { z } from 'zod';

// Playbook definition schema
export const PlaybookStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['action', 'condition', 'delay', 'notification', 'http', 'script']),
  config: z.record(z.string(), z.any()),
  timeout: z.number().optional(),
  retry: z
    .object({
      maxAttempts: z.number(),
      delay: z.number(),
    })
    .optional(),
  onFailure: z.enum(['abort', 'continue', 'retry']).optional(),
});

export const PlaybookSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(['event', 'schedule', 'manual']),
    condition: z.record(z.string(), z.any()).optional(),
  }),
  steps: z.array(PlaybookStepSchema),
  config: z
    .object({
      maxParallel: z.number().default(1),
      timeout: z.number().default(3600000),
      retryOnFailure: z.boolean().default(false),
    })
    .optional(),
  enabled: z.boolean().default(true),
  version: z.number().default(1),
});

export type Playbook = z.infer<typeof PlaybookSchema>;
export type PlaybookStep = z.infer<typeof PlaybookStepSchema>;

// Execution state
export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMED_OUT = 'TIMED_OUT',
}

export interface Execution {
  id: string;
  playbookId: string;
  playbookName: string;
  status: ExecutionStatus;
  currentStepId?: string;
  steps: ExecutionStep[];
  context: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  triggeredBy: string;
}

export interface ExecutionStep {
  stepId: string;
  status: ExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
  retries: number;
}