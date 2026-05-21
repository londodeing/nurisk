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
var EscalationEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscalationEngine = void 0;
const common_1 = require("@nestjs/common");
const eventemitter2_1 = require("eventemitter2");
const escalation_schema_1 = require("./escalation.schema");
const database_1 = __importDefault(require("../config/database"));
let EscalationEngine = EscalationEngine_1 = class EscalationEngine {
    eventEmitter;
    logger = new common_1.Logger(EscalationEngine_1.name);
    activeEscalations = new Map();
    timers = new Map();
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.initialize();
    }
    /**
     * Initialize - load rules and start timers
     */
    async initialize() {
        await this.loadRules();
        this.startTimerProcessor();
    }
    /**
     * Load escalation rules from database
     */
    async loadRules() {
        try {
            const result = await database_1.default.query(`
        SELECT * FROM escalation_rules 
        WHERE enabled = true 
        ORDER BY priority DESC
      `);
            for (const row of result.rows) {
                this.logger.log(`Loaded rule: ${row.name}`);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to load rules: ${error}`);
        }
    }
    /**
     * Create escalation rule
     */
    async createRule(data) {
        const rule = escalation_schema_1.EscalationRuleSchema.parse({
            ...data,
            id: `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        });
        await database_1.default.query(`
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
    async updateRule(id, data) {
        const rule = escalation_schema_1.EscalationRuleSchema.parse({
            ...data,
            id,
            updatedAt: new Date(),
        });
        await database_1.default.query(`
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
    async deleteRule(id) {
        await database_1.default.query(`DELETE FROM escalation_rules WHERE id = $1`, [id]);
        this.logger.log(`Deleted escalation rule: ${id}`);
    }
    /**
     * List escalation rules
     */
    async listRules() {
        const result = await database_1.default.query(`SELECT * FROM escalation_rules ORDER BY priority DESC`);
        return result.rows.map((row) => escalation_schema_1.EscalationRuleSchema.parse(row));
    }
    /**
     * Trigger escalation for an incident
     */
    async triggerEscalation(incidentId, ruleId, metadata = {}) {
        const rule = await this.getRule(ruleId);
        if (!rule) {
            throw new Error(`Rule ${ruleId} not found`);
        }
        const escalation = {
            id: `escal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            incidentId,
            status: escalation_schema_1.EscalationStatus.ACTIVE,
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
            const nextMinutes = rule.config.nextEscalationMinutes;
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
    async acknowledge(escalationId, userId) {
        const escalation = this.activeEscalations.get(escalationId);
        if (!escalation) {
            throw new Error(`Escalation ${escalationId} not found`);
        }
        escalation.status = escalation_schema_1.EscalationStatus.ACKNOWLEDGED;
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
    async resolve(escalationId) {
        const escalation = this.activeEscalations.get(escalationId);
        if (!escalation) {
            throw new Error(`Escalation ${escalationId} not found`);
        }
        escalation.status = escalation_schema_1.EscalationStatus.RESOLVED;
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
    async getActiveEscalations(incidentId) {
        return Array.from(this.activeEscalations.values()).filter((e) => e.incidentId === incidentId && e.status === escalation_schema_1.EscalationStatus.ACTIVE);
    }
    /**
     * Execute escalation action
     */
    async executeAction(rule, incidentId, metadata) {
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
    async notifySupervisor(rule, incidentId, metadata) {
        const message = rule.config?.message || 'Escalation triggered';
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
    async increasePriority(incidentId, rule) {
        const newPriority = rule.config?.newPriority || 'HIGH';
        await database_1.default.query(`
      UPDATE incidents SET priority = $1, updated_at = NOW() WHERE id = $2
    `, [newPriority, incidentId]);
        this.eventEmitter.emit('incident.priority_changed', { incidentId, newPriority });
    }
    /**
     * Trigger fallback playbook
     */
    async triggerPlaybook(rule, incidentId, metadata) {
        const playbookId = rule.config?.playbookId;
        this.eventEmitter.emit('playbook.trigger', {
            playbookId,
            incidentId,
            context: metadata,
        });
    }
    /**
     * Assign additional volunteers
     */
    async assignVolunteers(rule, incidentId) {
        const count = rule.config?.volunteerCount || 5;
        this.eventEmitter.emit('volunteers.assign', {
            incidentId,
            count,
            skills: rule.config?.requiredSkills,
        });
    }
    /**
     * Send alert
     */
    async sendAlert(rule, incidentId, metadata) {
        const alertLevel = rule.config?.alertLevel || 'HIGH';
        this.eventEmitter.emit('alert.send', {
            level: alertLevel,
            incidentId,
            message: rule.config?.message,
        });
    }
    /**
     * Escalate to command
     */
    async escalateToCommand(incidentId, rule) {
        this.eventEmitter.emit('incident.escalate', {
            incidentId,
            target: rule.target,
            command: true,
        });
    }
    /**
     * Auto-assign to available volunteer
     */
    async autoAssign(incidentId, rule) {
        const result = await database_1.default.query(`
      SELECT id FROM volunteers 
      WHERE status = 'ACTIVE' 
      AND region = $1 
      ORDER BY RANDOM() 
      LIMIT 1
    `, [rule.target]);
        if (result.rows.length > 0) {
            const volunteerId = result.rows[0].id;
            await database_1.default.query(`
        INSERT INTO volunteer_incidents (volunteer_id, incident_id, assigned_at)
        VALUES ($1, $2, NOW())
      `, [volunteerId, incidentId]);
            this.eventEmitter.emit('volunteer.assigned', { volunteerId, incidentId });
        }
    }
    /**
     * Send notification
     */
    async sendNotification(rule, incidentId, metadata) {
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
    startTimerProcessor() {
        setInterval(() => {
            const now = Date.now();
            for (const [id, escalation] of this.activeEscalations) {
                if (escalation.nextEscalationAt && escalation.nextEscalationAt.getTime() <= now) {
                    if (escalation.status === escalation_schema_1.EscalationStatus.ACTIVE) {
                        this.triggerEscalation(escalation.incidentId, escalation.ruleId, { ...escalation.metadata, level: escalation.level + 1 });
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Set timer
     */
    setTimer(escalationId, delay, callback) {
        this.clearTimer(escalationId);
        this.timers.set(escalationId, setTimeout(callback, delay));
    }
    /**
     * Clear timer
     */
    clearTimer(escalationId) {
        const timer = this.timers.get(escalationId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(escalationId);
        }
    }
    /**
     * Get rule by ID
     */
    async getRule(ruleId) {
        const result = await database_1.default.query(`SELECT * FROM escalation_rules WHERE id = $1`, [ruleId]);
        return result.rows.length > 0 ? escalation_schema_1.EscalationRuleSchema.parse(result.rows[0]) : null;
    }
    /**
     * Save escalation to database
     */
    async saveEscalation(escalation) {
        await database_1.default.query(`
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
    async updateEscalation(escalation) {
        await database_1.default.query(`
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
};
exports.EscalationEngine = EscalationEngine;
exports.EscalationEngine = EscalationEngine = EscalationEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventemitter2_1.EventEmitter2])
], EscalationEngine);
//# sourceMappingURL=escalation-engine.service.js.map