# Schema Diff Report

**Date:** May 15, 2026
**Compared:** `schema.prisma` vs Database (introspected)

---

## Summary

| Source | Table Count |
|--------|------------|
| schema.prisma | 55 models |
| Database | 41 tables |
| **Difference** | 14 extra models in schema.prisma |

---

## Missing Tables (in DB, defined in schema.prisma)

These tables exist in schema.prisma but NOT in the database:

1. `UserSession` - Session management
2. `Mission` - Mission tracking
3. `LogisticsItem` - Logistics items
4. `Fulfillment` - Fulfillment records
5. `CheckIn` - Volunteer check-in
6. `ChatParticipant` - Chat participants
7. `DisasterLearningExtended` - Extended disaster learning
8. `IntelReport` - Intelligence reports
9. `NewsItem` - News items
10. `ScrapedSource` - Scraped sources
11. `AnalyticsEvent` - Analytics events
12. `DashboardKPISnapshot` - Dashboard KPI snapshots
13. `Instruction` - Instructions
14. `Playbook` / `PlaybookStep` / `PlaybookExecution` - Playbook system
15. `EscalationRule` / `EscalationTimer` - Escalation system
16. `RuleDefinition` - Rule definitions
17. `AgentRun` / `AgentDecision` / `AgentAuditLog` - Agent system
18. `ScoredEvent` / `Prediction` / `Forecast` - ML models
19. `TrustScore` - Trust scoring
20. `SourceReliability` - Source reliability
21. `VerificationResult` - Verification results
22. `Region` - Regions
23. `Zone` - Zones
24. `EvacuationRoute` - Evacuation routes
25. `FederationNode` - Federation nodes
26. `SyncLog` - Sync logs
27. `WebhookSubscription` - Webhook subscriptions
28. `PiiAudit` - PII audit logs

---

## Extra Tables (in DB, NOT in schema.prisma)

These tables exist in the database but NOT defined in schema.prisma:

1. `assessments` - Damage assessments
2. `attachments` - File attachments
3. `deployments` - Volunteer deployments
4. `incident_actions` - Incident actions
5. `incident_evidence` - Incident evidence
6. `incident_logs` - Incident status logs
7. `incident_media` - Incident media files
8. `incident_resources` - Incident resources
9. `incident_skill_requirements` - Skill requirements
10. `master_incidents` - Master incidents
11. `volunteer_details` - Volunteer details
12. `volunteer_locations` - Volunteer locations

---

## Naming Differences

| schema.prisma | Database |
|--------------|----------|
| `Asset` | `asset_inventories` |
| `IncidentAction` | `incident_actions` |
| `ChatConversation` | `chat_conversations` |
| `ChatMessage` | `chat_messages` |
| `BuildingAssessment` | `building_assessments` |
| `VolunteerDeployment` | `volunteer_deployments` |
| `VolunteerSchedule` | `volunteer_schedules` |
| `VolunteerPerformance` | `volunteer_performance` |
| `VolunteerDevice` | `volunteer_devices` |
| `TeamMessage` | `team_messages` |
| `IntelNews` | `intel_news` |
| `DisasterLearning` | `disaster_learning` |
| `HistoricalDisaster` | `historical_disasters` |
| `LogisticsRequest` | `logistics_requests` |

---

## Recommendations

1. **Add missing tables to database** - Run migrations for missing models
2. **Update schema.prisma** - Add missing database tables to schema
3. **Sync naming** - Consider renaming models to match DB conventions
4. **Review deprecated** - Some models may be unused (Agent*, Playbook*, Forecast*, etc.)

---

## Action Items

- [ ] Run `npx prisma migrate dev` to add missing tables
- [ ] Verify which missing models are still needed
- [ ] Clean up unused models from schema.prisma