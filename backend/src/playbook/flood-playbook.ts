/**
 * Flood Playbook Definition
 * ======================
 * Pre-defined flood response playbook
 */

import { Playbook, PlaybookStep, PlaybookTrigger } from './models';

/**
 * Flood Playbook Steps
 */
export const FLOOD_PLAYBOOK_STEPS: Omit<PlaybookStep, 'id'>[] = [
  {
    order: 1,
    action_type: 'NOTIFY',
    config: {
      title: 'Flood Alert - {{incident.location}}',
      message: 'Flood incident reported at {{incident.location}}. Severity: {{incident.severity}}',
      recipients: ['supervisor', 'volunteers'],
      channels: ['push', 'sms'],
    },
    timeout_seconds: 60,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 2,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.weather}}/rainfall/{{incident.region}}',
      method: 'GET',
      timeout: 30,
    },
    timeout_seconds: 60,
    retry_count: 2,
    on_failure: 'CONTINUE',
  },
  {
    order: 3,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.hydrology}}/river-level/{{incident.river_basin}}',
      method: 'GET',
      timeout: 30,
    },
    timeout_seconds: 60,
    retry_count: 2,
    on_failure: 'CONTINUE',
  },
  {
    order: 4,
    action_type: 'WEBHOOK',
    config: {
      url: '{{services.simulation}}/flood/propagate',
      method: 'POST',
      body: {
        rainfall_mm: '{{assessment.rainfall_24h}}',
        river_level_m: '{{assessment.river_level}}',
        terrain_dem: '{{incident.dem}}',
        area_km2: '{{incident.affected_area}}',
      },
      timeout: 120,
    },
    timeout_seconds: 180,
    retry_count: 1,
    on_failure: 'CONTINUE',
  },
  {
    order: 5,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Flood Assessment - {{incident.location}}',
      description: 'Conduct field assessment for flood at {{incident.location}}. Predicted flood extent: {{simulation.flood_extent}}km2. Affected population: {{simulation.affected_population}}',
      task_type: 'assessment',
      priority: '{{incident.priority}}',
      required_skills: ['flood_assessment', 'first_aid'],
      assigned_to: null,
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 6,
    action_type: 'ASSIGN_VOLUNTEER',
    config: {
      task_id: '{{tasks.assessment}}',
      max_distance_km: 50,
      required_skills: ['flood_assessment', 'first_aid'],
      status: 'assigned',
    },
    timeout_seconds: 300,
    retry_count: 2,
    on_failure: 'ESCALATE',
  },
  {
    order: 7,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Open Shelters - {{incident.region}}',
      description: 'Open and prepare shelters for flood evacuees. Capacity required: {{simulation.shelter_capacity}}',
      task_type: 'shelter_prep',
      priority: 'HIGH',
      required_skills: ['logistics'],
      location: '{{shelters.nearest}}',
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 8,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.shelter}}/open',
      method: 'POST',
      body: {
        shelter_ids: '{{shelters.nearest_ids}}',
        capacity: '{{simulation.shelter_capacity}}',
        estimated_occupants: '{{simulation.affected_population}}',
      },
      timeout: 30,
    },
    timeout_seconds: 60,
    retry_count: 1,
    on_failure: 'CONTINUE',
  },
  {
    order: 9,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Pre-position Flood Resources - {{incident.region}}',
      description: 'Pre-position sandbags, pumps, and boats at strategic locations',
      task_type: 'logistics',
      priority: 'HIGH',
      required_skills: ['logistics', 'driving'],
      resources: ['sandbags', 'water_pumps', 'rescue_boats'],
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'CONTINUE',
  },
  {
    order: 10,
    action_type: 'SEND_BROADCAST',
    config: {
      title: 'Flood Warning',
      message: 'Flood warning issued for {{incident.location}}. Evacuate to nearest shelter: {{shelters.nearest}}. Bring essential supplies.',
      target_area: '{{incident.affected_area}}',
      channels: ['sms', 'push', 'broadcast'],
    },
    timeout_seconds: 60,
    retry_count: 1,
    on_failure: 'CONTINUE',
  },
  {
    order: 11,
    action_type: 'CONDITIONAL_BRANCH',
    config: {
      condition: '{{incident.severity}} === "CRITICAL"',
      true_branch: 12,
      false_branch: 13,
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 12,
    action_type: 'ESCALATE',
    config: {
      target: 'COMMAND_CENTER',
      reason: 'CRITICAL flood severity',
      message: 'CRITICAL flood at {{incident.location}}. Immediate command center attention required.',
    },
    timeout_seconds: 60,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 13,
    action_type: 'UPDATE_STATUS',
    config: {
      status: 'COMPLETED',
      note: 'Flood playbook execution completed',
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'CONTINUE',
  },
];

/**
 * Flood Playbook Trigger
 */
export const FLOOD_PLAYBOOK_TRIGGER: Omit<PlaybookTrigger, 'id'> = {
  event_type: 'INCIDENT_CREATED',
  condition_expression: "incident.type === 'FLOOD' && incident.severity >= 'MODERATE'",
  cooldown_minutes: 30,
  is_active: true,
};

/**
 * Flood Playbook Definition
 */
export const FLOOD_PLAYBOOK: Omit<Playbook, 'id' | 'created_at' | 'updated_at'> = {
  name: 'Flood Response Playbook',
  description: 'Standard flood response playbook: alert → assess → dispatch → shelter → resupply → escalate',
  disaster_type: 'FLOOD',
  status: 'ACTIVE',
  version: 1,
  steps: FLOOD_PLAYBOOK_STEPS as PlaybookStep[],
  triggers: [FLOOD_PLAYBOOK_TRIGGER as PlaybookTrigger],
};

/**
 * Get flood playbook (for use in playbook service)
 */
export function getFloodPlaybook(): Omit<Playbook, 'id' | 'created_at' | 'updated_at'> {
  return { ...FLOOD_PLAYBOOK };
}