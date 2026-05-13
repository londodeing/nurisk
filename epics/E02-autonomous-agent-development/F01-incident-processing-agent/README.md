# F01 - Incident Processing Agent

**Feature Goal**: Automate incident categorization, scoring, and priority assignment

**Current Manual Process**:
- Incidents reported via /api/incidents or /api/reports
- Manual assessment and scoring
- Priority assignment based on damage assessment
- Status updates through workflow

**Agent Automation**:
- Auto-categorize disaster_type from description
- Calculate priority_score using AI scoring weights
- Assign priority_level (CRITICAL/HIGH/MEDIUM/LOW)
- Trigger notifications for high-priority incidents

**AI Scoring Weights** (from mainprd.md):
```js
const scoringWeights = {
  dampak_manusia: { deaths: 100, missing: 80, sick: 40, displaced: 30, affected: 10 },
  dampak_rumah: { heavy_damage: 50, medium_damage: 30, light_damage: 10 },
  dampak_fasum: { health_facilities: 60, worship_facilities: 20, schools: 25 },
  dampak_vital: { clean_water: 70, electricity: 50, telecom: 30, roads: 60 },
  dampak_lingkungan: { farmland: 5, livestock: 2 }
};
```

## Tasks:
- T01: Implement Incident Classification
- T02: Develop Priority Scoring Algorithm
- T03: Create Automated Workflow Triggers
- T04: Integrate with Notification System
