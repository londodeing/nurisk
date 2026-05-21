/**
 * Operational Routes
 * =============
 * Express router for operational awareness endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { OperationalAwarenessService } = require('../services/operational-awareness');

const operationalService = new OperationalAwarenessService(pool);

// ==========================================================
// Shift Summary
// ==========================================================

// GET /api/operational/shift-summary - Get current shift summary
router.get('/shift-summary', async (req, res) => {
  try {
    const shiftId = req.query.shiftId;

    const summary = await operationalService.getShiftSummary(shiftId);

    res.json(summary);
  } catch (error) {
    console.error('OPERATIONAL_SHIFT_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Operational Overview
// ==========================================================

// GET /api/operational/overview - Get operational overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await operationalService.getOperationalOverview();

    res.json(overview);
  } catch (error) {
    console.error('OPERATIONAL_OVERVIEW_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Resource Health
// ==========================================================

// GET /api/operational/resource-health - Get resource health
router.get('/resource-health', async (req, res) => {
  try {
    const overview = await operationalService.getOperationalOverview();

    res.json(overview.resource_health);
  } catch (error) {
    console.error('OPERATIONAL_RESOURCE_HEALTH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Resource Alerts
// ==========================================================

// GET /api/operational/resource-alerts - Get resource alerts
router.get('/resource-alerts', async (req, res) => {
  try {
    const overview = await operationalService.getOperationalOverview();

    res.json(overview.alerts);
  } catch (error) {
    console.error('OPERATIONAL_ALERTS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/operational/health - Health check
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;