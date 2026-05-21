/**
 * Rules Service
 * ============
 * Business logic for rule orchestration
 */

import { Pool } from 'pg';
import { RulesRepository } from './rules.repository';
import { RuleEngine } from './rule-engine';
import { executeActions, ActionContext } from './action-executors';
import {
  RuleDefinition,
  RuleSet,
  RuleEvaluationContext,
  RuleEvaluationResult,
  CreateRuleDefinitionDTO,
  UpdateRuleDefinitionDTO,
  CreateRuleSetDTO,
  EvaluateRulesDTO,
  EvaluateRulesResult,
} from './models';

export class RulesService {
  private repository: RulesRepository;
  private engine: RuleEngine;

  constructor(pool: Pool) {
    this.repository = new RulesRepository(pool);
    this.engine = new RuleEngine();
  }

  // ==========================================================
  // Rule Definition Operations
  // ==========================================================

  async createRule(dto: CreateRuleDefinitionDTO): Promise<RuleDefinition> {
    return this.repository.createRule(dto);
  }

  async getRule(id: number): Promise<RuleDefinition | null> {
    return this.repository.getRuleById(id);
  }

  async updateRule(id: number, dto: UpdateRuleDefinitionDTO): Promise<RuleDefinition | null> {
    return this.repository.updateRule(id, dto);
  }

  async deleteRule(id: number): Promise<boolean> {
    return this.repository.deleteRule(id);
  }

  async getRulesBySetId(setId: number): Promise<RuleDefinition[]> {
    return this.repository.getRulesBySetId(setId);
  }

  async getAllRules(): Promise<RuleDefinition[]> {
    return this.repository.getAllRules();
  }

  // ==========================================================
  // Rule Set Operations
  // ==========================================================

  async createRuleSet(dto: CreateRuleSetDTO): Promise<RuleSet> {
    return this.repository.createRuleSet(dto);
  }

  async getRuleSet(id: number): Promise<RuleSet | null> {
    return this.repository.getRuleSetById(id);
  }

  async getAllRuleSets(): Promise<RuleSet[]> {
    return this.repository.getAllRuleSets();
  }

  // ==========================================================
  // Rule Evaluation
  // ==========================================================

  async evaluateRules(dto: EvaluateRulesDTO, pool: Pool): Promise<EvaluateRulesResult> {
    const startTime = Date.now();
    const results: RuleEvaluationResult[] = [];
    let executedActions: Array<Record<string, unknown>> = [];

    // Get rules to evaluate
    let rules: RuleDefinition[] = [];
    
    if (dto.rule_ids && dto.rule_ids.length > 0) {
      rules = await this.repository.getRulesByIds(dto.rule_ids);
    } else if (dto.rule_set_id) {
      rules = await this.repository.getRulesBySetId(dto.rule_set_id);
    } else {
      rules = await this.repository.getAllRules();
    }

    // Get rule set for match behavior
    let matchBehavior: 'ALL' | 'ANY' = 'ALL';
    if (dto.rule_set_id) {
      const ruleSet = await this.repository.getRuleSetById(dto.rule_set_id);
      if (ruleSet) {
        matchBehavior = ruleSet.match_behavior;
      }
    }

    // Build context for evaluation
    const context = {
      event: dto.context.event || {},
      system: dto.context.system || {},
      session: dto.context.session || {},
      incident: dto.context.incident || {},
      user: dto.context.user || {},
    };

    // Evaluate each rule
    let matchedCount = 0;
    let shouldStop = false;

    for (const rule of rules) {
      const ruleStart = Date.now();
      
      try {
        const matched = this.engine.evaluate(rule.condition, context);
        const evaluationTimeMs = Date.now() - ruleStart;

        results.push({
          rule_id: rule.id!,
          rule_name: rule.name,
          matched,
          actions: matched ? rule.actions : [],
          evaluation_time_ms: evaluationTimeMs,
        });

        if (matched) {
          matchedCount++;
          
          // Execute actions if requested
          if (dto.execute_actions && rule.actions.length > 0) {
            const actionContext: ActionContext = {
              event: context.event as Record<string, unknown>,
              system: context.system as Record<string, unknown>,
              session: context.session as Record<string, unknown>,
              incident: context.incident as Record<string, unknown>,
              user: context.user as Record<string, unknown>,
            };
            
            const executed = await executeActions(
              rule.actions as Array<Record<string, unknown>>,
              actionContext,
              pool,
              dto.execute_actions
            );
            
            executedActions = executedActions.concat(
              executed.map((e) => e.result)
            );
          }

          // Short-circuit for ALL mode
          if (matchBehavior === 'ALL' && matched) {
            shouldStop = true;
            break;
          }
        }
      } catch (error) {
        results.push({
          rule_id: rule.id!,
          rule_name: rule.name,
          matched: false,
          actions: [],
          evaluation_time_ms: Date.now() - ruleStart,
          error: (error as Error).message,
        });
      }
    }

    return {
      results,
      executed_actions: executedActions,
      total_evaluation_time_ms: Date.now() - startTime,
    };
  }
};