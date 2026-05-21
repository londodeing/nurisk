/**
 * Strategic Routes
 * =============
 * Express router for strategic awareness endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { StrategicAwarenessService } = require('../services/strategic-awareness');

const strategicService = new StrategicAwarenessService(pool);

// ==========================================================
// Trend Data
// ==========================================================

// GET /api/strategic/trends - Get trend data
router.get('/trends', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const validPeriods = ['7d', '30d', '90d', 'ytd'];

    if (!validPeriods.includes(period)) {
      res.status(400).json({ error: 'Invalid period. Use 7d, 30d, 90d, or ytd' });
      return;
    }

    const trends = await strategicService.getTrends(period);

    res.json(trends);
  } catch (error) {
    console.error('STRATEGIC_TRENDS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Trajectory
// ==========================================================

// GET /api/strategic/trajectory - Get trajectory data
router.get('/trajectory', async (req, res) => {
  try {
    const trajectory = await strategicService.getTrajectory();

    res.json(trajectory);
  } catch (error) {
    console.error('STRATEGIC_TRAJECTORY_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Incident Trends
// ==========================================================

// GET /api/strategic/incidents - Get incident trends
router.get('/incidents', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const trends = await strategicService.getTrends(period);

    res.json({
      by_type: trends.incidents_by_type,
      by_region: trends.incidents_by_region,
      by_severity: trends.incidents_by_severity,
    });
  } catch (error) {
    console.error('STRATEGIC_INCIDENTS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Resource Trends
// ==========================================================

// GET /api/strategic/resources - Get resource trends
router.get('/resources', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const trends = await strategicService.getTrends(period);

    res.json(trends.resource_utilization);
  } catch (error) {
    console.error('STRATEGIC_RESOURCES_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Response Time Trends
// ==========================================================

// GET /api/strategic/response-time - Get response time trends
router.get('/response-time', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const trends = await strategicService.getTrends(period);

    res.json(trends.response_time);
  } catch (error) {
    console.error('STRATEGIC_RESPONSE_TIME_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/strategic/health - Health check
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