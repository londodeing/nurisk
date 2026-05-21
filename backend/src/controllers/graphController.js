/**
 * Graph Controller
 * ==============
 * REST API controller for graph queries
 */

const cypherService = require('../services/cypherQueryService');

/**
 * Get proximity subgraph
 * GET /graph/proximity?nodeId=X&hops=2&edgeTypes=AFFECTS,NEAR
 */
async function getProximity(req, res) {
  try {
    const { nodeId, hops = 2, edgeTypes = '' } = req.query;

    if (!nodeId) {
      return res.status(400).json({ error: 'nodeId is required' });
    }

    const hopsNum = Math.min(Math.max(parseInt(hops), 1), 5);
    const edgeTypesArray = edgeTypes ? edgeTypes.split(',') : [];

    const result = await cypherService.getProximitySubgraph(
      parseInt(nodeId),
      hopsNum,
      edgeTypesArray
    );

    res.json({
      success: true,
      data: result,
      meta: {
        nodeId,
        hops: hopsNum,
        edgeTypes: edgeTypesArray,
        nodeCount: result.nodes?.length || 0,
        edgeCount: result.edges?.length || 0
      }
    });
  } catch (error) {
    console.error('Proximity query error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Find shortest path between nodes
 * GET /graph/shortest-path?from=X&to=Y&edgeTypes=AFFECTS,NEAR
 */
async function getShortestPath(req, res) {
  try {
    const { from, to, edgeTypes = '' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to are required' });
    }

    const edgeTypesArray = edgeTypes ? edgeTypes.split(',') : [];

    const result = await cypherService.findShortestPath(from, to, edgeTypesArray);

    res.json({
      success: true,
      data: result,
      meta: {
        from,
        to,
        edgeTypes: edgeTypesArray,
        pathLength: result.length || 0
      }
    });
  } catch (error) {
    console.error('Shortest path query error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get incident subgraph for visualization
 * GET /graph/subgraph?incidentId=X&limit=200
 */
async function getSubgraph(req, res) {
  try {
    const { incidentId, limit = 200 } = req.query;

    if (!incidentId) {
      return res.status(400).json({ error: 'incidentId is required' });
    }

    const limitNum = Math.min(Math.max(parseInt(limit), 1), 200);

    const result = await cypherService.getIncidentSubgraph(
      parseInt(incidentId),
      limitNum
    );

    res.json({
      success: true,
      data: result,
      meta: {
        incidentId,
        limit: limitNum,
        nodeCount: result.nodes?.length || 0,
        linkCount: result.links?.length || 0
      }
    });
  } catch (error) {
    console.error('Subgraph query error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Execute raw Cypher query (admin only)
 * POST /graph/query
 */
async function executeQuery(req, res) {
  try {
    const { query, params = {} } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    // Only allow read-only queries
    const result = await cypherService.executeReadOnly(query, params);

    res.json({
      success: true,
      data: result,
      meta: {
        rowCount: result.length
      }
    });
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get graph statistics
 * GET /graph/stats
 */
async function getStats(req, res) {
  try {
    const queries = {
      nodes: "MATCH (n) RETURN count(n) as count",
      edges: "MATCH ()-[r]->() RETURN count(r) as count",
      incidents: "MATCH (i:incident) RETURN count(i) as count",
      locations: "MATCH (l:location) RETURN count(l) as count",
      persons: "MATCH (p:person) RETURN count(p) as count"
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await cypherService.executeReadOnly(query);
        stats[key] = result[0]?.count || 0;
      } catch {
        stats[key] = 0;
      }
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats query error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProximity,
  getShortestPath,
  getSubgraph,
  executeQuery,
  getStats
};