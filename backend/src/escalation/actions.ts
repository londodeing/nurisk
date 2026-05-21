/**
 * Escalation Actions
 * ================
 * Execute escalation actions for different targets
 */

import { Pool } from 'pg';
import { EscalationTarget, EscalationActionType } from './models';

interface EscalationAction {
  type: EscalationActionType;
  target: EscalationTarget;
  config?: Record<string, unknown>;
}

/**
 * Execute an escalation action
 */
export async function executeEscalationAction(
  action: EscalationAction | Record<string, unknown>,
  executionId: number,
  stepExecutionId: number,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  // Type guard to extract config safely
  const config = 'config' in action ? (action as EscalationAction).config : undefined;
  const actionType = action.type as EscalationActionType;
  const target = action.target as EscalationTarget;

  try {
    switch (actionType) {
      case 'notify_supervisor':
        return await notifySupervisor(target, config, pool);
      case 'increase_priority':
        return await increasePriority(config, pool);
      case 'trigger_fallback_playbook':
        return await triggerFallbackPlaybook(config, executionId, pool);
      case 'assign_additional_volunteers':
        return await assignAdditionalVolunteers(config, pool);
      case 'send_alert':
        return await sendAlert(target, config, pool);
      case 'escalate_to_command':
        return await escalateToCommand(target, config, pool);
      default:
        return { success: false, error: `Unknown action type: ${actionType}` };
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==========================================================
// notify_supervisor
// ==========================================================

async function notifySupervisor(
  target: EscalationTarget,
  config: Record<string, unknown> | undefined,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  const { message, incident_id } = config || {};

  // Determine recipient based on target
  let recipientType: string;
  switch (target) {
    case 'SUPERVISOR':
      recipientType = 'supervisor';
      break;
    case 'COMMAND_CENTER':
      recipientType = 'command_center';
      break;
    case 'BNPB':
      recipientType = 'bnpb';
      break;
    default:
      recipientType = 'all';
  }

  await pool.query(
    `INSERT INTO notifications (title, message, type, recipient_type, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [
      'Escalation Alert',
      message || 'Step execution requires attention',
      'escalation',
      recipientType,
    ]
  );

  return { success: true };
}

// ==========================================================
// increase_priority
// ==========================================================

async function increasePriority(
  config: Record<string, unknown> | undefined,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  const { incident_id, new_priority } = config || {};
  const targetPriority = new_priority || 'HIGH';

  if (!incident_id) {
    return { success: false, error: 'No incident_id provided' };
  }

  await pool.query(
    `UPDATE incidents SET priority_level = $1, updated_at = NOW() WHERE id = $2`,
    [targetPriority, incident_id]
  );

  // Log the escalation
  await pool.query(
    `INSERT INTO incident_notes (incident_id, note, created_by)
     VALUES ($1, $2, 0)`,
    [incident_id, `ESCALATION: Priority increased to ${targetPriority}`]
  );

  return { success: true };
}

// ==========================================================
// trigger_fallback_playbook
// ==========================================================

async function triggerFallbackPlaybook(
  config: Record<string, unknown> | undefined,
  executionId: number,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  const { playbook_id } = config || {};

  if (!playbook_id) {
    return { success: false, error: 'No playbook_id provided' };
  }

  // Get execution incident_id
  const execResult = await pool.query(
    'SELECT incident_id FROM playbook_executions WHERE id = $1',
    [executionId]
  );

  const incidentId = execResult.rows[0]?.incident_id;

  // Create new execution
  await pool.query(
    `INSERT INTO playbook_executions (playbook_id, incident_id, status, context)
     VALUES ($1, $2, 'RUNNING', $3)`,
    [playbook_id, incidentId, JSON.stringify({ triggered_by: 'escalation', original_execution: executionId })]
  );

  return { success: true };
}

// ==========================================================
// assign_additional_volunteers
// ==========================================================

async function assignAdditionalVolunteers(
  config: Record<string, unknown> | undefined,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  const { incident_id, count, skills } = config || {};
  const volunteerCount = (count as number) || 2;
  const requiredSkills = (skills as string[]) || [];

  if (!incident_id) {
    return { success: false, error: 'No incident_id provided' };
  }

  // Find available volunteers
  let query = `
    SELECT v.id FROM volunteers v
    WHERE v.status = 'approved'
  `;
  const params: unknown[] = [];

  if (requiredSkills.length > 0) {
    query += ' AND (';
    for (let i = 0; i < requiredSkills.length; i++) {
      if (i > 0) query += ' OR ';
      query += `v.expertise LIKE $${params.length + 1}`;
      params.push(`%${requiredSkills[i]}%`);
    }
    query += ')';
  }

  query += ` LIMIT $${params.length + 1}`;
  params.push(volunteerCount);

  const volunteers = await pool.query(query, params);

  // Assign volunteers
  for (const volunteer of volunteers.rows) {
    await pool.query(
      `INSERT INTO volunteer_deployments (incident_id, volunteer_id, status, note)
       VALUES ($1, $2, 'assigned', $3)`,
      [incident_id, volunteer.id, 'Auto-assigned via escalation']
    );
  }

  return { success: true, error: undefined };
}

// ==========================================================
// send_alert
// ==========================================================

async function sendAlert(
  target: EscalationTarget,
  config: Record<string, unknown> | undefined,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  const { title, message, channel } = config || {};

  await pool.query(
    `INSERT INTO notifications (title, message, type, recipient_type, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [
      title || 'Escalation Alert',
      message || 'Immediate attention required',
      channel || 'alert',
      target.toLowerCase(),
    ]
  );

  return { success: true };
}

// ==========================================================
// escalate_to_command
// ==========================================================

async function escalateToCommand(
  target: EscalationTarget,
  config: Record<string, unknown> | undefined,
  pool: Pool
): Promise<{ success: boolean; error?: string }> {
  const { incident_id, message } = config || {};

  // Log command center escalation
  if (incident_id) {
    await pool.query(
      `INSERT INTO incident_notes (incident_id, note, created_by)
       VALUES ($1, $2, 0)`,
      [incident_id, `ESCALATED TO COMMAND CENTER: ${message || 'Automatic escalation'}`]
    );
  }

  // Send to command center
  await pool.query(
    `INSERT INTO notifications (title, message, type, recipient_type, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [
      'Command Center Escalation',
      message || 'Incident escalated to command center',
      'command',
      'command_center',
    ]
  );

  return { success: true };
}

/**
 * Log escalation to database
 */
export async function logEscalation(
  executionId: number,
  stepExecutionId: number | undefined,
  level: string,
  target: EscalationTarget,
  action: EscalationActionType,
  details: Record<string, unknown>,
  pool: Pool
): Promise<void> {
  await pool.query(
    `INSERT INTO escalation_logs (execution_id, step_execution_id, level, target, action, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      executionId,
      stepExecutionId,
      level,
      target,
      action,
      JSON.stringify(details),
    ]
  );
}