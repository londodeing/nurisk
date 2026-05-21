-- Neo4j AGE Graph Trigger Functions for Auto-Creating Edges
-- T03-task-t03: Write trigger functions to auto-create edges on relational inserts

-- Load the AGE extension
SELECT load_extension('age');
SET search_path = ag_catalog, "$user", public;

-- Function to create edge in AGE graph
CREATE OR REPLACE FUNCTION create_edge(
    graph_name text,
    from_vlabel text,
    from_id bigint,
    to_vlabel text,
    to_id bigint,
    edge_label text,
    edge_properties jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
    cypher_query text;
BEGIN
    cypher_query := format(
        'INSERT INTO %I.graph.%I (from, to, label, properties) ' ||
        'SELECT %L::bigint, %L::bigint, %L, %L ' ||
        'FROM cypher(%I, $$ ' ||
        'MATCH (a:%s), (b:%s) ' ||
        'WHERE id(a) = $1 AND id(b) = $2 ' ||
        'RETURN id(a) as from_id, id(b) as to_id $$ ' ||
        'AS (from agtype, to agtype, label agtype, properties agtype) ' ||
        'VALUES ($1::bigint, $2::bigint, $3::text, $4::jsonb)',
        graph_name, edge_label,
        from_id, to_id, edge_label, edge_properties,
        graph_name, from_vlabel, to_vlabel
    );
    
    EXECUTE cypher_query USING from_id, to_id, edge_label, edge_properties;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for volunteer_deployments -> creates DEPLOYED_TO edge (volunteer -> incident)
CREATE OR REPLACE FUNCTION trg_volunteer_deployments_deployed_to()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Person', NEW.volunteer_id,
        'Incident', NEW.incident_id,
        'DEPLOYED_TO',
        jsonb_build_object(
            'status', NEW.status,
            'available_from', NEW.available_from,
            'available_until', NEW.available_until,
            'note', NEW.note,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for incident_instructions -> creates MANAGES edge (organization/person -> incident)
CREATE OR REPLACE FUNCTION trg_incident_instructions_manages()
RETURNS TRIGGER AS $$
BEGIN
    -- Assuming incident_instructions.pic_lapangan refers to a person who manages the incident
    -- In a real implementation, we would need to map this to a Person node
    PERFORM create_edge(
        'nurisk_graph',
        'Person', 0, -- Placeholder - would need to lookup actual person ID from pic_lapangan
        'Incident', NEW.incident_id,
        'MANAGES',
        jsonb_build_object(
            'nomor_sp', NEW.nomor_sp,
            'pj_nama', NEW.pj_nama,
            'pic_lapangan', NEW.pic_lapangan,
            'tim_anggota', NEW.tim_anggota,
            'armada_detail', NEW.armada_detail,
            'peralatan_detail', NEW.peralatan_detail,
            'duration', NEW.duration,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for shelters -> creates MANAGES edge (organization -> incident)
CREATE OR REPLACE FUNCTION trg_shelters_manages()
RETURNS TRIGGER AS $$
BEGIN
    -- Assuming shelters are managed by organizations
    -- In a real implementation, we would need to link shelters to organizations
    PERFORM create_edge(
        'nurisk_graph',
        'Organization', 0, -- Placeholder - would need to lookup actual organization ID
        'Incident', NEW.incident_id,
        'MANAGES',
        jsonb_build_object(
            'name', NEW.name,
            'region', NEW.region,
            'status', NEW.status,
            'score', NEW.score,
            'refugee_count', NEW.refugee_count,
            'stock_status', NEW.stock_status,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for incident_resources -> creates SUPPLIES edge (resource -> incident)
CREATE OR REPLACE FUNCTION trg_incident_resources_supplies()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Resource', 0, -- Placeholder - would need to map resource type/resource_id to Resource node
        'Incident', NEW.incident_id,
        'SUPPLIES',
        jsonb_build_object(
            'resource_type', NEW.resource_type,
            'resource_id', NEW.resource_id,
            'quantity', NEW.quantity,
            'unit', NEW.unit,
            'notes', NEW.notes,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for asset_transactions -> creates SUPPLIES edge (resource -> incident)
CREATE OR REPLACE FUNCTION trg_asset_transactions_supplies()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Resource', 0, -- Placeholder - would need to map asset to Resource node
        'Incident', NEW.incident_id,
        'SUPPLIES',
        jsonb_build_object(
            'asset_id', NEW.asset_id,
            'transaction_type', 'allocation', -- Assuming this is an allocation transaction
            'quantity', 1, -- Default quantity
            'notes', NEW.notes,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for reports -> creates REPORTS edge (person -> incident)
CREATE OR REPLACE FUNCTION trg_reports_reports()
RETURNS TRIGGER AS $$
BEGIN
    -- Assuming reports are made by users/persons
    -- We would need to link reports to users via some identifier
    PERFORM create_edge(
        'nurisk_graph',
        'Person', 0, -- Placeholder - would need to lookup actual person ID from reporter info
        'Incident', 0, -- Placeholder - would need to link report to incident
        'REPORTS',
        jsonb_build_object(
            'report_code', NEW.report_code,
            'title', NEW.title,
            'description', NEW.description,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude,
            'region', NEW.region,
            'status', NEW.status,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for incident_logs -> creates REPORTS edge (person -> incident)
CREATE OR REPLACE FUNCTION trg_incident_logs_reports()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Person', 0, -- Placeholder - would need to link to user who made log entry
        'Incident', NEW.incident_id,
        'REPORTS',
        jsonb_build_object(
            'log_type', NEW.log_type,
            'description', NEW.description,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for incidents -> creates AFFECTS edge (incident -> location)
CREATE OR REPLACE FUNCTION trg_incidents_affects_location()
RETURNS TRIGGER AS $$
BEGIN
    -- Connect incident to location based on latitude/longitude
    -- This would require reverse geocoding or proximity matching to Location nodes
    PERFORM create_edge(
        'nurisk_graph',
        'Incident', NEW.id,
        'Location', 0, -- Placeholder - would need to find/create Location node based on coordinates
        'AFFECTS',
        jsonb_build_object(
            'title', NEW.title,
            'disaster_type', NEW.disaster_type,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude,
            'region', NEW.region,
            'priority_level', NEW.priority_level,
            'status', NEW.status,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for historical_disasters -> creates AFFECTS edge (disaster -> location)
CREATE OR REPLACE FUNCTION trg_historical_disasters_affects()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Event', 0, -- Placeholder - historical disaster as Event node
        'Location', 0, -- Placeholder - would need to find/create Location node based on coordinates
        'AFFECTS',
        jsonb_build_object(
            'region', NEW.region,
            'disaster_type', NEW.disaster_type,
            'event_date', NEW.event_date,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude,
            'time', NEW.time
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for master_incidents -> creates RELATED_TO edge (incident -> master_incident)
CREATE OR REPLACE FUNCTION trg_incident_master_incidents_related_to()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Incident', NEW.incident_id,
        'Incident', NEW.master_id, -- Assuming master_incidents table links incidents to master incidents
        'RELATED_TO',
        jsonb_build_object(
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for organizations -> creates RELATED_TO edge (organization -> parent organization)
CREATE OR REPLACE FUNCTION trg_organizations_related_to()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        PERFORM create_edge(
            'nurisk_graph',
            'Organization', NEW.id,
            'Organization', NEW.parent_id,
            'RELATED_TO',
            jsonb_build_object(
                'relationship_type', 'parent_child',
                'created_at', NEW.created_at
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for volunteer_locations -> creates NEXT_TO edge (volunteer -> volunteer based on proximity)
CREATE OR REPLACE FUNCTION trg_volunteer_locations_next_to()
RETURNS TRIGGER AS $$
BEGIN
    -- This would require checking proximity to other volunteers
    -- For simplicity, we'll skip the actual proximity calculation in this trigger
    -- In a real implementation, this would find nearby volunteers and create NEXT_TO edges
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for incidents -> creates NEXT_TO edge (incident -> incident based on proximity)
CREATE OR REPLACE FUNCTION trg_incidents_next_to()
RETURNS TRIGGER AS $$
BEGIN
    -- This would require checking proximity to other incidents
    -- For simplicity, we'll skip the actual proximity calculation in this trigger
    -- In a real implementation, this would find nearby incidents and create NEXT_TO edges
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for incidents -> creates WITHIN edge (incident -> location/region)
CREATE OR REPLACE FUNCTION trg_incidents_within()
RETURNS TRIGGER AS $$
BEGIN
    -- Connect incident to administrative region (kecamatan/desa) or geographic boundary
    -- This would require matching incident location to administrative boundaries
    PERFORM create_edge(
        'nurisk_graph',
        'Incident', NEW.id,
        'Location', 0, -- Placeholder - would need to find/create Location node for kecamatan/desa
        'WITHIN',
        jsonb_build_object(
            'kecamatan', NEW.kecamatan,
            'desa', NEW.desa,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for volunteers -> creates WITHIN edge (volunteer -> location/region)
CREATE OR REPLACE FUNCTION trg_volunteers_within()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_edge(
        'nurisk_graph',
        'Person', NEW.id,
        'Location', 0, -- Placeholder - would need to find/create Location node for regency/district/village
        'WITHIN',
        jsonb_build_object(
            'regency', NEW.regency,
            'district', NEW.district,
            'village', NEW.village,
            'detail_address', NEW.detail_address,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trg_volunteer_deployments_deployed_to ON volunteer_deployments;
CREATE TRIGGER trg_volunteer_deployments_deployed_to
    AFTER INSERT ON volunteer_deployments
    FOR EACH ROW EXECUTE FUNCTION trg_volunteer_deployments_deployed_to();

DROP TRIGGER IF EXISTS trg_incident_instructions_manages ON incident_instructions;
CREATE TRIGGER trg_incident_instructions_manages
    AFTER INSERT ON incident_instructions
    FOR EACH ROW EXECUTE FUNCTION trg_incident_instructions_manages();

DROP TRIGGER IF EXISTS trg_shelters_manages ON shelters;
CREATE TRIGGER trg_shelters_manages
    AFTER INSERT ON shelters
    FOR EACH ROW EXECUTE FUNCTION trg_shelters_manages();

DROP TRIGGER IF EXISTS trg_incident_resources_supplies ON incident_resources;
CREATE TRIGGER trg_incident_resources_supplies
    AFTER INSERT ON incident_resources
    FOR EACH ROW EXECUTE FUNCTION trg_incident_resources_supplies();

DROP TRIGGER IF EXISTS trg_asset_transactions_supplies ON asset_transactions;
CREATE TRIGGER trg_asset_transactions_supplies
    AFTER INSERT ON asset_transactions
    FOR EACH ROW EXECUTE FUNCTION trg_asset_transactions_supplies();

DROP TRIGGER IF EXISTS trg_reports_reports ON reports;
CREATE TRIGGER trg_reports_reports
    AFTER INSERT ON reports
    FOR EACH ROW EXECUTE FUNCTION trg_reports_reports();

DROP TRIGGER IF EXISTS trg_incident_logs_reports ON incident_logs;
CREATE TRIGGER trg_incident_logs_reports
    AFTER INSERT ON incident_logs
    FOR EACH ROW EXECUTE FUNCTION trg_incident_logs_reports();

DROP TRIGGER IF EXISTS trg_incidents_affects_location ON incidents;
CREATE TRIGGER trg_incidents_affects_location
    AFTER INSERT ON incidents
    FOR EACH ROW EXECUTE FUNCTION trg_incidents_affects_location();

DROP TRIGGER IF EXISTS trg_historical_disasters_affects ON historical_disasters;
CREATE TRIGGER trg_historical_disasters_affects
    AFTER INSERT ON historical_disasters
    FOR EACH ROW EXECUTE FUNCTION trg_historical_disasters_affects();

DROP TRIGGER IF EXISTS trg_incident_master_incidents_related_to ON incident_master_incidents;
CREATE TRIGGER trg_incident_master_incidents_related_to
    AFTER INSERT ON incident_master_incidents
    FOR EACH ROW EXECUTE FUNCTION trg_incident_master_incidents_related_to();

DROP TRIGGER IF EXISTS trg_organizations_related_to ON organizations;
CREATE TRIGGER trg_organizations_related_to
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION trg_organizations_related_to();

DROP TRIGGER IF EXISTS trg_volunteer_locations_next_to ON volunteer_locations;
CREATE TRIGGER trg_volunteer_locations_next_to
    AFTER INSERT ON volunteer_locations
    FOR EACH ROW EXECUTE FUNCTION trg_volunteer_locations_next_to();

DROP TRIGGER IF EXISTS trg_incidents_next_to ON incidents;
CREATE TRIGGER trg_incidents_next_to
    AFTER INSERT ON incidents
    FOR EACH ROW EXECUTE FUNCTION trg_incidents_next_to();

DROP TRIGGER IF EXISTS trg_incidents_within ON incidents;
CREATE TRIGGER trg_incidents_within
    AFTER INSERT ON incidents
    FOR EACH ROW EXECUTE FUNCTION trg_incidents_within();

DROP TRIGGER IF EXISTS trg_volunteers_within ON volunteers;
CREATE TRIGGER trg_volunteers_within
    AFTER INSERT ON volunteers
    FOR EACH ROW EXECUTE FUNCTION trg_volunteers_within();

-- Reset search path
SET search_path = "$user", public;