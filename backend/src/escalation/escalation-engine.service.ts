import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import {
  EscalationRule,
  EscalationRecord,
  EscalationStatus,
  EscalationRuleSchema,
} from './escalation.schema';
import pool from '../config/database';

@Injectable()
export class EscalationEngine {
  private readonly logger = new Logger(EscalationEngine.name);
  private readonly activeEscalations = new Map<string, EscalationRecord>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(private eventEmitter: EventEmitter2) {
    this.initialize();
  }

  /**
   * Initialize - load rules and start timers
   */
  private async initialize(): Promise<void> {
    await this.loadRules();
    this.startTimerProcessor();
  }

  /**
   * Load escalation rules from database
   */
  private async loadRules(): Promise<void> {
    try {
      const result = await pool.query(`
        SELECT * FROM escalation_rules 
        WHERE enabled = true 
        ORDER BY priority DESC
      `);

      for (const row of result.rows) {
        this.logger.log(`Loaded rule: ${row.name}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to load rules: ${error}`);
    }
  }

  /**
   * Create escalation rule
   */
  async createRule(data: Partial<EscalationRule>): Promise<EscalationRule> {
    const rule = EscalationRuleSchema.parse({
      ...data,
      id: `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    });

    await pool.query(`
      INSERT INTO escalation_rules (id, name, description, trigger_type, action, target, config, enabled, priority, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      rule.id,
      rule.name,
      rule.description,
      rule.triggerType,
      rule.action,
      rule.target,
      JSON.stringify(rule.config),
      rule.enabled,
      rule.priority,
      rule.createdAt,
    ]);

    this.logger.log(`Created escalation rule: ${rule.id}`);
    return rule;
  }

  /**
   * Update escalation rule
   */
  async updateRule(id: string, data: Partial<EscalationRule>): Promise<EscalationRule> {
    const rule = EscalationRuleSchema.parse({
      ...data,
      id,
      updatedAt: new Date(),
    });

    await pool.query(`
      UPDATE escalation_rules 
      SET name = $1, description = $2, trigger_type = $3, action = $4, target = $5, 
          config = $6, enabled = $7, priority = $8, updated_at = $9
      WHERE id = $10
    `, [
      rule.name,
      rule.description,
      rule.triggerType,
      rule.action,
      rule.target,
      JSON.stringify(rule.config),
      rule.enabled,
      rule.priority,
      rule.updatedAt,
      id,
    ]);

    return rule;
  }

  /**
   * Delete escalation rule
   */
  async deleteRule(id: string): Promise<void> {
    await pool.query(`DELETE FROM escalation_rules WHERE id = $1`, [id]);
    this.logger.log(`Deleted escalation rule: ${id}`);
  }

  /**
   * List escalation rules
   */
  async listRules(): Promise<EscalationRule[]> {
    const result = await pool.query(`SELECT * FROM escalation_rules ORDER BY priority DESC`);
    return result.rows.map((row) => EscalationRuleSchema.parse(row));
  }

  /**
   * Trigger escalation for an incident
   */
  async triggerEscalation(
    incidentId: string,
    ruleId: string,
    metadata: Record<string, any> = {}
  ): Promise<EscalationRecord> {
    const rule = await this.getRule(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const escalation: EscalationRecord = {
      id: `escal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id!,
      ruleName: rule.name,
      incidentId,
      status: EscalationStatus.ACTIVE,
      level: 1,
      triggeredAt: new Date(),
      metadata,
    };

    // Store in memory and database
    this.activeEscalations.set(escalation.id, escalation);
    await this.saveEscalation(escalation);

    // Execute action
    await this.executeAction(rule, incidentId, metadata);

    // Set next escalation timer if configured
    if (rule.config?.nextEscalationMinutes) {
      const nextMinutes = rule.config.nextEscalationMinutes as number;
      escalation.nextEscalationAt = new Date(Date.now() + nextMinutes * 60 * 1000);
      this.setTimer(escalation.id, nextMinutes * 60 * 1000, () => {
        this.triggerEscalation(incidentId, ruleId, { ...metadata, level: escalation.level + 1 });
      });
    }

    // Emit event
    this.eventEmitter.emit('escalation.triggered', escalation);

    this.logger.log(`Triggered escalation: ${escalation.id} for incident ${incidentId}`);
    return escalation;
  }

  /**
   * Acknowledge escalation
   */
  async acknowledge(
    escalationId: string,
    userId: string
  ): Promise<EscalationRecord> {
    const escalation = this.activeEscalations.get(escalationId);
    if (!escalation) {
      throw new Error(`Escalation ${escalationId} not found`);
    }

    escalation.status = EscalationStatus.ACKNOWLEDGED;
    escalation.acknowledgedAt = new Date();
    escalation.acknowledgedBy = userId;

    await this.updateEscalation(escalation);

    this.eventEmitter.emit('escalation.acknowledged', escalation);
    this.logger.log(`Acknowledged escalation: ${escalationId} by ${userId}`);

    return escalation;
  }

  /**
   * Resolve escalation
   */
  async resolve(escalationId: string): Promise<EscalationRecord> {
    const escalation = this.activeEscalations.get(escalationId);
    if (!escalation) {
      throw new Error(`Escalation ${escalationId} not found`);
    }

    escalation.status = EscalationStatus.RESOLVED;
    escalation.resolvedAt = new Date();

    await this.updateEscalation(escalation);

    // Clear timer
    this.clearTimer(escalationId);

    this.eventEmitter.emit('escalation.resolved', escalation);
    this.logger.log(`Resolved escalation: ${escalationId}`);

    return escalation;
  }

  /**
   * Get active escalations for incident
   */
  async getActiveEscalations(incidentId: string): Promise<EscalationRecord[]> {
    return Array.from(this.activeEscalations.values()).filter(
      (e) => e.incidentId === incidentId && e.status === EscalationStatus.ACTIVE
    );
  }

  /**
   * Execute escalation action
   */
  private async executeAction(
    rule: EscalationRule,
    incidentId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    switch (rule.action) {
      case 'notify_supervisor':
        await this.notifySupervisor(rule, incidentId, metadata);
        break;
      case 'increase_priority':
        await this.increasePriority(incidentId, rule);
        break;
      case 'trigger_fallback_playbook':
        await this.triggerPlaybook(rule, incidentId, metadata);
        break;
      case 'assign_additional_volunteers':
        await this.assignVolunteers(rule, incidentId);
        break;
      case 'send_alert':
        await this.sendAlert(rule, incidentId, metadata);
        break;
      case 'escalate_to_command':
        await this.escalateToCommand(incidentId, rule);
        break;
      case 'auto_assign':
        await this.autoAssign(incidentId, rule);
        break;
      case 'send_notification':
        await this.sendNotification(rule, incidentId, metadata);
        break;
    }
  }

  /**
   * Notify supervisor
   */
  private async notifySupervisor(
    rule: EscalationRule,
    incidentId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const message = (rule.config?.message as string) || 'Escalation triggered';
    
    this.eventEmitter.emit('notification.send', {
      channel: 'whatsapp',
      to: rule.target,
      message: `${message} - Incident: ${incidentId}`,
      incidentId,
    });
  }

  /**
   * Increase incident priority
   */
  private async increasePriority(incidentId: string, rule: EscalationRule): Promise<void> {
    const newPriority = (rule.config?.newPriority as string) || 'HIGH';
    
    await pool.query(`
      UPDATE incidents SET priority = $1, updated_at = NOW() WHERE id = $2
    `, [newPriority, incidentId]);

    this.eventEmitter.emit('incident.priority_changed', { incidentId, newPriority });
  }

  /**
   * Trigger fallback playbook
   */
  private async triggerPlaybook(
    rule: EscalationRule,
    incidentId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const playbookId = rule.config?.playbookId as string;
    
    this.eventEmitter.emit('playbook.trigger', {
      playbookId,
      incidentId,
      context: metadata,
    });
  }

  /**
   * Assign additional volunteers
   */
  private async assignVolunteers(rule: EscalationRule, incidentId: string): Promise<void> {
    const count = (rule.config?.volunteerCount as number) || 5;
    
    this.eventEmitter.emit('volunteers.assign', {
      incidentId,
      count,
      skills: rule.config?.requiredSkills,
    });
  }

  /**
   * Send alert
   */
  private async sendAlert(
    rule: EscalationRule,
    incidentId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const alertLevel = (rule.config?.alertLevel as string) || 'HIGH';
    
    this.eventEmitter.emit('alert.send', {
      level: alertLevel,
      incidentId,
      message: rule.config?.message,
    });
  }

  /**
   * Escalate to command
   */
  private async escalateToCommand(incidentId: string, rule: EscalationRule): Promise<void> {
    this.eventEmitter.emit('incident.escalate', {
      incidentId,
      target: rule.target,
      command: true,
    });
  }

  /**
   * Auto-assign to available volunteer
   */
  private async autoAssign(incidentId: string, rule: EscalationRule): Promise<void> {
    const result = await pool.query(`
      SELECT id FROM volunteers 
      WHERE status = 'ACTIVE' 
      AND region = $1 
      ORDER BY RANDOM() 
      LIMIT 1
    `, [rule.target]);

    if (result.rows.length > 0) {
      const volunteerId = result.rows[0].id;
      await pool.query(`
        INSERT INTO volunteer_incidents (volunteer_id, incident_id, assigned_at)
        VALUES ($1, $2, NOW())
      `, [volunteerId, incidentId]);

      this.eventEmitter.emit('volunteer.assigned', { volunteerId, incidentId });
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(
    rule: EscalationRule,
    incidentId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    this.eventEmitter.emit('notification.send', {
      channel: rule.config?.channel || 'whatsapp',
      template: rule.config?.template,
      incidentId,
      context: metadata,
    });
  }

  /**
   * Timer processor
   */
  private startTimerProcessor(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [id, escalation] of this.activeEscalations) {
        if (escalation.nextEscalationAt && escalation.nextEscalationAt.getTime() <= now) {
          if (escalation.status === EscalationStatus.ACTIVE) {
            this.triggerEscalation(
              escalation.incidentId,
              escalation.ruleId,
              { ...escalation.metadata, level: escalation.level + 1 }
            );
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Set timer
   */
  private setTimer(
    escalationId: string,
    delay: number,
    callback: () => void
  ): void {
    this.clearTimer(escalationId);
    this.timers.set(escalationId, setTimeout(callback, delay));
  }

  /**
   * Clear timer
   */
  private clearTimer(escalationId: string): void {
    const timer = this.timers.get(escalationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(escalationId);
    }
  }

  /**
   * Get rule by ID
   */
  private async getRule(ruleId: string): Promise<EscalationRule | null> {
    const result = await pool.query(
      `SELECT * FROM escalation_rules WHERE id = $1`,
      [ruleId]
    );
    return result.rows.length > 0 ? EscalationRuleSchema.parse(result.rows[0]) : null;
  }

  /**
   * Save escalation to database
   */
  private async saveEscalation(escalation: EscalationRecord): Promise<void> {
    await pool.query(`
      INSERT INTO escalations (id, rule_id, rule_name, incident_id, status, level, triggered_at, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      escalation.id,
      escalation.ruleId,
      escalation.ruleName,
      escalation.incidentId,
      escalation.status,
      escalation.level,
      escalation.triggeredAt,
      JSON.stringify(escalation.metadata),
    ]);
  }

  /**
   * Update escalation in database
   */
  private async updateEscalation(escalation: EscalationRecord): Promise<void> {
    await pool.query(`
      UPDATE escalations 
      SET status = $1, acknowledged_at = $2, acknowledged_by = $3, resolved_at = $4
      WHERE id = $5
    `, [
      escalation.status,
      escalation.acknowledgedAt,
      escalation.acknowledgedBy,
      escalation.resolvedAt,
      escalation.id,
    ]);
  }
}