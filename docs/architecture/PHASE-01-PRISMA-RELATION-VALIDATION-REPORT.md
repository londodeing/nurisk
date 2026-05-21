# PHASE-01: Prisma Relation Validation Report

**Task:** PRISMA-RELATION-VALIDATION  
**Status:** ✅ COMPLETED  
**Date:** 2026-05-19  
**Owner:** @nurisk/backend-team  

---

## Executive Summary

Audited all relations (foreign keys) and indexes in the Prisma schema. The schema is **well-structured** with proper relational integrity, composite indexes for common query patterns, and appropriate indexing strategy including PostGIS GiST indexes.

---

## Relation Inventory

### Total Statistics

| Metric | Count |
|--------|-------|
| Total Models | 65+ |
| Total Relations | 80+ |
| One-to-One Relations | 2 |
| One-to-Many Relations | 78+ |
| Self-Referential Relations | 1 (Region hierarchy) |
| Unique Constraints | 3 |

---

## Relation Analysis by Category

### 1. User & Authentication Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| User | volunteer | Volunteer.userId | One-to-One (optional) | ✅ |
| User | auditLogs | AuditLog.actorId | One-to-Many | ✅ |
| User | notifications | Notification.userId | One-to-Many | ✅ |
| User | chatMessages | ChatMessage.senderId | One-to-Many | ✅ |
| User | UserSession | UserSession.userId | One-to-Many | ✅ |
| User | ChatParticipant | ChatParticipant.userId | One-to-Many | ✅ |
| User | TeamMessage | TeamMessage.senderId | One-to-Many | ✅ |
| User | VerificationResult | VerificationResult.reviewerId | One-to-Many | ✅ |
| User | PiiAudit | PiiAudit.actorId | One-to-Many | ✅ |

**Analysis:** User is a central hub with 9 relation paths. Proper indexing on userId fields ensures efficient queries.

---

### 2. Volunteer Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| Volunteer | user | User.id | Many-to-One | ✅ |
| Volunteer | deployments | VolunteerDeployment.volunteerId | One-to-Many | ✅ |
| Volunteer | schedules | VolunteerSchedule.volunteerId | One-to-Many | ✅ |
| Volunteer | performance | VolunteerPerformance.volunteerId | One-to-Many | ✅ |
| Volunteer | devices | VolunteerDevice.volunteerId | One-to-Many | ✅ |
| Volunteer | AssetTransaction | AssetTransaction.volunteerId | One-to-Many | ✅ |
| Volunteer | Mission | Mission.leaderId | One-to-Many | ✅ |
| Volunteer | CheckIn | CheckIn.volunteerId | One-to-Many | ✅ |
| Volunteer | Certification | Certification.volunteerId | One-to-Many | ✅ |

**Analysis:** Volunteer has extensive relations covering the volunteer lifecycle. All foreign keys properly indexed.

---

### 3. Incident Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| Incident | creator | User.id | Many-to-One (optional) | ✅ |
| Incident | actions | IncidentAction.incidentId | One-to-Many | ✅ |
| Incident | instructions | IncidentInstruction.incidentId | One-to-Many | ✅ |
| Incident | logs | IncidentLog.incidentId | One-to-Many | ✅ |
| Incident | logisticsRequests | LogisticsRequest.incidentId | One-to-Many | ✅ |
| Incident | deployments | VolunteerDeployment.incidentId | One-to-Many | ✅ |
| Incident | assessments | BuildingAssessment.incidentId | One-to-Many | ✅ |
| Incident | volunteerPerformance | VolunteerPerformance.incidentId | One-to-Many | ✅ |
| Incident | Shelter | Shelter.incidentId | One-to-Many | ✅ |
| Incident | AssetTransaction | AssetTransaction.incidentId | One-to-Many | ✅ |
| Incident | Notification | Notification.incidentId | One-to-Many | ✅ |
| Incident | ChatConversation | ChatConversation.incidentId | One-to-Many | ✅ |
| Incident | Mission | Mission.incidentId | One-to-Many | ✅ |
| Incident | IntelReport | IntelReport.relatedIncidentId | One-to-Many | ✅ |
| Incident | NewsItem | NewsItem.relatedIncidentId | One-to-Many | ✅ |
| Incident | Instruction | Instruction.incidentId | One-to-Many | ✅ |
| Incident | PlaybookExecution | PlaybookExecution.incidentId | One-to-Many | ✅ |
| Incident | EscalationRule | EscalationRule.incidentId | One-to-Many | ✅ |
| Incident | EscalationTimer | EscalationTimer.incidentId | One-to-Many | ✅ |
| Incident | AgentRun | AgentRun.incidentId | One-to-Many | ✅ |
| Incident | ScoredEvent | ScoredEvent.incidentId | One-to-Many | ✅ |
| Incident | Prediction | Prediction.incidentId | One-to-Many | ✅ |
| Incident | EvacuationRoute | EvacuationRoute.incidentId | One-to-Many | ✅ |
| Incident | VerificationResult | VerificationResult.relatedIncidentId | One-to-Many | ✅ |

**Analysis:** Incident is the central entity with 24 relation paths. Comprehensive indexing on incidentId ensures efficient joins.

---

### 4. Logistics Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| LogisticsRequest | incident | Incident.id | Many-to-One | ✅ |
| LogisticsRequest | LogisticsItem | LogisticsItem.requestId | One-to-Many | ✅ |
| LogisticsItem | request | LogisticsRequest.id | Many-to-One | ✅ |
| LogisticsItem | fulfillments | Fulfillment.itemId | One-to-Many | ✅ |
| Fulfillment | item | LogisticsItem.id | Many-to-One | ✅ |
| Fulfillment | warehouse | Warehouse.id | Many-to-One (optional) | ✅ |

**Analysis:** Proper hierarchical structure: Request → Items → Fulfillments

---

### 5. Inventory Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| Asset | warehouse | Warehouse.id | Many-to-One (optional) | ✅ |
| Asset | transactions | AssetTransaction.assetId | One-to-Many | ✅ |
| AssetTransaction | asset | Asset.id | Many-to-One | ✅ |
| AssetTransaction | incident | Incident.id | Many-to-One (optional) | ✅ |
| AssetTransaction | volunteer | Volunteer.id | Many-to-One (optional) | ✅ |
| AssetTransaction | toWarehouse | Warehouse.id | Many-to-One (optional) | ✅ |
| Warehouse | Asset | Asset.warehouseId | One-to-Many | �� |
| Warehouse | AssetTransaction | AssetTransaction.toWarehouseId | One-to-Many | ✅ |
| Warehouse | Fulfillment | Fulfillment.warehouseId | One-to-Many | ✅ |

**Analysis:** Asset transactions support multi-warehouse transfers with proper foreign key paths.

---

### 6. Chat Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| ChatConversation | incident | Incident.id | Many-to-One (optional) | ✅ |
| ChatConversation | ChatParticipant | ChatParticipant.conversationId | One-to-Many | ✅ |
| ChatConversation | ChatMessage | ChatMessage.conversationId | One-to-Many | ✅ |
| ChatParticipant | conversation | ChatConversation.id | Many-to-One | ✅ |
| ChatParticipant | user | User.id | Many-to-One | ✅ |
| ChatMessage | conversation | ChatConversation.id | Many-to-One | ✅ |
| ChatMessage | sender | User.id | Many-to-One | ✅ |

**Analysis:** Proper composite unique constraint on (conversationId, userId) for ChatParticipant.

---

### 7. Mission & Deployment Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| Mission | incident | Incident.id | Many-to-One (optional) | ✅ |
| Mission | leader | Volunteer.id | Many-to-One (optional) | ✅ |
| Mission | deployments | VolunteerDeployment.missionId | One-to-Many | ✅ |
| VolunteerDeployment | volunteer | Volunteer.id | Many-to-One | ✅ |
| VolunteerDeployment | incident | Incident.id | Many-to-One | ✅ |
| VolunteerDeployment | mission | Mission.id | Many-to-One (optional) | ✅ |
| VolunteerDeployment | checkIns | CheckIn.deploymentId | One-to-Many | ✅ |
| CheckIn | deployment | VolunteerDeployment.id | Many-to-One | ✅ |
| CheckIn | volunteer | Volunteer.id | Many-to-One | ✅ |

**Analysis:** Mission → Deployment → CheckIn hierarchy properly modeled.

---

### 8. Playbook & Automation Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| Playbook | steps | PlaybookStep.playbookId | One-to-Many | ✅ |
| Playbook | executions | PlaybookExecution.playbookId | One-to-Many | ✅ |
| PlaybookStep | playbook | Playbook.id | Many-to-One | ✅ |
| PlaybookExecution | playbook | Playbook.id | Many-to-One | ✅ |
| PlaybookExecution | incident | Incident.id | Many-to-One | ✅ |

**Analysis:** Playbook → Steps → Executions chain properly modeled.

---

### 9. Escalation Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| EscalationRule | incident | Incident.id | Many-to-One (optional) | ✅ |
| EscalationRule | timers | EscalationTimer.ruleId | One-to-Many | ✅ |
| EscalationTimer | rule | EscalationRule.id | Many-to-One | ✅ |
| EscalationTimer | incident | Incident.id | Many-to-One | ✅ |

**Analysis:** Rule → Timer hierarchy for escalation tracking.

---

### 10. AI/ML Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| AgentRun | incident | Incident.id | Many-to-One (optional) | ✅ |
| AgentRun | decisions | AgentDecision.agentRunId | One-to-Many | ✅ |
| AgentRun | auditLogs | AgentAuditLog.agentRunId | One-to-Many | ✅ |
| AgentDecision | agentRun | AgentRun.id | Many-to-One | ✅ |
| AgentAuditLog | agentRun | AgentRun.id | Many-to-One | ✅ |

**Analysis:** Agent run tracking with decision and audit trails.

---

### 11. Region Hierarchy (Self-Referential)

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| Region | parent | Region.id | Many-to-One (self-ref) | ✅ |
| Region | children | Region.parentId | One-to-Many (self-ref) | ✅ |
| Region | Zone | Zone.regionId | One-to-Many | ✅ |

**Analysis:** Proper self-referential relation for hierarchical region structure.

---

### 12. Federation Relations

| Model | Field | References | Type | Compliant |
|-------|-------|------------|------|-----------|
| FederationNode | syncLogs | SyncLog.nodeId | One-to-Many | ✅ |
| FederationNode | webhookSubscriptions | WebhookSubscription.nodeId | One-to-Many | ✅ |
| SyncLog | node | FederationNode.id | Many-to-One | ✅ |
| WebhookSubscription | node | FederationNode.id | Many-to-One | ✅ |

**Analysis:** Federation node management properly modeled.

---

## Index Analysis

### Index Coverage Assessment

| Category | Index Count | Coverage |
|----------|-------------|----------|
| Foreign Keys | 80+ | ✅ All indexed |
| Unique Constraints | 3 | �� All indexed |
| Composite Indexes | 15+ | ✅ Strategic |
| GiST (Spatial) Indexes | 15+ | ✅ PostGIS optimized |

### Strategic Composite Indexes

| Index | Purpose | Compliant |
|-------|---------|-----------|
| `[priorityScore, status]` | Incident triage queries | ✅ |
| `[region, category]` | Asset filtering | ✅ |
| `[incidentId, createdAt]` | Transaction history | ✅ |
| `[volunteerId, status]` | Deployment status | ✅ |
| `[volunteerId, date]` | Schedule lookup | ✅ |
| `[eventType, eventTime]` | Analytics queries | ✅ |
| `[snapshotDate, period]` | KPI snapshots | ✅ |
| `[isActive, priority]` | Rule engine matching | ✅ |
| `[triggerEvent, isActive]` | Event-driven rules | ✅ |
| `[incidentId, status]` | Active escalations | ✅ |
| `[playbookId, stepOrder]` | Playbook sequencing | ✅ |
| `[agentRunId, decisionType]` | Decision audit | ✅ |
| `[eventType, score]` | ML scoring | ✅ |
| `[forecastType, region]` | Regional forecasts | ✅ |
| `[entityType, overallScore]` | Trust ranking | ✅ |

### PostGIS GiST Indexes

| Table | Column | Index | Compliant |
|-------|--------|-------|-----------|
| Volunteer | location | GiST | ✅ |
| Incident | location | GiST | ✅ |
| Shelter | location | GiST | ✅ |
| Warehouse | location | GiST | ✅ |
| Asset | location | GiST | ✅ |
| HistoricalDisaster | location | GiST | ✅ |
| Report | location | GiST | ✅ |
| Mission | location | GiST | ✅ |
| VolunteerDeployment | checkInLocation | GiST | ✅ |
| CheckIn | location | GiST | ✅ |
| BuildingAssessment | location | GiST | ✅ |
| CommandPost | location | GiST | ✅ |
| IntelReport | location | GiST | ✅ |
| Region | coverageArea | GiST | ✅ |
| Zone | coverageArea | GiST | ✅ |
| EvacuationRoute | route | GiST | ✅ |
| Shelter | (incidentId, location) | Composite GiST | ✅ |
| Incident | (status, location) | Composite GiST | ✅ |

---

## Findings

### ✅ Compliant Areas

1. **Foreign Key Integrity:** All relations have proper foreign key constraints
2. **Index Coverage:** Every foreign key is indexed for efficient joins
3. **Composite Indexes:** Strategic composites for common query patterns
4. **Spatial Indexing:** All PostGIS geography columns have GiST indexes
5. **Unique Constraints:** Proper unique constraints on natural keys
6. **Self-Referential Relations:** Region hierarchy properly modeled
7. **Optional Relations:** Nullable foreign keys correctly marked with `?`

### ⚠️ Observations (Non-Blocking)

1. **No Partial Indexes:** Some low-cardinality fields (status, type) could benefit from partial indexes in high-volume scenarios.

2. **Missing Covering Indexes:** Some indexes could include additional columns for index-only scans.

3. **No Index on `deletedAt`:** Soft-delete filtering queries may benefit from partial indexes on `WHERE deletedAt IS NULL`.

---

## Recommendations

### Immediate Actions (Optional)

None required - schema is well-optimized.

### Future Improvements (PHASE-08+)

1. **Add Partial Indexes for Soft Deletes:**
   ```prisma
   @@index([status]) //覆盖 WHERE deletedAt IS NULL
   ```

2. **Consider Covering Indexes:**
   ```prisma
   @@index([incidentId, createdAt, type]) // Include type for covering
   ```

3. **Add Index Hints in Comments:**
   ```prisma
   // Index: [status, location] - GiST for geofencing queries
   ```

---

## Verification Commands

```bash
# Validate Prisma schema
cd backend && npx prisma validate

# Generate Prisma client
cd backend && npx prisma generate

# Check relation consistency
grep -n "@relation" backend/prisma/schema.prisma | wc -l

# Check index coverage
grep -n "@@index\|@@unique" backend/prisma/schema.prisma | wc -l
```

---

## Conclusion

**Status:** ✅ COMPLIANT

The Prisma schema demonstrates excellent relational modeling with:
- 80+ properly defined relations
- Comprehensive index coverage on all foreign keys
- Strategic composite indexes for common query patterns
- Full PostGIS GiST index coverage for spatial queries
- Proper self-referential and hierarchical structures

**No changes required.**

---

**Report Generated:** 2026-05-19  
**Auditor:** PHASE-01-PRISMA-RELATION-VALIDATION  
**Next Task:** PRISMA-UUID-POLICY-LOCK