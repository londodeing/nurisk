-- Graph Namespace Setup for Apache AGE
-- ================================
-- Creates the nurisk_graph and configures session

-- Set search path to include ag_catalog
SET search_path = ag_catalog, "$user", public;

-- Create the main graph if not exists
SELECT ag_catalog.create_graph('nurisk_graph');

-- Verify graph was created
SELECT * FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph';

-- Create vertex labels
SELECT ag_catalog.create_vlabel('nurisk_graph', 'incident');
SELECT ag_catalog.create_vlabel('nurisk_graph', 'location');
SELECT ag_catalog.create_vlabel('nurisk_graph', 'organization');
SELECT ag_catalog.create_vlabel('nurisk_graph', 'volunteer');
SELECT ag_catalog.create_vlabel('nurisk_graph', 'shelter');

-- Create edge labels
SELECT ag_catalog.create_elabel('nurisk_graph', 'located_at');
SELECT ag_catalog.create_elabel('nurisk_graph', 'belongs_to');
SELECT ag_catalog.create_elabel('nurisk_graph', 'manages');
SELECT ag_catalog.create_elabel('nurisk_graph', 'uses');
SELECT ag_catalog.create_elabel('nurisk_graph', 'deployed_to');

-- Verify labels created
SELECT * FROM ag_catalog.ag_label WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph');

-- Set default search path for sessions
ALTER DATABASE nurisk SET search_path = ag_catalog, "$user", public;

COMMENT ON GRAPH nurisk_graph IS 'NU Risk Management Graph Database';