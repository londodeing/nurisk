-- Neo4j AGE Graph Edge Types Creation
-- T03-task-t03: Define edge/relationship creation

-- Load the AGE extension
SELECT load_extension('age');
SET search_path = ag_catalog, "$user", public;

-- Create graph if it doesn't exist
SELECT * FROM create_graph('nurisk_graph');

-- Create vertex labels for entities we'll be connecting
-- These should match the node types we'll create in T02
SELECT * FROM create_vlabel('nurisk_graph', 'Incident');
SELECT * FROM create_vlabel('nurisk_graph', 'Location');
SELECT * FROM create_vlabel('nurisk_graph', 'Organization');
SELECT * FROM create_vlabel('nurisk_graph', 'Person');
SELECT * FROM create_vlabel('nurisk_graph', 'Resource');
SELECT * FROM create_vlabel('nurisk_graph', 'Event');

-- Create edge labels for relationships (First set: NEXT_TO, WITHIN, MANAGES, DEPLOYED_TO)
SELECT * FROM create_elabel('nurisk_graph', 'NEXT_TO');
SELECT * FROM create_elabel('nurisk_graph', 'WITHIN');
SELECT * FROM create_elabel('nurisk_graph', 'MANAGES');
SELECT * FROM create_elabel('nurisk_graph', 'DEPLOYED_TO');

-- Create edge labels for relationships (Second set: SUPPLIES, REPORTS, AFFECTS, RELATED_TO)
SELECT * FROM create_elabel('nurisk_graph', 'SUPPLIES');
SELECT * FROM create_elabel('nurisk_graph', 'REPORTS');
SELECT * FROM create_elabel('nurisk_graph', 'AFFECTS');
SELECT * FROM create_elabel('nurisk_graph', 'RELATED_TO');

-- Grant privileges on graph objects
GRANT ALL PRIVILEGES ON GRAPH nurisk_graph TO postgres;
GRANT ALL PRIVILEGES ON ALL VLABELS IN GRAPH nurisk_graph TO postgres;
GRANT ALL PRIVILEGES ON ALL ELABELS IN GRAPH nurisk_graph TO postgres;

-- Reset search path
SET search_path = "$user", public;