/**
 * Orchestrator Routes
 * =============
 * API routes for risk orchestrator
 */

const express = require('express');
const router = express.Router();
const orchestratorController = require('../controllers/orchestratorController');

// GET /orchestrator/decisions?incidentId=X - Get decisions for incident
router.get('/decisions', orchestratorController.getDecisions);

// GET /orchestrator/modules - Get registered modules
router.get('/modules', orchestratorController.getModules);

// GET /orchestrator/health - Health check
router.get('/health', orchestratorController.healthCheck);

module.exports = router;