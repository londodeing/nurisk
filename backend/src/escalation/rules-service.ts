/**
 * Escalation Rules Service
 * ==================
 * Manages escalation rules and triggers
 */

import { Pool } from 'pg';
import { EscalationTimerService } from './timer-service';
import { logEscalation, executeEscalationAction } from './actions';
import {
  EscalationRule,
  EscalationLevel,
  EscalationTarget,
  EscalationActionType,
} from './models';

export class EscalationRulesService {
  private pool: Pool;
  private timerService: EscalationTimerService;

  constructor(pool: Pool, timerService: EscalationTimerService) {
    this.pool = pool;
    this.timerService = timerService;
  }

  /**
   * Get all active rules
   */
  async getActiveRules(): Promise<EscalationRule[]> {
    const result = await this.pool.query(
      'SELECT * FROM escalation_rules WHERE is_active = true ORDER BY priority DESC'
    );
    return result.rows;
  }

  /**
   * Get rules by trigger type
   */
  async getRulesByTrigger(triggerType: EscalationLevel): Promise<EscalationRule[]> {
    const result = await this.pool.query(
      'SELECT * FROM escalation_rules WHERE trigger_type = $1 AND is_active = true ORDER BY priority DESC',
      [triggerType]
    );
    return result.rows;
  }

  /**
   * Create escalation rule
   */
  async createRule(rule: Partial<EscalationRule>): Promise<EscalationRule> {
    const result = await this.pool.query(
      `INSERT INTO escalation_rules (name, description, trigger_type, condition, action, target, config, is_active, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        rule.name,
        rule.description,
        rule.trigger_type,
        rule.condition ? JSON.stringify(rule.condition) : null,
        rule.action,
        rule.target,
        rule.config ? JSON.stringify(rule.config) : {},
        rule.is_active ?? true,
        rule.priority ?? 0,
      ]
    );
    return result.rows[0];
  }

  /**
   * Update rule
   */
  async updateRule(id: number, updates: Partial<EscalationRule>): Promise<EscalationRule | null> {
    const fields: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(updates.is_active);
    }
    if (updates.config !== undefined) {
      fields.push(`config = $${idx++}`);
      values.push(JSON.stringify(updates.config));
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE escalation_rules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Delete rule
   */
  async deleteRule(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM escalation_rules WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Trigger escalation for step timeout
   */
  async triggerStepTimeout(
    executionId: number,
    stepExecutionId: number,
    stepConfig: Record<string, unknown>
  ): Promise<void> {
    const rules = await this.getRulesByTrigger('STEP_TIMEOUT');

    for (const rule of rules) {
      await this.executeRule(rule, executionId, stepExecutionId);
    }
  }

  /**
   * Trigger escalation for step retry
   */
  async triggerStepRetry(
    executionId: number,
    stepExecutionId: number,
    retryCount: number
  ): Promise<void> {
    const rules = await this.getRulesByTrigger('STEP_RETRY');

    for (const rule of rules) {
      // Check if rule applies to this retry count
      const condition = rule.condition as { min_retries?: number } | undefined;
      if (condition?.min_retries && retryCount < condition.min_retries) {
        continue;
      }
      await this.executeRule(rule, executionId, stepExecutionId);
    }
  }

  /**
   * Trigger escalation for incident age
   */
  async triggerIncidentAge(
    executionId: number,
    incidentId: number,
    ageMinutes: number
  ): Promise<void> {
    const rules = await this.getRulesByTrigger('INCIDENT_AGE');

    for (const rule of rules) {
      const condition = rule.condition as { min_age_minutes?: number } | undefined;
      if (condition?.min_age_minutes && ageMinutes < condition.min_age_minutes) {
        continue;
      }
      await this.executeRule(rule, executionId, undefined);
    }
  }

  /**
   * Execute a rule
   */
  private async executeRule(
    rule: EscalationRule,
    executionId: number,
    stepExecutionId: number | undefined
  ): Promise<void> {
    const target = rule.target as EscalationTarget;
    const action = rule.action as EscalationActionType;
    const config = typeof rule.config === 'string'
      ? JSON.parse(rule.config)
      : rule.config;

    // Log escalation
    await logEscalation(
      executionId,
      stepExecutionId,
      rule.trigger_type,
      target,
      action,
      { rule_id: rule.id, rule_name: rule.name },
      this.pool
    );

    // Execute action
    await executeEscalationAction(
      { type: action, target, config },
      executionId,
      stepExecutionId || 0,
      this.pool
    );
  }

  /**
   * Setup default escalation rules
   */
  async setupDefaultRules(): Promise<void> {
    const existing = await this.pool.query(
      "SELECT id FROM escalation_rules WHERE name LIKE 'Default%'"
    );

    if (existing.rows.length > 0) return;

    // Default rules
    const defaultRules: Array<Partial<EscalationRule>> = [
      {
        name: 'Default: Step Timeout - Supervisor',
        description: 'Notify supervisor when step times out',
        trigger_type: 'STEP_TIMEOUT',
        action: 'notify_supervisor',
        target: 'SUPERVISOR',
        config: { message: 'Step execution timed out' } as Record<string, unknown>,
      },
      {
        name: 'Default: Step Retry - Increase Priority',
        description: 'Increase priority after 3 retries',
        trigger_type: 'STEP_RETRY',
        action: 'increase_priority',
        target: 'COMMAND_CENTER',
        config: { new_priority: 'HIGH', min_retries: 3 } as Record<string, unknown>,
      },
      {
        name: 'Default: Incident Age - Command Center',
        description: 'Escalate to command center after 1 hour',
        trigger_type: 'INCIDENT_AGE',
        action: 'escalate_to_command',
        target: 'COMMAND_CENTER',
        config: { min_age_minutes: 60 } as Record<string, unknown>,
      },
    ];

    for (const rule of defaultRules) {
      await this.createRule(rule);
    }
  }
};