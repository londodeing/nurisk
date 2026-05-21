/**
 * Incident State Machine Configuration
 * PRD Section 11.1 - Incident lifecycle states
 *
 * States: REPORTED -> VERIFIED -> ASSESSED -> COMMANDED -> ACTION -> COMPLETED
 * Terminal: REJECTED, DISMISSED
 */

// Core incident workflow states (extended workflow beyond DB canonical)
export enum IncidentWorkflowStatus {
  REPORTED = 'REPORTED',
  VERIFIED = 'VERIFIED',
  ASSESSED = 'ASSESSED',
  COMMANDED = 'COMMANDED',
  ACTION = 'ACTION',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  DISMISSED = 'DISMISSED',
}

// Terminal states (immutable)
export const TERMINAL_STATES = new Set([
  IncidentWorkflowStatus.COMPLETED,
  IncidentWorkflowStatus.REJECTED,
  IncidentWorkflowStatus.DISMISSED,
]);

// Valid state transitions adjacency map
// Key: current state -> Value: allowed target states
export const VALID_TRANSITIONS: Record<IncidentWorkflowStatus, IncidentWorkflowStatus[]> = {
  [IncidentWorkflowStatus.REPORTED]: [
    IncidentWorkflowStatus.VERIFIED,
    IncidentWorkflowStatus.REJECTED,
    IncidentWorkflowStatus.DISMISSED,
  ],
  [IncidentWorkflowStatus.VERIFIED]: [
    IncidentWorkflowStatus.ASSESSED,
    IncidentWorkflowStatus.REJECTED,
    IncidentWorkflowStatus.DISMISSED,
  ],
  [IncidentWorkflowStatus.ASSESSED]: [
    IncidentWorkflowStatus.COMMANDED,
    IncidentWorkflowStatus.REJECTED,
    IncidentWorkflowStatus.DISMISSED,
  ],
  [IncidentWorkflowStatus.COMMANDED]: [
    IncidentWorkflowStatus.ACTION,
    IncidentWorkflowStatus.REJECTED,
    IncidentWorkflowStatus.DISMISSED,
  ],
  [IncidentWorkflowStatus.ACTION]: [
    IncidentWorkflowStatus.COMPLETED,
    IncidentWorkflowStatus.REJECTED,
    IncidentWorkflowStatus.DISMISSED,
  ],
  [IncidentWorkflowStatus.COMPLETED]: [],
  [IncidentWorkflowStatus.REJECTED]: [],
  [IncidentWorkflowStatus.DISMISSED]: [],
};

// Check if transition is valid
export function isValidTransition(
  from: IncidentWorkflowStatus,
  to: IncidentWorkflowStatus,
): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed?.includes(to) ?? false;
}

// Check if state is terminal
export function isTerminalState(status: IncidentWorkflowStatus): boolean {
  return TERMINAL_STATES.has(status);
}

// State display labels
export const STATUS_LABELS: Record<IncidentWorkflowStatus, string> = {
  [IncidentWorkflowStatus.REPORTED]: 'Dilaporkan',
  [IncidentWorkflowStatus.VERIFIED]: 'Diverifikasi',
  [IncidentWorkflowStatus.ASSESSED]: 'Dinilai',
  [IncidentWorkflowStatus.COMMANDED]: 'Ditetapkan',
  [IncidentWorkflowStatus.ACTION]: 'Ditindakan',
  [IncidentWorkflowStatus.COMPLETED]: 'Selesai',
  [IncidentWorkflowStatus.REJECTED]: 'Ditolak',
  [IncidentWorkflowStatus.DISMISSED]: 'Dismissed',
};

// State colors for UI
export const STATUS_COLORS: Record<IncidentWorkflowStatus, string> = {
  [IncidentWorkflowStatus.REPORTED]: '#FFA500',
  [IncidentWorkflowStatus.VERIFIED]: '#4169E1',
  [IncidentWorkflowStatus.ASSESSED]: '#9370DB',
  [IncidentWorkflowStatus.COMMANDED]: '#DC143C',
  [IncidentWorkflowStatus.ACTION]: '#FF4500',
  [IncidentWorkflowStatus.COMPLETED]: '#228B22',
  [IncidentWorkflowStatus.REJECTED]: '#808080',
  [IncidentWorkflowStatus.DISMISSED]: '#A9A9A9',
};

// Side-effect hooks for state transitions
export type TransitionHook = (incidentId: string, context: TransitionContext) => Promise<void> | void;

export interface TransitionContext {
  incident: {
    id: string;
    priority: number;
    disasterType: string;
    regionId: string;
  };
  triggeredBy: {
    userId: string;
    role: string;
  };
  metadata?: Record<string, unknown>;
}

// onEntry hooks - executed when entering a state
export const ON_ENTRY_HOOKS: Partial<Record<IncidentWorkflowStatus, TransitionHook>> = {
  [IncidentWorkflowStatus.VERIFIED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} verified by ${context.triggeredBy.userId}`);
  },
  [IncidentWorkflowStatus.ASSESSED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} assessed by ${context.triggeredBy.userId}`);
  },
  [IncidentWorkflowStatus.COMMANDED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} commanded by ${context.triggeredBy.userId}`);
  },
  [IncidentWorkflowStatus.ACTION]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} in action phase`);
  },
  [IncidentWorkflowStatus.COMPLETED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} completed`);
  },
  [IncidentWorkflowStatus.REJECTED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} rejected by ${context.triggeredBy.userId}`);
  },
  [IncidentWorkflowStatus.DISMISSED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} dismissed by ${context.triggeredBy.userId}`);
    console.log(`[StateMachine] - Cancelling pending missions`);
    console.log(`[StateMachine] - Sending FCM notifications to volunteers`);
    console.log(`[StateMachine] - Logging dismissal in incident_logs`);
    console.log(`[StateMachine] - Emitting incident.dismissed event`);
  },
};

// onExit hooks - executed when exiting a state
export const ON_EXIT_HOOKS: Partial<Record<IncidentWorkflowStatus, TransitionHook>> = {
  [IncidentWorkflowStatus.REPORTED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} leaving REPORTED state`);
  },
  [IncidentWorkflowStatus.VERIFIED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} leaving VERIFIED state`);
  },
  [IncidentWorkflowStatus.ASSESSED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} leaving ASSESSED state`);
  },
  [IncidentWorkflowStatus.COMMANDED]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} leaving COMMANDED state`);
  },
  [IncidentWorkflowStatus.ACTION]: async (incidentId, context) => {
    console.log(`[StateMachine] Incident ${incidentId} leaving ACTION state`);
  },
};