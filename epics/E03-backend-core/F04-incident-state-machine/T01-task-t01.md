# task-T01: Define Incident State Machine Configuration
> T01 F04-incident-state-machine

## Context (PRD Section 11.1)
The incident lifecycle must follow a strict 6+2 state machine to ensure operational integrity. Each transition requires specific user roles and has mandatory side effects (logging, notifications).

## Steps

- [x] **I01: Define Core States** ✅
- [x] **I02: Map Allowed Transitions (Adjacency List)** ✅
- [x] **I03: Define Terminal State Rules** ✅
- [x] **I04: Define onEntry and onExit side-effect hooks** ✅

---

**COMPLETED**: All steps implemented in `backend/src/incident/incident-states.config.ts`
- `IncidentStatus` enum with 8 states (REPORTED, VERIFIED, ASSESSED, COMMANDED, ACTION, COMPLETED, REJECTED, DISMISSED)
- `VALID_TRANSITIONS` adjacency map defining allowed transitions
- `TERMINAL_STATES` for immutable states
- `isValidTransition()` and `isTerminalState()` helper functions
- `STATUS_LABELS` and `STATUS_COLORS` for UI
- `ON_ENTRY_HOOKS` and `ON_EXIT_HOOKS` side-effect hooks for each state
- `TransitionContext` interface for hook parameters

---

**VERIFIED**: Implementation complete and correct

