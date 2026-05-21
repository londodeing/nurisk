import { z } from 'zod';

// Escalation rule schema
export const EscalationRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  triggerType: z.enum(['STEP_TIMEOUT', 'STEP_RETRY', 'INCIDENT_AGE', 'MANUAL']),
  action: z.enum([
    'notify_supervisor',
    'increase_priority',
    'trigger_fallback_playbook',
    'assign_additional_volunteers',
    'send_alert',
    'escalate_to_command',
    'auto_assign',
    'create_incident',
    'send_notification',
  ]),
  target: z.string().optional(),
  config: z.record(z.string(), z.any()),
  enabled: z.boolean().default(true),
  priority: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type EscalationRule = z.infer<typeof EscalationRuleSchema>;

// Escalation status
export enum EscalationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ESCALATED = 'ESCALATED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

// Escalation record
export interface EscalationRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  incidentId: string;
  status: EscalationStatus;
  level: number;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  nextEscalationAt?: Date;
  metadata: Record<string, any>;
}