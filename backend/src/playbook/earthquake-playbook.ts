/**
 * Earthquake Playbook Definition
 * ==========================
 * Pre-defined earthquake response playbook
 */

import { Playbook, PlaybookStep, PlaybookTrigger } from './models';

/**
 * Earthquake Playbook Steps
 */
export const EARTHQUAKE_PLAYBOOK_STEPS: Omit<PlaybookStep, 'id'>[] = [
  {
    order: 1,
    action_type: 'NOTIFY',
    config: {
      title: 'Earthquake Alert - {{incident.location}}',
      message: 'M{{incident.magnitude}} earthquake at {{incident.location}}. Depth: {{incident.depth}}km. Tsunami potential: {{incident.tsunami_warning}}',
      recipients: ['supervisor', 'volunteers', 'bnpb'],
      channels: ['push', 'sms', 'broadcast'],
      priority: 'HIGH',
    },
    timeout_seconds: 60,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 2,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.bmkg}}/shake-map',
      method: 'POST',
      body: {
        magnitude: '{{incident.magnitude}}',
        depth_km: '{{incident.depth}}',
        epicenter_lat: '{{incident.lat}}',
        epicenter_lng: '{{incident.lng}}',
      },
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
      url: '{{services.simulation}}/earthquake/damage',
      method: 'POST',
      body: {
        magnitude: '{{incident.magnitude}}',
        depth_km: '{{incident.depth}}',
        location: '{{incident.location}}',
        building_density: '{{incident.building_density}}',
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
      title: 'Structural Assessment - {{incident.location}}',
      description: 'Assess building damage in MMI intensity zones VII-X. Estimated damaged structures: {{simulation.damaged_buildings}}',
      task_type: 'structural_assessment',
      priority: 'CRITICAL',
      required_skills: ['structural_engineering', 'first_aid'],
      area: '{{shakemap.affected_area}}',
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 5,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Search and Rescue - {{incident.location}}',
      description: 'Deploy SAR teams to collapsed building locations. Priority: {{simulation.collapsed_buildings}} structures',
      task_type: 'search_rescue',
      priority: 'CRITICAL',
      required_skills: ['sar', 'heavy_rescue', 'first_aid'],
      teams_needed: '{{simulation.sar_teams_needed}}',
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 6,
    action_type: 'ASSIGN_VOLUNTEER',
    config: {
      task_id: '{{tasks.search_rescue}}',
      max_distance_km: 100,
      required_skills: ['sar', 'heavy_rescue'],
      status: 'assigned',
    },
    timeout_seconds: 300,
    retry_count: 3,
    on_failure: 'ESCALATE',
  },
  {
    order: 7,
    action_type: 'CREATE_TASK',
    config: {
      title: 'Medical Triage - {{incident.location}}',
      description: 'Setup field hospital and triage area. Estimated injuries: {{simulation.injuries}}',
      task_type: 'medical',
      priority: 'CRITICAL',
      required_skills: ['medical', 'first_aid'],
      triage_level: 'field',
    },
    timeout_seconds: 120,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 8,
    action_type: 'HTTP_REQUEST',
    config: {
      url: '{{services.hospital}}/triage-setup',
      method: 'POST',
      body: {
        location: '{{incident.location}}',
        estimated_injuries: '{{simulation.injuries}}',
        trauma_level: '{{simulation.trauma_level}}',
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
      title: 'Shelter Setup - {{incident.region}}',
      description: 'Open emergency shelters for earthquake displaced. Capacity needed: {{simulation.displaced_population}}',
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
    action_type: 'SEND_BROADCAST',
    config: {
      title: 'Earthquake Safety Advisory',
      message: 'M{{incident.magnitude}} earthquake reported. Check for structural damage before entering buildings. Shelter locations: {{shelters.nearest}}',
      target_area: '{{shakemap.affected_area}}',
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
      condition: '{{incident.tsunami_warning}} === true',
      true_branch: 12,
      false_branch: 13,
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'STOP',
  },
  {
    order: 12,
    action_type: 'SEND_BROADCAST',
    config: {
      title: 'TSUNAMI WARNING',
      message: 'TSUNAMI WARNING for {{incident.location}}. Evacuate immediately to high ground. Do not return to coastal areas.',
      target_area: '{{incident.coastal_area}}',
      channels: ['sms', 'push', 'broadcast', 'siren'],
      priority: 'CRITICAL',
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
      note: 'Earthquake playbook execution completed',
    },
    timeout_seconds: 30,
    retry_count: 0,
    on_failure: 'CONTINUE',
  },
];

/**
 * Earthquake Playbook Trigger
 */
export const EARTHQUAKE_PLAYBOOK_TRIGGER: Omit<PlaybookTrigger, 'id'> = {
  event_type: 'INCIDENT_CREATED',
  condition_expression: "incident.type === 'EARTHQUAKE' && parseFloat(incident.magnitude) >= 4.5",
  cooldown_minutes: 60,
  is_active: true,
};

/**
 * Earthquake Playbook Definition
 */
export const EARTHQUAKE_PLAYBOOK: Omit<Playbook, 'id' | 'created_at' | 'updated_at'> = {
  name: 'Earthquake Response Playbook',
  description: 'Standard earthquake response playbook: alert→assess→search_rescue→medical→shelter',
  disaster_type: 'EARTHQUAKE',
  status: 'ACTIVE',
  version: 1,
  steps: EARTHQUAKE_PLAYBOOK_STEPS as PlaybookStep[],
  triggers: [EARTHQUAKE_PLAYBOOK_TRIGGER as PlaybookTrigger],
};

/**
 * Get earthquake playbook
 */
export function getEarthquakePlaybook(): Omit<Playbook, 'id' | 'created_at' | 'updated_at'> {
  return { ...EARTHQUAKE_PLAYBOOK };
}