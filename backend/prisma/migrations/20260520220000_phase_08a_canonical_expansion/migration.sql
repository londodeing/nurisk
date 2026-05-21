-- Phase-08A: Canonical Expansion — Warning, Hazard, Awareness, Decision, Briefing
-- Additive only. No modifications to existing tables.

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- EXISTING ENUMS (created here if database was set up without Prisma enums)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "DisasterType" AS ENUM ('BANJIR', 'LONGSOR', 'GEMPA', 'TSUNAMI', 'VOLKANO', 'KEBAKARAN_HUTAN', 'KEBAKARAN_BANGUNAN', 'EKSTREM_CUACA', 'WABAH_PENYAKIT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- NEW ENUMS
-- =============================================================================

-- WarningEnums
CREATE TYPE "WarningSeverity" AS ENUM ('ADVISORY', 'WATCH', 'WARNING', 'EMERGENCY');
CREATE TYPE "WarningStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- HazardEnums
CREATE TYPE "HazardSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'EXTREME');

-- ExclusionZoneEnums
CREATE TYPE "ExclusionZoneType" AS ENUM ('DANGER', 'RESTRICTED', 'CONTROLLED');
CREATE TYPE "ExclusionZoneLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- DecisionEnums
CREATE TYPE "DecisionImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "DecisionUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DEFERRED');

-- BriefingEnums
CREATE TYPE "BriefingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- TacticalEnums
CREATE TYPE "TacticalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- =============================================================================
-- NEW TABLES
-- =============================================================================

-- Warning
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "WarningSeverity" NOT NULL,
    "status" "WarningStatus" NOT NULL DEFAULT 'ACTIVE',
    "affectedAreas" TEXT[],
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "incidentId" TEXT,
    "regionId" TEXT,
    "createdBy" TEXT,
    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- HazardZone
CREATE TABLE "HazardZone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "hazardType" "DisasterType" NOT NULL,
    "severity" "HazardSeverity" NOT NULL,
    "polygonGeometry" geography(Polygon, 4326) NOT NULL,
    "description" TEXT,
    "population" INTEGER,
    "area" DOUBLE PRECISION,
    "regionId" TEXT,
    "incidentId" TEXT,
    CONSTRAINT "HazardZone_pkey" PRIMARY KEY ("id")
);

-- VulnerabilityAssessment
CREATE TABLE "VulnerabilityAssessment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION NOT NULL,
    "factors" JSONB,
    "recommendations" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hazardZoneId" TEXT NOT NULL,
    "regionId" TEXT,
    "assessedBy" TEXT,
    CONSTRAINT "VulnerabilityAssessment_pkey" PRIMARY KEY ("id")
);

-- ExclusionZone
CREATE TABLE "ExclusionZone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "geometry" geography(Polygon, 4326) NOT NULL,
    "radius" DOUBLE PRECISION,
    "restrictionType" "ExclusionZoneType" NOT NULL,
    "level" "ExclusionZoneLevel" NOT NULL,
    "description" TEXT,
    "restrictions" TEXT[],
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "hazardZoneId" TEXT,
    "incidentId" TEXT,
    "regionId" TEXT,
    CONSTRAINT "ExclusionZone_pkey" PRIMARY KEY ("id")
);

-- TacticalData (1:1 with Incident via unique incidentId)
CREATE TABLE "TacticalData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "incidentId" TEXT NOT NULL,
    "priority" "TacticalPriority" NOT NULL DEFAULT 'MEDIUM',
    "perimeter" geography(Polygon, 4326),
    "description" TEXT,
    "metadata" JSONB,
    "deployedUnits" INTEGER NOT NULL DEFAULT 0,
    "sheltersOccupied" INTEGER NOT NULL DEFAULT 0,
    "resourcesDeployed" INTEGER NOT NULL DEFAULT 0,
    "regionId" TEXT,
    "createdBy" TEXT,
    CONSTRAINT "TacticalData_pkey" PRIMARY KEY ("id")
);

-- Decision
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" "DecisionImpact" NOT NULL,
    "urgency" "DecisionUrgency" NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "reasoning" TEXT,
    "alternatives" JSONB,
    "inputFactors" JSONB,
    "riskLevel" "DecisionImpact",
    "selectedOption" TEXT,
    "rationale" TEXT,
    "requestedBy" TEXT NOT NULL,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "incidentId" TEXT,
    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- ExecutiveBriefing
CREATE TABLE "ExecutiveBriefing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "summary" JSONB,
    "metrics" JSONB,
    "recommendations" TEXT[],
    "audience" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "status" "BriefingStatus" NOT NULL DEFAULT 'DRAFT',
    "incidentId" TEXT,
    "preparedBy" TEXT,
    CONSTRAINT "ExecutiveBriefing_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Warning indexes
CREATE INDEX "Warning_status_idx" ON "Warning"("status");
CREATE INDEX "Warning_severity_idx" ON "Warning"("severity");
CREATE INDEX "Warning_incidentId_idx" ON "Warning"("incidentId");
CREATE INDEX "Warning_regionId_idx" ON "Warning"("regionId");
CREATE INDEX "Warning_issuedAt_idx" ON "Warning"("issuedAt");
CREATE INDEX "Warning_expiresAt_idx" ON "Warning"("expiresAt");
CREATE INDEX "Warning_status_expiresAt_idx" ON "Warning"("status", "expiresAt");

-- HazardZone indexes
CREATE INDEX "HazardZone_hazardType_idx" ON "HazardZone"("hazardType");
CREATE INDEX "HazardZone_severity_idx" ON "HazardZone"("severity");
CREATE INDEX "HazardZone_regionId_idx" ON "HazardZone"("regionId");
CREATE INDEX "HazardZone_incidentId_idx" ON "HazardZone"("incidentId");
CREATE INDEX "HazardZone_polygonGeometry_idx" ON "HazardZone"("polygonGeometry");

-- VulnerabilityAssessment indexes
CREATE INDEX "VulnerabilityAssessment_hazardZoneId_idx" ON "VulnerabilityAssessment"("hazardZoneId");
CREATE INDEX "VulnerabilityAssessment_regionId_idx" ON "VulnerabilityAssessment"("regionId");
CREATE INDEX "VulnerabilityAssessment_score_idx" ON "VulnerabilityAssessment"("score");
CREATE INDEX "VulnerabilityAssessment_assessedAt_idx" ON "VulnerabilityAssessment"("assessedAt");

-- ExclusionZone indexes
CREATE INDEX "ExclusionZone_restrictionType_idx" ON "ExclusionZone"("restrictionType");
CREATE INDEX "ExclusionZone_level_idx" ON "ExclusionZone"("level");
CREATE INDEX "ExclusionZone_hazardZoneId_idx" ON "ExclusionZone"("hazardZoneId");
CREATE INDEX "ExclusionZone_incidentId_idx" ON "ExclusionZone"("incidentId");
CREATE INDEX "ExclusionZone_regionId_idx" ON "ExclusionZone"("regionId");
CREATE INDEX "ExclusionZone_effectiveFrom_effectiveTo_idx" ON "ExclusionZone"("effectiveFrom", "effectiveTo");
CREATE INDEX "ExclusionZone_level_restrictionType_idx" ON "ExclusionZone"("level", "restrictionType");

-- TacticalData indexes
CREATE UNIQUE INDEX "TacticalData_incidentId_key" ON "TacticalData"("incidentId");
CREATE INDEX "TacticalData_incidentId_idx" ON "TacticalData"("incidentId");
CREATE INDEX "TacticalData_priority_idx" ON "TacticalData"("priority");
CREATE INDEX "TacticalData_regionId_idx" ON "TacticalData"("regionId");
CREATE INDEX "TacticalData_createdAt_idx" ON "TacticalData"("createdAt");

-- Decision indexes
CREATE INDEX "Decision_status_idx" ON "Decision"("status");
CREATE INDEX "Decision_impact_idx" ON "Decision"("impact");
CREATE INDEX "Decision_urgency_idx" ON "Decision"("urgency");
CREATE INDEX "Decision_incidentId_idx" ON "Decision"("incidentId");
CREATE INDEX "Decision_requestedBy_idx" ON "Decision"("requestedBy");
CREATE INDEX "Decision_createdAt_idx" ON "Decision"("createdAt");
CREATE INDEX "Decision_incidentId_status_idx" ON "Decision"("incidentId", "status");
CREATE INDEX "Decision_incidentId_createdAt_idx" ON "Decision"("incidentId", "createdAt");

-- ExecutiveBriefing indexes
CREATE INDEX "ExecutiveBriefing_status_idx" ON "ExecutiveBriefing"("status");
CREATE INDEX "ExecutiveBriefing_incidentId_idx" ON "ExecutiveBriefing"("incidentId");
CREATE INDEX "ExecutiveBriefing_generatedAt_idx" ON "ExecutiveBriefing"("generatedAt");
CREATE INDEX "ExecutiveBriefing_audience_idx" ON "ExecutiveBriefing"("audience");
CREATE INDEX "ExecutiveBriefing_incidentId_generatedAt_idx" ON "ExecutiveBriefing"("incidentId", "generatedAt");

-- NOTE: FK constraints are enforced at the application layer.
-- Scalar FK columns (incidentId, regionId, hazardZoneId, createdBy, etc.)
-- reference primary keys in Incident, Region, User, HazardZone without
-- database-level FOREIGN KEY constraints to avoid naming conflicts with
-- existing tables that were created via prisma db push.
