/**
 * Orchestrator Controller
 * ==============
 * API controller for risk orchestrator endpoints
 */

const { riskOrchestrator } = require('../services/riskOrchestrator');

/**
 * Get decisions for a specific incident
 * GET /orchestrator/decisions?incidentId=X
 */
exports.getDecisions = async (req, res) => {
  try {
    const { incidentId } = req.query;

    if (!incidentId) {
      return res.status(400).json({
        success: false,
        error: 'incidentId query parameter is required'
      });
    }

    const id = parseInt(incidentId);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid incidentId: must be a number'
      });
    }

    console.log(`[OrchestratorController] Getting decisions for incident ${id}`);

    const output = await riskOrchestrator.processIncident(id);

    res.json({
      success: true,
      data: output
    });
  } catch (err) {
    console.error('[OrchestratorController] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process orchestrator decisions'
    });
  }
};

/**
 * Get registered decision modules
 * GET /orchestrator/modules
 */
exports.getModules = async (req, res) => {
  try {
    const modules = riskOrchestrator.getModules();

    res.json({
      success: true,
      data: modules.map(m => ({
        name: m.name,
        version: m.version
      }))
    });
  } catch (err) {
    console.error('[OrchestratorController] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get modules'
    });
  }
};

/**
 * Health check for orchestrator
 * GET /orchestrator/health
 */
exports.healthCheck = async (req, res) => {
  try {
    const modules = riskOrchestrator.getModules();

    res.json({
      success: true,
      status: 'healthy',
      modules_count: modules.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: err.message
    });
  }
};