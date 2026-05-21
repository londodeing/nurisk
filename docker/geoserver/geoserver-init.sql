-- GeoServer PostGIS Data Store Setup
-- Run this after GeoServer starts to create the data store

-- Create PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create disaster layers table
CREATE TABLE IF NOT EXISTS disaster_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(50) NOT NULL, -- 'flood', 'earthquake', 'landslide', 'volcano'
    severity VARCHAR(20),
    geometry GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS disaster_zones_geom_idx 
ON disaster_zones USING GIST (geometry);

-- Create shelters table
CREATE TABLE IF NOT EXISTS shelters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'full', 'closed'
    geometry GEOMETRY(POINT, 4326),
    address TEXT,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create shelters spatial index
CREATE INDEX IF NOT EXISTS shelters_geom_idx 
ON shelters USING GIST (geometry);

-- Create evacuation routes table
CREATE TABLE IF NOT EXISTS evacuation_routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    route_type VARCHAR(20), -- 'primary', 'secondary', 'emergency'
    geometry GEOMETRY(LINESTRING, 4326),
    capacity INTEGER,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create evacuation routes spatial index
CREATE INDEX IF NOT EXISTS evacuation_routes_geom_idx 
ON evacuation_routes USING GIST (geometry);

-- Create critical infrastructure table
CREATE TABLE IF NOT EXISTS critical_infrastructure (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    infra_type VARCHAR(50), -- 'hospital', 'school', 'government', 'religious'
    geometry GEOMETRY(POINT, 4326),
    address TEXT,
    capacity INTEGER,
    status VARCHAR(20) DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create critical infrastructure spatial index
CREATE INDEX IF NOT EXISTS critical_infrastructure_geom_idx 
ON critical_infrastructure USING GIST (geometry);

-- Create regional boundaries (kabupaten/kota)
CREATE TABLE IF NOT EXISTS regional_boundaries (
    id SERIAL PRIMARY KEY,
    kode_kab VARCHAR(10) NOT NULL,
    nama_kab VARCHAR(255) NOT NULL,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create regional boundaries spatial index
CREATE INDEX IF NOT EXISTS regional_boundaries_geom_idx 
ON regional_boundaries USING GIST (geometry);

-- Enable R-Tree spatial indexing
ALTER TABLE disaster_zones ALTER COLUMN geometry SET USING ST_MakeValid(geometry);
ALTER TABLE shelters ALTER COLUMN geometry SET USING ST_MakeValid(geometry);
ALTER TABLE evacuation_routes ALTER COLUMN geometry SET USING ST_MakeValid(geometry);
ALTER TABLE critical_infrastructure ALTER COLUMN geometry SET USING ST_MakeValid(geometry);
ALTER TABLE regional_boundaries ALTER COLUMN geometry SET USING ST_MakeValid(geometry);

-- Grant access to geoserver user
-- Note: Create a separate read-only user for GeoServer in production
GRANT SELECT ON ALL TABLES IN SCHEMA public TO public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public;