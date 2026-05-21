/**
 * Volcano Playbook Definition
 * ======================
 * Pre-defined volcano response playbook
 */

import { Playbook, PlaybookStep, PlaybookTrigger } from './models';

/**
 * Volcano Playbook Steps
 */
export const VOLCANO_PLAYBOOK_STEPS: Omit<PlaybookStep, 'id'>[] = [
  {
    order: 1,
    action_type: 'NOTIFY',
    config: {
      title: 'Volcano Alert - {{incident.volcano_name}}',
      message: 'Volcano {{incident.volcano_name}} alert level {{incident.alert_level}} ({{incident.alert_name}}). Eruption potential: {{incident.eruption_probability}}',
      recipients: ['supervisor', 'volunteers', 'bnpb', 'local_government'],
      channels: ['push', 'sms', 'broadcast'],
      priority: 'CRITICAL',
    },
    timeout_seconds: 60,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 2,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.magma}}/volcano/{{incident.volcano_id}}/status',
      method: 'GET',
      timeout: 30,
    },
    timeout_seconds: 60,
    retry_count: 2,
    on_failure: 'CONTINUE',
  },
  {
    order: 3,
    action_type: 'WEBHOOK',
    config: {
      url: '{{services.simulation}}/volcano/evacuation',
      method: 'POST',
      body: {
        volcano_id: '{{incident.volcano_id}}',
        alert_level: '{{incident.alert_level}}',
        vei: '{{incident.vei}}',
        eruption_column_m: '{{incident.eruption_column}}',
      },
      timeout: 120,
    },
    timeout_seconds: 180,
    retry_count: 1,
    on_failure: 'CONTINUE',
  },
  {
    order: 4,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Evacuation - {{incident.volcano_name}}',
      description: 'Evacuate population within {{simulation.evacuation_radius}}km of volcano. Priority zones: {{simulation.priority_zones}}',
      task_type: 'evacuation',
      priority: 'CRITICAL',
      required_skills: ['evacuation', 'first_aid'],
      evacuation_radius_km: '{{simulation.evacuation_radius}}',
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 5,
    action_type: 'SEND_BROADCAST',
    config: {
      title: 'VOLCANO ERUPTION WARNING',
      message: 'Volcano {{incident.volcano_name}} showing increased activity. Evacuate within {{simulation.evacuation_radius}}km immediately. Use designated routes: {{evacuation.routes}}',
      target_area: '{{simulation.evacuation_zone}}',
      channels: ['sms', 'push', 'broadcast', 'siren'],
      priority: 'CRITICAL',
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 6,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Ash Management - {{incident.region}}',
      description: 'Deploy ash cleanup and air quality monitoring in affected areas',
      task_type: 'ash_management',
      priority: 'HIGH',
      required_skills: ['hazmat', 'environmental'],
      area: '{{simulation.ash_fall_zone}}',
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'CONTINUE',
  },
  {
    order: 7,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.airquality}}/monitor',
      method: 'POST',
      body: {
        region: '{{incident.region}}',
        pm25_expected: '{{simulation.pm25}}',
        sulfur_dioxide_expected: '{{simulation.so2}}',
      },
      timeout: 30,
    },
    timeout_seconds: 60,
    retry_count: 1,
    on_failure: 'CONTINUE',
  },
  {
    order: 8,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Volcano Monitoring - {{incident.volcano_name}}',
      description: 'Intensify seismic and gas monitoring around volcano',
      task_type: 'monitoring',
      priority: 'HIGH',
      required_skills: ['volcanology'],
      instruments: ['seismometer', 'gas_analyzer', 'thermal_camera'],
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'CONTINUE',
  },
  {
    order: 9,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Shelter Setup - {{incident.region}}',
      description: 'Open emergency shelters for evacuated population. Capacity: {{simulation.evacuated_population}}',
      task_type: 'shelter',
      priority: 'HIGH',
      required_skills: ['logistics'],
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 10,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.shelter}}/open',
      method: 'POST',
      body: {
        shelter_ids: '{{shelters.nearest_ids}}',
        capacity: '{{simulation.evacuated_population}}',
        purpose: 'volcano_evacuation',
      },
      timeout: 30,
    },
    timeout_seconds: 60,
    retry_count: 1,
    on_failure: 'CONTINUE',
  },
  {
    order: 11,
    action_type: 'CONDITIONAL_BRANCH',
    config: {
      condition: '{{incident.alert_level}} >= 4',
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
      target: 'BNPB',
      reason: 'Volcano alert level 4 (AWAS)',
      message: 'CRITICAL: Volcano {{incident.volcano_name}} at alert level 4. Full eruption imminent.',
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 13,
    action_type: 'UPDATE_STATUS',
    config: {
      status: 'COMPLETED',
      note: 'Volcano playbook execution completed',
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'CONTINUE',
  },
];

/**
 * Volcano Playbook Trigger
 */
export const VOLCANO_PLAYBOOK_TRIGGER: Omit<PlaybookTrigger, 'id'> = {
  event_type: 'INCIDENT_CREATED',
  condition_expression: "incident.type === 'VOLCANO' && parseInt(incident.alert_level) >= 3",
  cooldown_minutes: 30,
  is_active: true,
};

/**
 * Volcano Playbook Definition
 */
export const VOLCANO_PLAYBOOK: Omit<Playbook, 'id' | 'created_at' | 'updated_at'> = {
  name: 'Volcano Response Playbook',
  description: 'Standard volcano response playbook: alert→evacuate→ash_management→monitor',
  disaster_type: 'VOLCANO',
  status: 'ACTIVE',
  version: 1,
  steps: VOLCANO_PLAYBOOK_STEPS as PlaybookStep[],
  triggers: [VOLCANO_PLAYBOOK_TRIGGER as PlaybookTrigger],
};

/**
 * Get volcano playbook
 */
export function getVolcanoPlaybook(): Omit<Playbook, 'id' | 'created_at' | 'updated_at'> {
  return { ...VOLCANO_PLAYBOOK };
}