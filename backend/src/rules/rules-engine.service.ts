import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import {
  Rule,
  RuleAction,
  RuleExecution,
  RuleExecutionStatus,
  RuleAuditLog,
  RuleSchema,
} from './rules.schema';
import pool from '../config/database';
import axios from 'axios';

@Injectable()
export class RulesEngine {
  private readonly logger = new Logger(RulesEngine.name);
  private readonly cooldowns = new Map<string, number>();
  private readonly executions = new Map<string, RuleExecution>();

  constructor(private eventEmitter: EventEmitter2) {
    this.initialize();
  }

  /**
   * Initialize - load rules and subscribe to events
   */
  private async initialize(): Promise<void> {
    // Subscribe to all events
    this.eventEmitter.onAny(((event: string, data: any) => {
      this.handleEvent(event, data).catch((err) => {
        this.logger.error(`Event handler error: ${event}`, err);
      });
    }) as any);
  }

  /**
   * Handle incoming event
   */
  private async handleEvent(eventType: string, data: any): Promise<void> {
    const rules = await this.getRulesForEvent(eventType);

    for (const rule of rules) {
      // Check cooldown
      if (await this.isInCooldown(rule.id!, data.eventId)) {
        continue;
      }

      // Check conditions
      const conditionsMet = await this.evaluateConditions(rule.conditions, data);
      if (!conditionsMet) {
        await this.logExecution(rule, data, false, 'SKIPPED');
        continue;
      }

      // Execute actions
      await this.executeRule(rule, data);
    }
  }

  /**
   * Create rule
   */
  async createRule(data: Partial<Rule>): Promise<Rule> {
    const rule = RuleSchema.parse({
      ...data,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    });

    await pool.query(`
      INSERT INTO rules (id, name, description, enabled, priority, event_type, conditions, actions, cooldown, config, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      rule.id,
      rule.name,
      rule.description,
      rule.enabled,
      rule.priority,
      rule.eventType,
      JSON.stringify(rule.conditions),
      JSON.stringify(rule.actions),
      JSON.stringify(rule.cooldown),
      JSON.stringify(rule.config),
      rule.createdAt,
    ]);

    this.logger.log(`Created rule: ${rule.id}`);
    return rule;
  }

  /**
   * Update rule
   */
  async updateRule(id: string, data: Partial<Rule>): Promise<Rule> {
    const rule = RuleSchema.parse({
      ...data,
      id,
      updatedAt: new Date(),
    });

    await pool.query(`
      UPDATE rules 
      SET name = $1, description = $2, enabled = $3, priority = $4, event_type = $5, 
          conditions = $6, actions = $7, cooldown = $8, config = $9, updated_at = $10
      WHERE id = $11
    `, [
      rule.name,
      rule.description,
      rule.enabled,
      rule.priority,
      rule.eventType,
      JSON.stringify(rule.conditions),
      JSON.stringify(rule.actions),
      JSON.stringify(rule.cooldown),
      JSON.stringify(rule.config),
      rule.updatedAt,
      id,
    ]);

    return rule;
  }

  /**
   * Delete rule
   */
  async deleteRule(id: string): Promise<void> {
    await pool.query(`DELETE FROM rules WHERE id = $1`, [id]);
    this.logger.log(`Deleted rule: ${id}`);
  }

  /**
   * List rules
   */
  async listRules(eventType?: string): Promise<Rule[]> {
    const query = eventType
      ? `SELECT * FROM rules WHERE event_type = $1 ORDER BY priority DESC`
      : `SELECT * FROM rules ORDER BY priority DESC`;
    const params = eventType ? [eventType] : [];

    const result = await pool.query(query, params);
    return result.rows.map((row) => RuleSchema.parse(row));
  }

  /**
   * Get rules for event type
   */
  private async getRulesForEvent(eventType: string): Promise<Rule[]> {
    const result = await pool.query(`
      SELECT * FROM rules 
      WHERE event_type = $1 AND enabled = true 
      ORDER BY priority DESC
    `, [eventType]);

    return result.rows.map((row) => RuleSchema.parse(row));
  }

  /**
   * Evaluate JSON Logic conditions
   */
  private async evaluateConditions(
    conditions: Record<string, any>,
    data: Record<string, any>
  ): Promise<boolean> {
    try {
      return this.evaluateJsonLogic(conditions, data);
    } catch (error) {
      this.logger.warn(`Condition evaluation error: ${error}`);
      return false;
    }
  }

  /**
   * JSON Logic evaluator
   */
  private evaluateJsonLogic(condition: any, data: any): boolean {
    if (!condition || typeof condition !== 'object') {
      return true;
    }

    const operator = Object.keys(condition)[0];
    const operands = condition[operator];

    switch (operator) {
      // Comparison operators
      case '==':
        return this.evaluateJsonLogic(operands[0], data) === this.evaluateJsonLogic(operands[1], data);
      case '!=':
        return this.evaluateJsonLogic(operands[0], data) !== this.evaluateJsonLogic(operands[1], data);
      case '>':
        return this.evaluateJsonLogic(operands[0], data) > this.evaluateJsonLogic(operands[1], data);
      case '>=':
        return this.evaluateJsonLogic(operands[0], data) >= this.evaluateJsonLogic(operands[1], data);
      case '<':
        return this.evaluateJsonLogic(operands[0], data) < this.evaluateJsonLogic(operands[1], data);
      case '<=':
        return this.evaluateJsonLogic(operands[0], data) <= this.evaluateJsonLogic(operands[1], data);

      // Logical operators
      case 'and':
        return operands.every((op: any) => this.evaluateJsonLogic(op, data));
      case 'or':
        return operands.some((op: any) => this.evaluateJsonLogic(op, data));
      case 'not':
        return !this.evaluateJsonLogic(operands, data);

      // Array operators
      case 'in':
        const value = this.evaluateJsonLogic(operands[0], data);
        const array = operands[1];
        return Array.isArray(array) ? array.includes(value) : false;

      // Variable access
      case 'var':
        const path = (operands as string).split('.');
        let result = data;
        for (const key of path) {
          result = result?.[key];
        }
        return result ?? operands;

      // Literal values
      default:
        return condition;
    }
  }

  /**
   * Execute rule actions
   */
  private async executeRule(rule: Rule, eventData: any): Promise<void> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const execution: RuleExecution = {
      id: executionId,
      ruleId: rule.id!,
      ruleName: rule.name,
      eventId: eventData.eventId || eventData.id,
      eventType: rule.eventType,
      status: RuleExecutionStatus.RUNNING,
      conditionsMet: true,
      actionsExecuted: 0,
      startedAt: new Date(),
      output: {},
    };

    this.executions.set(executionId, execution);

    try {
      for (const action of rule.actions) {
        const result = await this.executeAction(action, eventData, execution);
        execution.output[`action_${action.type}`] = result;
        execution.actionsExecuted++;
      }

      execution.status = RuleExecutionStatus.COMPLETED;
      execution.completedAt = new Date();

      // Set cooldown
      if (rule.cooldown?.enabled) {
        this.setCooldown(rule.id!, eventData.eventId);
      }

      await this.logExecution(rule, eventData, true, 'COMPLETED', execution);
    } catch (error) {
      execution.status = RuleExecutionStatus.FAILED;
      execution.completedAt = new Date();
      execution.error = (error as Error).message;

      if (!rule.config?.continueOnError) {
        throw error;
      }

      await this.logExecution(rule, eventData, false, 'FAILED', execution);
    }
  }

  /**
   * Execute single action
   */
  private async executeAction(
    action: RuleAction,
    data: any,
    execution: RuleExecution
  ): Promise<any> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (action.type) {
        case 'http':
          result = await this.executeHttp(action, data);
          break;
        case 'notification':
          result = await this.executeNotification(action, data);
          break;
        case 'webhook':
          result = await this.executeWebhook(action, data);
          break;
        case 'script':
          result = await this.executeScript(action, data);
          break;
        case 'assign':
          result = await this.executeAssign(action, data);
          break;
        case 'update':
          result = await this.executeUpdate(action, data);
          break;
        case 'create':
          result = await this.executeCreate(action, data);
          break;
        case 'delete':
          result = await this.executeDelete(action, data);
          break;
        case 'escalate':
          result = await this.executeEscalate(action, data);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Audit log
      await this.logAction(action, data, result, Date.now() - startTime, true);

      return result;
    } catch (error) {
      await this.logAction(action, data, null, Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * HTTP action
   */
  private async executeHttp(action: RuleAction, data: any): Promise<any> {
    const { url, method, headers, body } = action.config;
    const response = await axios({
      url,
      method: method || 'POST',
      headers,
      data: { ...body, ...data },
    });
    return response.data;
  }

  /**
   * Notification action
   */
  private async executeNotification(action: RuleAction, data: any): Promise<any> {
    this.eventEmitter.emit('notification.send', action.config);
    return { sent: true };
  }

  /**
   * Webhook action
   */
  private async executeWebhook(action: RuleAction, data: any): Promise<any> {
    this.eventEmitter.emit('webhook.trigger', action.config);
    return { triggered: true };
  }

  /**
   * Script action
   */
  private async executeScript(action: RuleAction, data: any): Promise<any> {
    // In production, use sandboxed executor
    return { executed: true };
  }

  /**
   * Assign action
   */
  private async executeAssign(action: RuleAction, data: any): Promise<any> {
    const { table, id, to } = action.config;
    await pool.query(`UPDATE ${table} SET ${to} = $1 WHERE id = $2`, [data.assignee, data.id]);
    return { assigned: true };
  }

  /**
   * Update action
   */
  private async executeUpdate(action: RuleAction, data: any): Promise<any> {
    const { table, id, values } = action.config;
    const setClause = Object.keys(values).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const valuesArr = Object.values(values);
    await pool.query(`UPDATE ${table} SET ${setClause} WHERE id = $1`, [data.id, ...valuesArr]);
    return { updated: true };
  }

  /**
   * Create action
   */
  private async executeCreate(action: RuleAction, data: any): Promise<any> {
    const { table, values } = action.config;
    const keys = Object.keys(values).join(', ');
    const placeholders = Object.keys(values).map((_, i) => `$${i + 1}`).join(', ');
    const valuesArr = Object.values(values).map((v) => typeof v === 'object' ? JSON.stringify(v) : v);
    await pool.query(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`, valuesArr);
    return { created: true };
  }

  /**
   * Delete action
   */
  private async executeDelete(action: RuleAction, data: any): Promise<any> {
    const { table } = action.config;
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [data.id]);
    return { deleted: true };
  }

  /**
   * Escalate action
   */
  private async executeEscalate(action: RuleAction, data: any): Promise<any> {
    this.eventEmitter.emit('escalation.trigger', action.config);
    return { escalated: true };
  }

  /**
   * Check cooldown
   */
  private async isInCooldown(ruleId: string, eventId?: string): Promise<boolean> {
    const key = `${ruleId}:${eventId}`;
    const lastExecution = this.cooldowns.get(key);
    if (!lastExecution) return false;

    // Get rule cooldown duration
    const result = await pool.query(`SELECT cooldown FROM rules WHERE id = $1`, [ruleId]);
    if (result.rows.length === 0) return false;

    const cooldown = result.rows[0].cooldown;
    if (!cooldown?.enabled) return false;

    const durationMs = this.parseDuration(cooldown.duration, cooldown.unit);
    return Date.now() - lastExecution < durationMs;
  }

  /**
   * Set cooldown
   */
  private setCooldown(ruleId: string, eventId?: string): void {
    const key = `${ruleId}:${eventId}`;
    this.cooldowns.set(key, Date.now());
  }

  /**
   * Parse duration
   */
  private parseDuration(value: number, unit: string): number {
    const multipliers: Record<string, number> = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] || 1);
  }

  /**
   * Log execution
   */
  private async logExecution(
    rule: Rule,
    data: any,
    success: boolean,
    status: string,
    execution?: RuleExecution
  ): Promise<void> {
    await pool.query(`
      INSERT INTO rule_executions (id, rule_id, rule_name, event_id, event_type, status, conditions_met, actions_executed, output, started_at, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      execution?.id,
      rule.id,
      rule.name,
      data.eventId,
      rule.eventType,
      status,
      execution?.conditionsMet,
      execution?.actionsExecuted,
      JSON.stringify(execution?.output),
      execution?.startedAt,
      execution?.completedAt,
    ]);
  }

  /**
   * Log action
   */
  private async logAction(
    action: RuleAction,
    data: any,
    output: any,
    duration: number,
    success: boolean
  ): Promise<void> {
    await pool.query(`
      INSERT INTO rule_audit_logs (id, action_type, input, output, duration, status, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      `log-${Date.now()}`,
      action.type,
      JSON.stringify(data),
      JSON.stringify(output),
      duration,
      success ? 'success' : 'failure',
    ]);
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(ruleId?: string, limit = 100): Promise<RuleExecution[]> {
    const query = ruleId
      ? `SELECT * FROM rule_executions WHERE rule_id = $1 ORDER BY started_at DESC LIMIT $2`
      : `SELECT * FROM rule_executions ORDER BY started_at DESC LIMIT $1`;
    const params = ruleId ? [ruleId, limit] : [limit];

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(ruleId?: string, limit = 100): Promise<RuleAuditLog[]> {
    const query = ruleId
      ? `SELECT * FROM rule_audit_logs WHERE rule_id = $1 ORDER BY timestamp DESC LIMIT $2`
      : `SELECT * FROM rule_audit_logs ORDER BY timestamp DESC LIMIT $1`;
    const params = ruleId ? [ruleId, limit] : [limit];

    const result = await pool.query(query, params);
    return result.rows;
  }
}