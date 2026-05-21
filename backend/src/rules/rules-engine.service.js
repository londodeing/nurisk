"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RulesEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesEngine = void 0;
const common_1 = require("@nestjs/common");
const eventemitter2_1 = require("eventemitter2");
const rules_schema_1 = require("./rules.schema");
const database_1 = __importDefault(require("../config/database"));
const axios_1 = __importDefault(require("axios"));
let RulesEngine = RulesEngine_1 = class RulesEngine {
    eventEmitter;
    logger = new common_1.Logger(RulesEngine_1.name);
    cooldowns = new Map();
    executions = new Map();
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.initialize();
    }
    /**
     * Initialize - load rules and subscribe to events
     */
    async initialize() {
        // Subscribe to all events
        this.eventEmitter.onAny(((event, data) => {
            this.handleEvent(event, data).catch((err) => {
                this.logger.error(`Event handler error: ${event}`, err);
            });
        }));
    }
    /**
     * Handle incoming event
     */
    async handleEvent(eventType, data) {
        const rules = await this.getRulesForEvent(eventType);
        for (const rule of rules) {
            // Check cooldown
            if (await this.isInCooldown(rule.id, data.eventId)) {
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
    async createRule(data) {
        const rule = rules_schema_1.RuleSchema.parse({
            ...data,
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        });
        await database_1.default.query(`
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
    async updateRule(id, data) {
        const rule = rules_schema_1.RuleSchema.parse({
            ...data,
            id,
            updatedAt: new Date(),
        });
        await database_1.default.query(`
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
    async deleteRule(id) {
        await database_1.default.query(`DELETE FROM rules WHERE id = $1`, [id]);
        this.logger.log(`Deleted rule: ${id}`);
    }
    /**
     * List rules
     */
    async listRules(eventType) {
        const query = eventType
            ? `SELECT * FROM rules WHERE event_type = $1 ORDER BY priority DESC`
            : `SELECT * FROM rules ORDER BY priority DESC`;
        const params = eventType ? [eventType] : [];
        const result = await database_1.default.query(query, params);
        return result.rows.map((row) => rules_schema_1.RuleSchema.parse(row));
    }
    /**
     * Get rules for event type
     */
    async getRulesForEvent(eventType) {
        const result = await database_1.default.query(`
      SELECT * FROM rules 
      WHERE event_type = $1 AND enabled = true 
      ORDER BY priority DESC
    `, [eventType]);
        return result.rows.map((row) => rules_schema_1.RuleSchema.parse(row));
    }
    /**
     * Evaluate JSON Logic conditions
     */
    async evaluateConditions(conditions, data) {
        try {
            return this.evaluateJsonLogic(conditions, data);
        }
        catch (error) {
            this.logger.warn(`Condition evaluation error: ${error}`);
            return false;
        }
    }
    /**
     * JSON Logic evaluator
     */
    evaluateJsonLogic(condition, data) {
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
                return operands.every((op) => this.evaluateJsonLogic(op, data));
            case 'or':
                return operands.some((op) => this.evaluateJsonLogic(op, data));
            case 'not':
                return !this.evaluateJsonLogic(operands, data);
            // Array operators
            case 'in':
                const value = this.evaluateJsonLogic(operands[0], data);
                const array = operands[1];
                return Array.isArray(array) ? array.includes(value) : false;
            // Variable access
            case 'var':
                const path = operands.split('.');
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
    async executeRule(rule, eventData) {
        const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const execution = {
            id: executionId,
            ruleId: rule.id,
            ruleName: rule.name,
            eventId: eventData.eventId || eventData.id,
            eventType: rule.eventType,
            status: rules_schema_1.RuleExecutionStatus.RUNNING,
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
            execution.status = rules_schema_1.RuleExecutionStatus.COMPLETED;
            execution.completedAt = new Date();
            // Set cooldown
            if (rule.cooldown?.enabled) {
                this.setCooldown(rule.id, eventData.eventId);
            }
            await this.logExecution(rule, eventData, true, 'COMPLETED', execution);
        }
        catch (error) {
            execution.status = rules_schema_1.RuleExecutionStatus.FAILED;
            execution.completedAt = new Date();
            execution.error = error.message;
            if (!rule.config?.continueOnError) {
                throw error;
            }
            await this.logExecution(rule, eventData, false, 'FAILED', execution);
        }
    }
    /**
     * Execute single action
     */
    async executeAction(action, data, execution) {
        const startTime = Date.now();
        try {
            let result;
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
        }
        catch (error) {
            await this.logAction(action, data, null, Date.now() - startTime, false);
            throw error;
        }
    }
    /**
     * HTTP action
     */
    async executeHttp(action, data) {
        const { url, method, headers, body } = action.config;
        const response = await (0, axios_1.default)({
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
    async executeNotification(action, data) {
        this.eventEmitter.emit('notification.send', action.config);
        return { sent: true };
    }
    /**
     * Webhook action
     */
    async executeWebhook(action, data) {
        this.eventEmitter.emit('webhook.trigger', action.config);
        return { triggered: true };
    }
    /**
     * Script action
     */
    async executeScript(action, data) {
        // In production, use sandboxed executor
        return { executed: true };
    }
    /**
     * Assign action
     */
    async executeAssign(action, data) {
        const { table, id, to } = action.config;
        await database_1.default.query(`UPDATE ${table} SET ${to} = $1 WHERE id = $2`, [data.assignee, data.id]);
        return { assigned: true };
    }
    /**
     * Update action
     */
    async executeUpdate(action, data) {
        const { table, id, values } = action.config;
        const setClause = Object.keys(values).map((k, i) => `${k} = $${i + 2}`).join(', ');
        const valuesArr = Object.values(values);
        await database_1.default.query(`UPDATE ${table} SET ${setClause} WHERE id = $1`, [data.id, ...valuesArr]);
        return { updated: true };
    }
    /**
     * Create action
     */
    async executeCreate(action, data) {
        const { table, values } = action.config;
        const keys = Object.keys(values).join(', ');
        const placeholders = Object.keys(values).map((_, i) => `$${i + 1}`).join(', ');
        const valuesArr = Object.values(values).map((v) => typeof v === 'object' ? JSON.stringify(v) : v);
        await database_1.default.query(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`, valuesArr);
        return { created: true };
    }
    /**
     * Delete action
     */
    async executeDelete(action, data) {
        const { table } = action.config;
        await database_1.default.query(`DELETE FROM ${table} WHERE id = $1`, [data.id]);
        return { deleted: true };
    }
    /**
     * Escalate action
     */
    async executeEscalate(action, data) {
        this.eventEmitter.emit('escalation.trigger', action.config);
        return { escalated: true };
    }
    /**
     * Check cooldown
     */
    async isInCooldown(ruleId, eventId) {
        const key = `${ruleId}:${eventId}`;
        const lastExecution = this.cooldowns.get(key);
        if (!lastExecution)
            return false;
        // Get rule cooldown duration
        const result = await database_1.default.query(`SELECT cooldown FROM rules WHERE id = $1`, [ruleId]);
        if (result.rows.length === 0)
            return false;
        const cooldown = result.rows[0].cooldown;
        if (!cooldown?.enabled)
            return false;
        const durationMs = this.parseDuration(cooldown.duration, cooldown.unit);
        return Date.now() - lastExecution < durationMs;
    }
    /**
     * Set cooldown
     */
    setCooldown(ruleId, eventId) {
        const key = `${ruleId}:${eventId}`;
        this.cooldowns.set(key, Date.now());
    }
    /**
     * Parse duration
     */
    parseDuration(value, unit) {
        const multipliers = {
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
    async logExecution(rule, data, success, status, execution) {
        await database_1.default.query(`
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
    async logAction(action, data, output, duration, success) {
        await database_1.default.query(`
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
    async getExecutionHistory(ruleId, limit = 100) {
        const query = ruleId
            ? `SELECT * FROM rule_executions WHERE rule_id = $1 ORDER BY started_at DESC LIMIT $2`
            : `SELECT * FROM rule_executions ORDER BY started_at DESC LIMIT $1`;
        const params = ruleId ? [ruleId, limit] : [limit];
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    /**
     * Get audit logs
     */
    async getAuditLogs(ruleId, limit = 100) {
        const query = ruleId
            ? `SELECT * FROM rule_audit_logs WHERE rule_id = $1 ORDER BY timestamp DESC LIMIT $2`
            : `SELECT * FROM rule_audit_logs ORDER BY timestamp DESC LIMIT $1`;
        const params = ruleId ? [ruleId, limit] : [limit];
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
};
exports.RulesEngine = RulesEngine;
exports.RulesEngine = RulesEngine = RulesEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventemitter2_1.EventEmitter2])
], RulesEngine);
//# sourceMappingURL=rules-engine.service.js.map