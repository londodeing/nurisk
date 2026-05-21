/**
 * Escalation Timer Service
 * ====================
 * Manages escalation timers for playbook steps
 */

import { Pool } from 'pg';
import { EventEmitter } from 'events';
import {
  EscalationTimer,
  EscalationLog,
  EscalationRule,
  StartEscalationTimerDTO,
} from './models';
import { executeEscalationAction } from './actions';

export class EscalationTimerService extends EventEmitter {
  private pool: Pool;
  private activeTimers: Map<number, NodeJS.Timeout> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.startTimerChecker();
  }

  /**
   * Start a new escalation timer
   */
  async startTimer(dto: StartEscalationTimerDTO): Promise<EscalationTimer> {
    const fireAt = new Date(Date.now() + dto.timeout_ms);

    // Store in database
    const result = await this.pool.query(
      `INSERT INTO escalation_timers (step_execution_id, execution_id, timeout_ms, fire_at, escalation_action, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [
        dto.step_execution_id,
        dto.execution_id,
        dto.timeout_ms,
        fireAt,
        JSON.stringify(dto.escalation_action),
      ]
    );

    const timer = result.rows[0];

    // Set in-memory timer
    const timeout = setTimeout(async () => {
      await this.fireTimer(timer.id);
    }, dto.timeout_ms);

    this.activeTimers.set(timer.id, timeout);

    return timer;
  }

  /**
   * Cancel a timer (when step completes before escalation)
   */
  async cancelTimer(timerId: number): Promise<void> {
    const timeout = this.activeTimers.get(timerId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimers.delete(timerId);
    }

    await this.pool.query(
      `UPDATE escalation_timers SET status = 'CANCELLED' WHERE id = $1`,
      [timerId]
    );
  }

  /**
   * Cancel timers for a step execution
   */
  async cancelTimersForStep(stepExecutionId: number): Promise<void> {
    const result = await this.pool.query(
      `SELECT id FROM escalation_timers WHERE step_execution_id = $1 AND status = 'PENDING'`,
      [stepExecutionId]
    );

    for (const row of result.rows) {
      await this.cancelTimer(row.id);
    }
  }

  /**
   * Fire a timer (called when timeout expires)
   */
  private async fireTimer(timerId: number): Promise<void> {
    try {
      // Get timer details
      const timerResult = await this.pool.query(
        'SELECT * FROM escalation_timers WHERE id = $1',
        [timerId]
      );

      if (timerResult.rows.length === 0) return;
      const timer = timerResult.rows[0];

      // Check if already handled
      if (timer.status !== 'PENDING') return;

      // Mark as fired
      await this.pool.query(
        `UPDATE escalation_timers SET status = 'FIRED' WHERE id = $1`,
        [timerId]
      );

      this.activeTimers.delete(timerId);

      // Execute escalation action
      const action = typeof timer.escalation_action === 'string'
        ? JSON.parse(timer.escalation_action)
        : timer.escalation_action;

      await executeEscalationAction(
        action,
        timer.execution_id,
        timer.step_execution_id,
        this.pool
      );

      // Emit event
      this.emit('escalation', {
        timerId,
        executionId: timer.execution_id,
        stepExecutionId: timer.step_execution_id,
        action,
      });
    } catch (error) {
      console.error('[ESCALATION_TIMER] Fire error:', error);
    }
  }

  /**
   * Start periodic checker for timers (fallback for in-memory timers)
   */
  private startTimerChecker(): void {
    this.checkInterval = setInterval(async () => {
      try {
        // Find timers that should have fired
        const result = await this.pool.query(
          `SELECT id FROM escalation_timers 
           WHERE status = 'PENDING' AND fire_at <= NOW()`,
          []
        );

        for (const row of result.rows) {
          await this.fireTimer(row.id);
        }
      } catch (error) {
        console.error('[ESCALATION_TIMER] Check error:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Get active timers for an execution
   */
  async getTimersForExecution(executionId: number): Promise<EscalationTimer[]> {
    const result = await this.pool.query(
      'SELECT * FROM escalation_timers WHERE execution_id = $1 AND status = $1',
      [executionId]
    );
    return result.rows;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    for (const timeout of this.activeTimers.values()) {
      clearTimeout(timeout);
    }
    this.activeTimers.clear();
  }
};