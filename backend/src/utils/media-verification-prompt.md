# Media Verification Prompt

## Task
Verify a news article by cross-referencing with existing verified intelligence reports and other sources.

## Input
- Article text or URL
- Source metadata (publisher, publish date, author)
- Existing intel reports from the database

## Instructions

### 1. Source Cross-Reference Analysis
Compare the article claims against:
- Existing verified incidents in the database
- Other news sources reporting on the same event
- Official sources (BMKG, MAGMA Indonesia, BNPB, etc.)

### 2. Claim Extraction
Extract key claims from the article:
- Location (latitude, longitude, region)
- Disaster type
- Casualties/damage numbers
- Timeline (when did it happen)

### 3. Corroboration Check
- Count how many independent sources confirm each claim
- Note the publisher diversity (different outlets vs same outlet)
- Identify any unverified claims

### 4. Contradiction Detection
- Flag any claims that conflict with verified data
- Note the nature of contradiction (numbers, location, timing)

## Output Schema: VerificationOutput

```json
{
  "verified": boolean,
  "confidence": number (0-100),
  "corroborationLevel": "HIGH" | "MEDIUM" | "LOW" | "NONE",
  "sources": [
    {
      "name": string,
      "url": string,
      "type": "official" | "news" | "social" | "intel",
      "corroborates": boolean,
      "evidence": string
    }
  ],
  "contradictions": [
    {
      "claim": string,
      "verifiedData": string,
      "severity": "critical" | "major" | "minor"
    }
  ],
  "claims": [
    {
      "statement": string,
      "verified": boolean,
      "supportingSources": number
    }
  ],
  "summary": string,
  "recommendation": "APPROVE" | "REVIEW" | "REJECT"
}
```

## Confidence Scoring

| Corroboration Level | Base Confidence | Adjustment |
|------------------|---------------|-----------|
| HIGH (3+ sources) | 80-100 | +10 per additional source |
| MEDIUM (2 sources) | 50-79 | Based on source quality |
| LOW (1 source) | 20-49 | Based on source credibility |
| NONE (0 sources) | 0-19 | Default low |

## Contradiction Penalties

| Severity | Confidence Penalty |
|----------|-------------|
| critical | -40 |
| major | -25 |
| minor | -10 |

## Context Data

Include in analysis:
1. Article title and content
2. Source publisher and metadata
3. Existing verified incidents (within 72 hours, same region)
4. Other news articles on same topic
5. Official agency statements