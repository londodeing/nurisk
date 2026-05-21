-- Create Region table with coverage_area geography(Polygon, 4326)
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT,
    "code" TEXT,
    "coverageArea" geography(Polygon, 4326),

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- Create Zone table with coverage_area geography(Polygon, 4326)
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT,
    "code" TEXT,
    "regionId" TEXT,
    "coverageArea" geography(Polygon, 4326),

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Zone_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create EvacuationRouteStatus enum
CREATE TYPE "EvacuationRouteStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'CLOSED', 'UNDER_MAINTENANCE');

-- Create EvacuationRoute table with route geography(LineString, 4326)
CREATE TABLE "EvacuationRoute" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT,
    "description" TEXT,
    "route" geography(LineString, 4326),
    "originId" TEXT,
    "origin" TEXT,
    "destinationId" TEXT,
    "destination" TEXT,
    "distance" DOUBLE PRECISION,
    "estimatedTime" INTEGER,
    "status" "EvacuationRouteStatus" DEFAULT 'ACTIVE',
    "incidentId" TEXT,

    CONSTRAINT "EvacuationRoute_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EvacuationRoute_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for Region
CREATE INDEX "Region_name_idx" ON "Region"("name");
CREATE INDEX "Region_code_idx" ON "Region"("code");
CREATE INDEX "Region_coverageArea_idx" ON "Region" USING GIST ("coverageArea");

-- Create indexes for Zone
CREATE INDEX "Zone_name_idx" ON "Zone"("name");
CREATE INDEX "Zone_code_idx" ON "Zone"("code");
CREATE INDEX "Zone_regionId_idx" ON "Zone"("regionId");
CREATE INDEX "Zone_coverageArea_idx" ON "Zone" USING GIST ("coverageArea");

-- Create indexes for EvacuationRoute
CREATE INDEX "EvacuationRoute_name_idx" ON "EvacuationRoute"("name");
CREATE INDEX "EvacuationRoute_status_idx" ON "EvacuationRoute"("status");
CREATE INDEX "EvacuationRoute_incidentId_idx" ON "EvacuationRoute"("incidentId");
CREATE INDEX "EvacuationRoute_route_idx" ON "EvacuationRoute" USING GIST ("route");
