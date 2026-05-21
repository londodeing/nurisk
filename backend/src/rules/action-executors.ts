/**
 * Action Executors
 * =============
 * Execute actions triggered by rules with rollback support
 */

import { Pool } from 'pg';
import axios from 'axios';

export interface ActionContext {
  event: Record<string, unknown>;
  system: Record<string, unknown>;
  session: Record<string, unknown>;
  incident: Record<string, unknown>;
  user: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  action_type: string;
  result?: unknown;
  error?: string;
  rollback?: boolean;
  [key: string]: unknown;
}

export interface ExecutedAction {
  action: Record<string, unknown>;
  result: ActionResult;
  timestamp: Date;
}

// ==========================================================
// Action Executor Registry
// ==========================================================

type ActionExecutor = (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
) => Promise<ActionResult>;

const actionExecutors: Record<string, ActionExecutor> = {};

// ==========================================================
// create_incident
// ==========================================================

actionExecutors['create_incident'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { title, disaster_type, region, description, priority } = action;
    
    const result = await pool.query(
      `INSERT INTO incidents (title, disaster_type, region, description, priority_level, status, source)
       VALUES ($1, $2, $3, $4, $5, 'RULE_ENGINE')
       RETURNING id`,
      [title, disaster_type, region, description, priority || 'MEDIUM']
    );
    
    return {
      success: true,
      action_type: 'create_incident',
      result: { incident_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      action_type: 'create_incident',
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// assign_volunteer
// ==========================================================

actionExecutors['assign_volunteer'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { incident_id, volunteer_id, role } = action;
    
    const result = await pool.query(
      `INSERT INTO volunteer_deployments (incident_id, volunteer_id, status, note)
       VALUES ($1, $2, 'assigned', $3)
       RETURNING id`,
      [incident_id, volunteer_id, role || 'responder']
    );
    
    return {
      success: true,
      action_type: 'assign_volunteer',
      result: { deployment_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      action_type: 'assign_volunteer',
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// send_notification
// ==========================================================

actionExecutors['send_notification'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { title, message, recipients, channel } = action;
    
    // Insert notification into database
    const result = await pool.query(
      `INSERT INTO notifications (title, message, type, recipient_type, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [title, message, channel || 'broadcast', recipients || 'all']
    );
    
    return {
      success: true,
      action_type: 'send_notification',
      result: { notification_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      action_type: 'send_notification',
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// escalate
// ==========================================================

actionExecutors['escalate'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { incident_id, new_priority, reason } = action;
    
    const result = await pool.query(
      `UPDATE incidents 
       SET priority_level = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [new_priority, incident_id]
    );
    
    // Log escalation
    await pool.query(
      `INSERT INTO incident_notes (incident_id, note, created_by)
       VALUES ($1, $2, 0)`,
      [incident_id, `ESCALATION: ${reason}`]
    );
    
    return {
      success: true,
      action_type: 'escalate',
      result: { incident_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      action_type: 'escalate',
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// trigger_playbook
// ==========================================================

actionExecutors['trigger_playbook'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { playbook_id, incident_id } = action;
    
    // Get playbook steps
    const playbookResult = await pool.query(
      'SELECT * FROM playbooks WHERE id = $1 AND status = $2',
      [playbook_id, 'ACTIVE']
    );
    
    if (playbookResult.rows.length === 0) {
      return {
        success: false,
        action_type: 'trigger_playbook',
        error: 'Playbook not found or not active',
      };
    }
    
    // Log playbook trigger
    await pool.query(
      `INSERT INTO playbook_executions (playbook_id, incident_id, status, triggered_by)
       VALUES ($1, $2, 'started', 0)`,
      [playbook_id, incident_id]
    );
    
    return {
      success: true,
      action_type: 'trigger_playbook',
      result: { playbook_id },
    };
  } catch (error) {
    return {
      success: false,
      action_type: 'trigger_playbook',
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// update_status
// ==========================================================

actionExecutors['update_status'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { incident_id, new_status, note } = action;
    
    const result = await pool.query(
      `UPDATE incidents 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [new_status, incident_id]
    );
    
    if (note) {
      await pool.query(
        `INSERT INTO incident_notes (incident_id, note, created_by)
         VALUES ($1, $2, 0)`,
        [incident_id, note]
      );
    }
    
    return {
      success: true,
      action_type: 'update_status',
      result: { incident_id: result.rows[0].id, status: new_status },
    };
  } catch (error) {
    return {
      success: false,
      action_type: 'update_status',
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// http_request
// ==========================================================

actionExecutors['http_request'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  try {
    const { url, method, headers, body } = action;
    
    const response = await axios({
      url: url as string,
      method: (method as string) || 'GET',
      headers: headers as Record<string, string>,
      data: body,
      timeout: 10000,
    });
    
    return {
      success: true,
      action_type: 'http_request',
      result: { status: response.status, data: response.data },
    };
  } catch (error) {
    const axiosError = error as { message: string; response?: { status: number } };
    return {
      success: false,
      action_type: 'http_request',
      error: axiosError.message,
    };
  }
};

// ==========================================================
// webhook
// ==========================================================

actionExecutors['webhook'] = async (
  action: Record<string, unknown>,
  context: ActionContext,
  pool: Pool
): Promise<ActionResult> => {
  // Webhook is same as http_request but with simpler interface
  return actionExecutors['http_request'](action, context, pool);
};

// ==========================================================
// Execute Actions with Rollback
// ==========================================================

export async function executeActions(
  actions: Array<Record<string, unknown>>,
  context: ActionContext,
  pool: Pool,
  execute: boolean = false
): Promise<ExecutedAction[]> {
  const executed: ExecutedAction[] = [];
  
  if (!execute) {
    // Just validate, don't execute
    return executed;
  }
  
  for (const action of actions) {
    const actionType = action.type as string;
    const executor = actionExecutors[actionType];
    
    if (!executor) {
      executed.push({
        action,
        result: {
          success: false,
          action_type: actionType,
          error: `Unknown action type: ${actionType}`,
        },
        timestamp: new Date(),
      });
      continue;
    }
    
    const result = await executor(action, context, pool);
    executed.push({
      action,
      result,
      timestamp: new Date(),
    });
    
    // Rollback on failure if marked
    if (!result.success && action.rollback) {
      await rollbackActions(executed, pool);
      return executed;
    }
  }
  
  return executed;
}

// ==========================================================
// Rollback
// ==========================================================

async function rollbackActions(
  executed: ExecutedAction[],
  pool: Pool
): Promise<void> {
  for (const { action, result } of executed.reverse()) {
    if (!result.success) continue;
    
    const actionType = result.action_type;
    
    try {
      switch (actionType) {
        case 'create_incident':
          if (result.result && typeof result.result === 'object') {
            const { incident_id } = result.result as { incident_id: number };
            await pool.query('DELETE FROM incidents WHERE id = $1', [incident_id]);
          }
          break;
        case 'assign_volunteer':
          if (result.result && typeof result.result === 'object') {
            const { deployment_id } = result.result as { deployment_id: number };
            await pool.query('DELETE FROM volunteer_deployments WHERE id = $1', [deployment_id]);
          }
          break;
        case 'send_notification':
          if (result.result && typeof result.result === 'object') {
            const { notification_id } = result.result as { notification_id: number };
            await pool.query('DELETE FROM notifications WHERE id = $1', [notification_id]);
          }
          break;
        case 'update_status':
          // Can't easily rollback status changes
          break;
        default:
          console.log(`[ROLLBACK] No rollback for action type: ${actionType}`);
      }
    } catch (error) {
      console.error(`[ROLLBACK] Failed for ${actionType}:`, error);
    }
  }
}

export { actionExecutors };