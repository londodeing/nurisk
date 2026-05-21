/**
 * Playbook Repository
 * ===============
 * Data access layer for playbooks with versioning
 */

import { Pool } from 'pg';
import {
  Playbook,
  PlaybookTemplate,
  PlaybookQueryParams,
  substituteVariables,
} from './models';
import { ListResponse } from '@nurisk/shared-types';

export class PlaybookRepository {
  constructor(private pool: Pool) {}

  // ==========================================================
  // Playbook CRUD
  // ==========================================================

  async create(playbook: Omit<Playbook, 'id' | 'version' | 'created_at' | 'updated_at'>): Promise<Playbook> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert playbook
      const playbookResult = await client.query(
        `INSERT INTO playbooks (name, description, disaster_type, status, version, created_by, updated_by)
         VALUES ($1, $2, $3, $4, 1, $5, $5)
         RETURNING *`,
        [
          playbook.name,
          playbook.description,
          playbook.disaster_type,
          playbook.status,
          playbook.created_by,
        ]
      );

      const playbookId = playbookResult.rows[0].id;

      // Insert steps
      for (const step of playbook.steps) {
        await client.query(
          `INSERT INTO playbook_steps (playbook_id, step_order, action_type, config, timeout_seconds, retry_count, on_failure)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            playbookId,
            step.order,
            step.action_type,
            JSON.stringify(step.config),
            step.timeout_seconds,
            step.retry_count,
            step.on_failure,
          ]
        );
      }

      // Insert triggers
      for (const trigger of playbook.triggers || []) {
        await client.query(
          `INSERT INTO playbook_triggers (playbook_id, event_type, condition_expression, cooldown_minutes, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            playbookId,
            trigger.event_type,
            trigger.condition_expression,
            trigger.cooldown_minutes,
            trigger.is_active,
          ]
        );
      }

      await client.query('COMMIT');

      return this.getById(playbookId) as Promise<Playbook>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getById(id: number): Promise<Playbook | null> {
    const playbookResult = await this.pool.query(
      'SELECT * FROM playbooks WHERE id = $1',
      [id]
    );

    if (playbookResult.rows.length === 0) return null;

    const playbook = playbookResult.rows[0];

    // Get steps
    const stepsResult = await this.pool.query(
      'SELECT * FROM playbook_steps WHERE playbook_id = $1 ORDER BY step_order',
      [id]
    );
    playbook.steps = stepsResult.rows.map((row) => ({
      id: row.id,
      order: row.step_order,
      action_type: row.action_type,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      timeout_seconds: row.timeout_seconds,
      retry_count: row.retry_count,
      on_failure: row.on_failure,
    }));

    // Get triggers
    const triggersResult = await this.pool.query(
      'SELECT * FROM playbook_triggers WHERE playbook_id = $1',
      [id]
    );
    playbook.triggers = triggersResult.rows.map((row) => ({
      id: row.id,
      event_type: row.event_type,
      condition_expression: row.condition_expression,
      cooldown_minutes: row.cooldown_minutes,
      is_active: row.is_active,
    }));

    return playbook;
  }

  async findAll(params: PlaybookQueryParams): Promise<ListResponse<Playbook>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.disaster_type) {
      conditions.push(`disaster_type = ${paramIndex++}`);
      values.push(params.disaster_type);
    }

    if (params.status) {
      conditions.push(`status = ${paramIndex++}`);
      values.push(params.status);
    }

    if (params.version) {
      conditions.push(`version = ${paramIndex++}`);
      values.push(params.version);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.pool.query(
      `SELECT COUNT(*) as total FROM playbooks ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    const offset = (params.page - 1) * params.limit;
    const result = await this.pool.query(
      `SELECT * FROM playbooks ${whereClause} ORDER BY updated_at DESC LIMIT ${paramIndex++} OFFSET ${paramIndex}`,
      [...values, params.limit, offset]
    );

    const playbooks: Playbook[] = [];
    for (const row of result.rows) {
      const playbook = await this.getById(row.id);
      if (playbook) playbooks.push(playbook);
    }

    const totalPages = Math.ceil(total / params.limit);
    return {
      items: playbooks,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async update(id: number, data: Partial<Playbook>, updatedBy: number): Promise<Playbook | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current version
      const currentResult = await client.query(
        'SELECT version FROM playbooks WHERE id = $1',
        [id]
      );

      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const newVersion = currentResult.rows[0].version + 1;

      // Update playbook with version increment
      const updates: string[] = ['version = $1', 'updated_by = $2', 'updated_at = NOW()'];
      const values: unknown[] = [newVersion, updatedBy];
      let paramIndex = 3;

      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.disaster_type !== undefined) {
        updates.push(`disaster_type = $${paramIndex++}`);
        values.push(data.disaster_type);
      }

      values.push(id);
      await client.query(
        `UPDATE playbooks SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );

      // Update steps if provided
      if (data.steps) {
        await client.query('DELETE FROM playbook_steps WHERE playbook_id = $1', [id]);
        for (const step of data.steps) {
          await client.query(
            `INSERT INTO playbook_steps (playbook_id, step_order, action_type, config, timeout_seconds, retry_count, on_failure)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              id,
              step.order,
              step.action_type,
              JSON.stringify(step.config),
              step.timeout_seconds,
              step.retry_count,
              step.on_failure,
            ]
          );
        }
      }

      // Update triggers if provided
      if (data.triggers) {
        await client.query('DELETE FROM playbook_triggers WHERE playbook_id = $1', [id]);
        for (const trigger of data.triggers) {
          await client.query(
            `INSERT INTO playbook_triggers (playbook_id, event_type, condition_expression, cooldown_minutes, is_active)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              trigger.event_type,
              trigger.condition_expression,
              trigger.cooldown_minutes,
              trigger.is_active,
            ]
          );
        }
      }

      await client.query('COMMIT');

      return this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM playbook_steps WHERE playbook_id = $1', [id]);
      await client.query('DELETE FROM playbook_triggers WHERE playbook_id = $1', [id]);
      const result = await client.query('DELETE FROM playbooks WHERE id = $1', [id]);

      await client.query('COMMIT');

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==========================================================
  // Playbook Templates
  // ==========================================================

  async createTemplate(
    template: Omit<PlaybookTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PlaybookTemplate> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO playbook_templates (name, description, disaster_type, category, steps, variables, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          template.name,
          template.description,
          template.disaster_type,
          template.category,
          JSON.stringify(template.steps),
          JSON.stringify(template.variables),
          template.is_active,
        ]
      );

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTemplateById(id: number): Promise<PlaybookTemplate | null> {
    const result = await this.pool.query(
      'SELECT * FROM playbook_templates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      variables: typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables,
    };
  }

  async findAllTemplates(): Promise<PlaybookTemplate[]> {
    const result = await this.pool.query(
      'SELECT * FROM playbook_templates WHERE is_active = true ORDER BY name'
    );

    return result.rows.map((row) => ({
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      variables: typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables,
    }));
  }

  async instantiateFromTemplate(
    templateId: number,
    name: string,
    description: string,
    variables: Record<string, unknown>,
    createdBy: number
  ): Promise<Playbook> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Substitute variables in step configs
    const substitutedSteps = template.steps.map((step) => ({
      ...step,
      config: substituteVariables(step.config as Record<string, unknown>, variables),
    }));

    return this.create({
      name,
      description,
      disaster_type: template.disaster_type,
      status: 'DRAFT',
      steps: substitutedSteps,
      triggers: [],
      created_by: createdBy,
      updated_by: createdBy,
    });
  }
}