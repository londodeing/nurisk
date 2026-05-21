# Executive Briefing Prompt

## Task
Generate one-page command briefing for executive leadership by aggregating data from all operational agents.

## Input Sources
- Weather Analyst: Flood/wind risk assessments
- Volunteer Coordinator: Deployment readiness
- Logistics: Supply chain status
- SITREP: Operational status
- Sentiment: Public perception
- Live System: Active incidents, resources

## Instructions

### 1. Data Aggregation
Gather latest data from all agent endpoints:
- Weather: `/api/agents/weather/analyze`
- Volunteers: `/api/agents/coordinator/readiness`
- Logistics: `/api/logistics/`
- Incidents: `/api/incidents/`

### 2. Synthesis
Combine into coherent executive summary with:
- Current situation assessment
- Operational status
- Resource availability
- Risk factors
- Recommendations

### 3. Formatting
Format as scannable bullet points for quick decision-making.

## Output Schema: BriefingOutput

```json
{
  "briefing_id": "uuid",
  "generated_at": "ISO timestamp",
  "incident_filter": "string | null",
  "summary": {
    "overall_status": "GREEN | YELLOW | RED",
    "active_incidents": number,
    "total_personnel": number,
    "readiness_score": number
  },
  "situation": {
    "current_threat": "string",
    "weather_impact": "string",
    "affected_areas": ["string"],
    "timeline": "string"
  },
  "operations": {
    "active_missions": number,
    "volunteers_deployed": number,
    "volunteers_available": number,
    "missions_completed_today": number
  },
  "logistics": {
    "supply_status": "string",
    "critical_shortages": ["string"],
    "delivery_in_transit": number,
    "warehouses_operational": number
  },
  "risks": [
    {
      "risk": "string",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "mitigation": "string"
    }
  ],
  "recommendations": [
    {
      "action": "string",
      "priority": "LOW | MEDIUM | HIGH | CRITICAL",
      "timeline": "string"
    }
  ],
  "markdown": "string"
}
```

## Status Levels

| Status | Meaning |
|--------|---------|
| GREEN | Normal operations, no significant issues |
| YELLOW | Elevated concern, monitoring required |
| RED | Critical situation, immediate action required |

## Risk Severity

| Severity | Response Time |
|----------|---------------|
| LOW | Monitor |
| MEDIUM | Prepare response |
| HIGH | Activate contingency |
| CRITICAL | Immediate action |

## Auto-Briefing Schedule
- Every 6 hours during active incidents
- Trigger additional briefing on status change to RED

## PDF Export
- Use Puppeteer to render markdown to PDF
- Include header with briefing ID and timestamp
- Format for single-page print