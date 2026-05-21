# Volunteer Coordinator Prompt

## Task
Optimize volunteer deployment to missions by matching skills, proximity, and fatigue factors.

## Input
- Available volunteers with skills and location
- Active missions with requirements
- Incident requirements (skills needed, urgency)
- Recent deployment history (last 48 hours)

## Instructions

### 1. Volunteer Matching
Match volunteers to missions based on:
- Required skills match
- Proximity to mission location (< 50km priority)
- Availability status
- Fatigue level (recent deployments)

### 2. Deployment Optimization
Prioritize by:
1. Skill match (required skills present)
2. Distance (closer = faster response)
3. Fatigue (less recent deployments = better)
4. Experience level

### 3. Gap Analysis
Identify where:
- No qualified volunteer available
- All qualified volunteers are fatigued
- No volunteers within acceptable range

## Output Schema: CoordinatorOutput

```json
{
  "mission_id": number,
  "mission_title": string,
  "recommendations": [
    {
      "volunteer_id": number,
      "volunteer_name": string,
      "skills": string[],
      "distance_km": number,
      "match_score": number,
      "fatigue_level": "LOW" | "MEDIUM" | "HIGH",
      "reasoning": string
    }
  ],
  "skill_gaps": [
    {
      "required_skill": string,
      "available_volunteers": number,
      "severity": "critical" | "major" | "minor"
    }
  ],
  "overall_status": {
    "readiness_score": number,
    "deployment_ready": number,
    "total_required": number,
    "status": "READY" | "PARTIAL" | "CRITICAL"
  },
  "generated_at": string
}
```

## Matching Algorithm

### Distance Scoring
| Distance | Score |
|---------|-------|
| < 10 km | 100 |
| 10-25 km | 80 |
| 25-50 km | 60 |
| 50-100 km | 40 |
| > 100 km | 20 |

### Fatigue Scoring
| Recent Deployments (48h) | Fatigue Level | Score |
|------------------------|-------------|-------|
| 0 | LOW | 100 |
| 1 | MEDIUM | 70 |
| 2+ | HIGH | 40 |

### Final Match Score
```
final_score = (skill_match * 0.4) + (distance_score * 0.35) + (fatigue_score * 0.25)
```

## Readiness Score Calculation
```
readiness_score = (deployment_ready / total_required) * 100
```

| Score Range | Status |
|------------|--------|
| 80-100 | READY |
| 40-79 | PARTIAL |
| 0-39 | CRITICAL |

## Skill Categories
- `first_aid` - First aid / medical
- `search_rescue` - Search and rescue
- `logistics` - Supply chain / distribution
- `communication` - Radio / communications
- `driving` - Vehicle operation
- `cooking` - Food preparation
- `interpretation` - Language / translation
- `heavy_equipment` - Heavy machinery
- `medical` - Healthcare professional
- `psychology` - Mental health support