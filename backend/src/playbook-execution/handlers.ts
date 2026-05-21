/**
 * Step Handlers
 * ==========
 * Execute individual playbook step actions
 */

import { Pool } from 'pg';
import axios from 'axios';

export interface StepContext {
  incident?: Record<string, unknown>;
  event?: Record<string, unknown>;
  user?: Record<string, unknown>;
  execution?: Record<string, unknown>;
}

export interface StepResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
}

// ==========================================================
// Handler Registry
// ==========================================================

type StepHandler = (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
) => Promise<StepResult>;

const handlers: Record<string, StepHandler> = {};

// ==========================================================
// SEND_NOTIFICATION
// ==========================================================

handlers['SEND_NOTIFICATION'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { title, message, template, channel, recipients } = config;

    // Substitute variables in template
    let finalMessage = message as string;
    let finalTitle = title as string;

    if (template) {
      finalMessage = substituteVariables(String(message), context);
      finalTitle = substituteVariables(String(title), context);
    }

    // Insert notification
    const result = await pool.query(
      `INSERT INTO notifications (title, message, type, recipient_type, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [finalTitle, finalMessage, channel || 'broadcast', recipients || 'all']
    );

    return {
      success: true,
      output: { notification_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// CREATE_INCIDENT
// ==========================================================

handlers['CREATE_INCIDENT'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { title, disaster_type, region, description, priority, source } = config;

    // Map fields from context
    const incidentData = {
      title: substituteVariables(String(title || ''), context),
      disaster_type: disaster_type || 'OTHER',
      region: region || context.incident?.region,
      description: substituteVariables(String(description || ''), context),
      priority: priority || 'MEDIUM',
      source: source || 'PLAYBOOK',
    };

    const result = await pool.query(
      `INSERT INTO incidents (title, disaster_type, region, description, priority_level, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        incidentData.title,
        incidentData.disaster_type,
        incidentData.region,
        incidentData.description,
        incidentData.priority,
        incidentData.source,
      ]
    );

    return {
      success: true,
      output: { incident_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// ASSIGN_TEAM
// ==========================================================

handlers['ASSIGN_TEAM'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { incident_id, skills, count, role } = config;
    const targetIncidentId = context.incident?.id || incident_id;
    const requiredSkills = (skills as string[]) || [];
    const teamCount = (count as number) || 1;

    if (!targetIncidentId) {
      return {
        success: false,
        error: 'No incident_id provided',
      };
    }

    // Find volunteers with matching skills
    let query = `
      SELECT v.id, v.full_name, v.phone, v.expertise
      FROM volunteers v
      WHERE v.status = 'approved'
    `;
    const params: unknown[] = [];

    if (requiredSkills.length > 0) {
      query += ` AND (`;
      for (let i = 0; i < requiredSkills.length; i++) {
        if (i > 0) query += ' OR ';
        query += `$${params.length + 1}`;
        params.push(`%${requiredSkills[i]}%`);
      }
      query += `)`;
    }

    query += ` LIMIT $${params.length + 1}`;
    params.push(teamCount);

    const volunteers = await pool.query(query, params);

    if (volunteers.rows.length === 0) {
      return {
        success: false,
        error: 'No matching volunteers found',
      };
    }

    // Assign volunteers
    const assigned: number[] = [];
    for (const volunteer of volunteers.rows) {
      await pool.query(
        `INSERT INTO volunteer_deployments (incident_id, volunteer_id, status, note)
         VALUES ($1, $2, 'assigned', $3)`,
        [targetIncidentId, volunteer.id, role || 'responder']
      );
      assigned.push(volunteer.id);
    }

    return {
      success: true,
      output: { assigned_volunteers: assigned },
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// ESCALATE
// ==========================================================

handlers['ESCALATE'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { incident_id, new_priority, reason } = config;
    const targetIncidentId = context.incident?.id || incident_id;

    if (!targetIncidentId) {
      return {
        success: false,
        error: 'No incident_id provided',
      };
    }

    const result = await pool.query(
      `UPDATE incidents 
       SET priority_level = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [new_priority || 'HIGH', targetIncidentId]
    );

    // Log escalation
    await pool.query(
      `INSERT INTO incident_notes (incident_id, note, created_by)
       VALUES ($1, $2, 0)`,
      [targetIncidentId, `ESCALATION: ${reason || 'Playbook triggered'}`]
    );

    return {
      success: true,
      output: { incident_id: result.rows[0].id },
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// UPDATE_STATUS
// ==========================================================

handlers['UPDATE_STATUS'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { incident_id, new_status, note } = config;
    const targetIncidentId = context.incident?.id || incident_id;

    if (!targetIncidentId) {
      return {
        success: false,
        error: 'No incident_id provided',
      };
    }

    const result = await pool.query(
      `UPDATE incidents 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [new_status || 'investigated', targetIncidentId]
    );

    if (note) {
      await pool.query(
        `INSERT INTO incident_notes (incident_id, note, created_by)
         VALUES ($1, $2, 0)`,
        [targetIncidentId, note]
      );
    }

    return {
      success: true,
      output: { incident_id: result.rows[0].id, status: new_status },
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// HTTP_REQUEST
// ==========================================================

handlers['HTTP_REQUEST'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { url, method, headers, body } = config;

    // Substitute variables
    const finalUrl = substituteVariables(String(url), context);
    const finalBody = body ? substituteVariables(JSON.stringify(body), context) : undefined;

    const response = await axios({
      url: finalUrl,
      method: (method as string) || 'GET',
      headers: headers as Record<string, string>,
      data: finalBody ? JSON.parse(finalBody) : undefined,
      timeout: 10000,
    });

    return {
      success: true,
      output: { status: response.status, data: response.data },
    };
  } catch (error) {
    const axiosError = error as { message: string; response?: { status: number } };
    return {
      success: false,
      error: axiosError.message,
    };
  }
};

// ==========================================================
// WAIT
// ==========================================================

handlers['WAIT'] = async (
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> => {
  try {
    const { seconds } = config;
    const waitSeconds = (seconds as number) || 60;

    await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));

    return {
      success: true,
      output: { waited_seconds: waitSeconds },
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==========================================================
// Helper Functions
// ==========================================================

function substituteVariables(
  template: string,
  context: StepContext
): string {
  let result = template;

  const allContext = {
    ...context.incident,
    ...context.event,
    ...context.user,
    ...context.execution,
  };

  for (const [key, value] of Object.entries(allContext)) {
    result = result.replace(
      new RegExp(`\\{\\{${key}\}\\}`, 'g'),
      String(value)
    );
  }

  return result;
}

// ==========================================================
// Execute Step
// ==========================================================

export async function executeStep(
  actionType: string,
  config: Record<string, unknown>,
  context: StepContext,
  pool: Pool
): Promise<StepResult> {
  const handler = handlers[actionType];

  if (!handler) {
    return {
      success: false,
      error: `Unknown action type: ${actionType}`,
    };
  }

  return handler(config, context, pool);
}

export { handlers };