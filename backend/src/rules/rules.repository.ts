/**
 * Rules Repository
 * ===============
 * Data access for rules and rule sets
 */

import { Pool } from 'pg';
import {
  RuleDefinition,
  RuleSet,
  RuleEvaluationContext,
  RuleEvaluationResult,
  CreateRuleDefinitionDTO,
  UpdateRuleDefinitionDTO,
  CreateRuleSetDTO,
} from './models';

export class RulesRepository {
  constructor(private pool: Pool) {}

  // ==========================================================
  // Rule Definition CRUD
  // ==========================================================

  async createRule(dto: CreateRuleDefinitionDTO): Promise<RuleDefinition> {
    const result = await this.pool.query(
      `INSERT INTO rule_definitions (name, description, rule_set_id, condition, actions, priority, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        dto.name,
        dto.description,
        dto.rule_set_id,
        JSON.stringify(dto.condition),
        JSON.stringify(dto.actions),
        dto.priority,
        dto.is_active,
      ]
    );

    return this.parseRuleDefinition(result.rows[0]);
  }

  async getRuleById(id: number): Promise<RuleDefinition | null> {
    const result = await this.pool.query(
      'SELECT * FROM rule_definitions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.parseRuleDefinition(result.rows[0]);
  }

  async updateRule(id: number, dto: UpdateRuleDefinitionDTO): Promise<RuleDefinition | null> {
    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(dto.description);
    }
    if (dto.condition !== undefined) {
      updates.push(`condition = $${paramIndex++}`);
      values.push(JSON.stringify(dto.condition));
    }
    if (dto.actions !== undefined) {
      updates.push(`actions = $${paramIndex++}`);
      values.push(JSON.stringify(dto.actions));
    }
    if (dto.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(dto.priority);
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(dto.is_active);
    }
    if (dto.rule_set_id !== undefined) {
      updates.push(`rule_set_id = $${paramIndex++}`);
      values.push(dto.rule_set_id);
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE rule_definitions SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return null;
    return this.parseRuleDefinition(result.rows[0]);
  }

  async deleteRule(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM rule_definitions WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getRulesBySetId(setId: number): Promise<RuleDefinition[]> {
    const result = await this.pool.query(
      'SELECT * FROM rule_definitions WHERE rule_set_id = $1 AND is_active = true ORDER BY priority DESC',
      [setId]
    );
    return result.rows.map((row) => this.parseRuleDefinition(row));
  }

  async getAllRules(): Promise<RuleDefinition[]> {
    const result = await this.pool.query(
      'SELECT * FROM rule_definitions WHERE is_active = true ORDER BY priority DESC'
    );
    return result.rows.map((row) => this.parseRuleDefinition(row));
  }

  async getRulesByIds(ids: number[]): Promise<RuleDefinition[]> {
    if (ids.length === 0) return [];
    const result = await this.pool.query(
      `SELECT * FROM rule_definitions WHERE id = ANY($1) AND is_active = true ORDER BY priority DESC`,
      [ids]
    );
    return result.rows.map((row) => this.parseRuleDefinition(row));
  }

  // ==========================================================
  // Rule Set CRUD
  // ==========================================================

  async createRuleSet(dto: CreateRuleSetDTO): Promise<RuleSet> {
    const result = await this.pool.query(
      `INSERT INTO rule_sets (name, description, match_behavior, priority, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [dto.name, dto.description, dto.match_behavior, dto.priority, dto.is_active]
    );

    return this.parseRuleSet(result.rows[0]);
  }

  async getRuleSetById(id: number): Promise<RuleSet | null> {
    const result = await this.pool.query(
      'SELECT * FROM rule_sets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.parseRuleSet(result.rows[0]);
  }

  async getAllRuleSets(): Promise<RuleSet[]> {
    const result = await this.pool.query(
      'SELECT * FROM rule_sets WHERE is_active = true ORDER BY priority DESC'
    );
    return result.rows.map((row) => this.parseRuleSet(row));
  }

  // ==========================================================
  // Helpers
  // ==========================================================

  private parseRuleDefinition(row: Record<string, unknown>): RuleDefinition {
    return {
      id: row.id as number,
      name: row.name as string,
      description: row.description as string,
      rule_set_id: row.rule_set_id as number | undefined,
      condition:
        typeof row.condition === 'string'
          ? JSON.parse(row.condition)
          : row.condition,
      actions: typeof row.actions === 'string'
          ? JSON.parse(row.actions)
          : row.actions,
      priority: row.priority as number,
      is_active: row.is_active as boolean,
      created_at: row.created_at as Date | undefined,
      updated_at: row.updated_at as Date | undefined,
    };
  }

  private parseRuleSet(row: Record<string, unknown>): RuleSet {
    return {
      id: row.id as number,
      name: row.name as string,
      description: row.description as string,
      match_behavior: row.match_behavior as 'ALL' | 'ANY',
      priority: row.priority as number,
      is_active: row.is_active as boolean,
      created_at: row.created_at as Date | undefined,
      updated_at: row.updated_at as Date | undefined,
    };
  }
}