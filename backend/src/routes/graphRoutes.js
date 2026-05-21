/**
 * Graph Routes
 * ===========
 * API routes for graph queries
 */

const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');

// GET /graph/proximity?nodeId=X&hops=2&edgeTypes=AFFECTS,NEAR
router.get('/proximity', graphController.getProximity);

// GET /graph/shortest-path?from=X&to=Y&edgeTypes=AFFECTS,NEAR
router.get('/shortest-path', graphController.getShortestPath);

// GET /graph/subgraph?incidentId=X&limit=200
router.get('/subgraph', graphController.getSubgraph);

// POST /graph/query (admin only)
router.post('/query', graphController.executeQuery);

// GET /graph/stats
router.get('/stats', graphController.getStats);

module.exports = router;