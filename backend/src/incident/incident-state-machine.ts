import { BadRequestException, ForbiddenException, ConflictException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import {
  IncidentWorkflowStatus,
  isValidTransition,
  isTerminalState,
  ON_ENTRY_HOOKS,
  ON_EXIT_HOOKS,
  TransitionContext,
} from './incident-states.config';
import { IncidentRepository } from './incident.repository';

// Forward declaration for dismissal cleanup
let fcmService: any = null;
let missionService: any = null;

/**
 * Set services for dismissal cleanup (injected from module)
 */
export function setDismissalServices(fcm: any, mission: any): void {
  fcmService = fcm;
  missionService = mission;
}

/**
 * Guard function type - returns reason if transition is blocked
 */
export type TransitionGuard = (
  incident: any,
  context: { userId: number; role: string }
) => string | null;

/**
 * Incident State Machine Engine
 * Handles state transitions with validation and side effects
 */
@Injectable()
export class IncidentStateMachine {
  constructor(
    private incidentRepository: IncidentRepository,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Execute state transition with validation
   */
  async transition(
    incidentId: number,
    targetStatus: IncidentWorkflowStatus,
    context: { userId: number; role: string; reason?: string }
  ): Promise<any> {
    // Get current incident
    const incident = await this.incidentRepository.findById(incidentId.toString(), false);
    if (!incident) {
      throw new BadRequestException('Incident not found');
    }

    const currentStatus = incident.status as IncidentWorkflowStatus;

    // Check if already in terminal state
    if (isTerminalState(currentStatus)) {
      throw new ConflictException(
        `Cannot transition from terminal state ${currentStatus}`
      );
    }

    // Validate transition is allowed
    if (!isValidTransition(currentStatus, targetStatus)) {
      throw new ConflictException(
        `Invalid transition from ${currentStatus} to ${targetStatus}. Allowed: ${[
          currentStatus,
        ].join(', ')}`
      );
    }

    // Execute guards before transition
    const guardReason = await this.executeGuards(incident, targetStatus, context);
    if (guardReason) {
      throw new ForbiddenException(guardReason);
    }

    // Execute onExit hook for current state
    await this.executeHook(
      ON_EXIT_HOOKS[currentStatus],
      incidentId.toString(),
      incident,
      context
    );

    // Update status in database
    const previousStatus = currentStatus;
    const updated = await this.incidentRepository.update(incidentId.toString(), {
      status: targetStatus,
    });

    // Record transition in audit log
    await this.incidentRepository.createStateTransition({
      incidentId: incidentId.toString(),
      from: previousStatus,
      to: targetStatus,
      triggeredBy: context.userId.toString(),
      reason: context.reason,
    });

    // Execute onEntry hook for new state
    await this.executeHook(
      ON_ENTRY_HOOKS[targetStatus],
      incidentId.toString(),
      updated,
      context
    );

    // Emit state change event
    this.eventEmitter.emit('incident.state-changed', {
      incidentId: incidentId.toString(),
      previousStatus,
      newStatus: targetStatus,
      triggeredBy: context.userId.toString(),
    });

    return {
      success: true,
      message: `Status changed from ${previousStatus} to ${targetStatus}`,
      data: {
        ...updated,
        previousStatus,
        currentStatus: targetStatus,
      },
    };
  }

  /**
   * Execute transition guards
   */
  private async executeGuards(
    incident: any,
    targetStatus: IncidentWorkflowStatus,
    context: { userId: number; role: string }
  ): Promise<string | null> {
    // Get guard for target state
    const guard = GUARDS[targetStatus];
    if (guard) {
      return guard(incident, context);
    }
    return null;
  }

  /**
   * Execute transition hook
   */
  private async executeHook(
    hook: ((incidentId: string, context: TransitionContext) => Promise<void> | void) | undefined,
    incidentId: string,
    incident: any,
    context: { userId: number; role: string; reason?: string }
  ): Promise<void> {
    if (!hook) return;

    const hookContext: TransitionContext = {
      incident: {
        id: incidentId,
        priority: incident.priority,
        disasterType: incident.disaster_type,
        regionId: incident.region,
      },
      triggeredBy: {
        userId: context.userId.toString(),
        role: context.role,
      },
    };

    await hook(incidentId, hookContext);
  }
}

/**
 * Transition guards for each target state
 * PRD Section 11.1 & 12.2 - Role-Based Access Control
 */
const GUARDS: Partial<Record<IncidentWorkflowStatus, TransitionGuard>> = {
  /**
   * I01: canVerify - REPORTED -> VERIFIED
   * Required Role: FIELD_STAFF, PCNU, PWNU, SUPER_ADMIN
   * Preconditions: Valid Central Java coordinates; basic info confirmed
   */
  [IncidentWorkflowStatus.VERIFIED]: (incident, context) => {
    const allowedRoles = [
      'FIELD_STAFF',
      'ADMIN_PCNU',
      'STAFF_PCNU',
      'ADMIN_PWNU',
      'PWNU',
      'STAFF_PWNU',
      'SUPER_ADMIN',
    ];
    if (!allowedRoles.includes(context.role)) {
      return 'Only field staff or PWNU/PCNU administrators can verify incidents';
    }
    // Validate coordinates are in Central Java bounds
    const location =
      typeof incident.location === 'string'
        ? JSON.parse(incident.location)
        : incident.location;
    if (location) {
      const { lat, lng } = location;
      // Central Java bounds: ~ -7.0 to -8.5 lat, 110-111.5 lng
      if (lat < -8.5 || lat > -7.0 || lng < 110 || lng > 111.5) {
        return 'Coordinates must be within Central Java region';
      }
    }
    return null;
  },

  /**
   * I02: canAssess - VERIFIED -> ASSESSED
   * Required Role: FIELD_STAFF, PCNU, PWNU, SUPER_ADMIN
   * Preconditions: All 6 dampak_* JSONB fields populated; priority_score calculated
   */
  [IncidentWorkflowStatus.ASSESSED]: (incident, context) => {
    const allowedRoles = [
      'FIELD_STAFF',
      'ADMIN_PCNU',
      'ADMIN_PWNU',
      'COMMANDER',
      'SUPER_ADMIN',
    ];
    if (!allowedRoles.includes(context.role)) {
      return 'Only field staff or commanders can assess incidents';
    }
    // Check all dampak_* fields are populated
    const dampakFields = [
      'dampak_human',
      'dampak_rumah',
      'dampak_fasilitas',
      'dampak_vital',
      'dampak_lingkungan',
      'dampak_kebutuhan',
    ];
    for (const field of dampakFields) {
      if (!incident[field]) {
        return `Assessment incomplete: ${field} must be populated`;
      }
    }
    // Check priority_score is calculated
    if (!incident.priority_score || incident.priority_score <= 0) {
      return 'Priority score must be calculated before assessment';
    }
    return null;
  },

  /**
   * I03: canCommand - ASSESSED -> COMMANDED
   * Required Role: PWNU, SUPER_ADMIN, COMMANDER
   * Preconditions: At least one incident_instructions (Surat Perintah) exists
   */
  [IncidentWorkflowStatus.COMMANDED]: (incident, context) => {
    const allowedRoles = [
      'COMMANDER',
      'ADMIN_PCNU',
      'ADMIN_PWNU',
      'PWNU',
      'SUPER_ADMIN',
    ];
    if (!allowedRoles.includes(context.role)) {
      return 'Only commanders can assign missions';
    }
    // Check incident_instructions exists
    if (!incident.incident_instructions || incident.incident_instructions.length === 0) {
      return 'Surat Perintah (incident instructions) must exist before commanding';
    }
    return null;
  },

  /**
   * I04: canAct - COMMANDED -> ACTION
   * Required Role: PWNU, SUPER_ADMIN
   * Preconditions: At least one incident_actions entry; Active volunteer check-in
   */
  [IncidentWorkflowStatus.ACTION]: (incident, context) => {
    const allowedRoles = ['ADMIN_PWNU', 'PWNU', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(context.role)) {
      return 'Only PWNU administrators can start action';
    }
    if (incident.status !== IncidentWorkflowStatus.COMMANDED) {
      return 'Incident must be in COMMANDED state before ACTION';
    }
    // Check incident_actions exists
    if (!incident.incident_actions || incident.incident_actions.length === 0) {
      return 'At least one incident action must be defined';
    }
    return null;
  },

  /**
   * I05: canComplete - ACTION -> COMPLETED
   * Required Role: PWNU, SUPER_ADMIN
   * Preconditions: All volunteer_deployments resolved; SITREP ready
   */
  [IncidentWorkflowStatus.COMPLETED]: (incident, context) => {
    const allowedRoles = ['ADMIN_PWNU', 'PWNU', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(context.role)) {
      return 'Only PWNU administrators can complete incidents';
    }
    if (incident.status !== IncidentWorkflowStatus.ACTION) {
      return 'Incident must be in ACTION state to be completed';
    }
    // Check all deployments are resolved (handled in service layer)
    return null;
  },

  /**
   * I06: canReject - Any -> REJECTED
   * Required Role: ADMIN_PWNU, ADMIN_PCNU, COMMANDER, SUPER_ADMIN
   * Preconditions: Mandatory note explaining reason
   */
  [IncidentWorkflowStatus.REJECTED]: (incident, context) => {
    const allowedRoles = [
      'ADMIN_PWNU',
      'ADMIN_PCNU',
      'COMMANDER',
      'SUPER_ADMIN',
    ];
    if (!allowedRoles.includes(context.role)) {
      return 'Only administrators can reject incidents';
    }
    return null;
  },

  /**
   * I06: canDismiss - Any -> DISMISSED
   * Required Role: ADMIN_PWNU, ADMIN_PCNU, COMMANDER, SUPER_ADMIN
   * Preconditions: Mandatory note explaining reason (spam, duplicate, hoax)
   */
  [IncidentWorkflowStatus.DISMISSED]: (incident, context) => {
    const allowedRoles = [
      'ADMIN_PWNU',
      'ADMIN_PCNU',
      'COMMANDER',
      'SUPER_ADMIN',
    ];
    if (!allowedRoles.includes(context.role)) {
      return 'Only administrators can dismiss incidents';
    }
    return null;
  },
};

/**
 * Check if user role can perform transition
 */
export function canRolePerformTransition(
  role: string,
  targetStatus: IncidentWorkflowStatus
): boolean {
  const guard = GUARDS[targetStatus];
  if (!guard) return true;
  return guard({ status: '' }, { userId: 0, role }) === null;
}