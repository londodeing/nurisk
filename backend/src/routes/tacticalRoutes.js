/**
 * Tactical Routes
 * =============
 * Express router for tactical awareness endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { TacticalAwarenessService } = require('../services/tactical-awareness');

const tacticalService = new TacticalAwarenessService(pool);

// ==========================================================
// Tactical Snapshot
// ==========================================================

// GET /api/tactical/snapshot - Get tactical snapshot for region
router.get('/snapshot', async (req, res) => {
  try {
    const regionId = req.query.regionId;
    const since = req.query.since ? new Date(req.query.since) : undefined;

    if (!regionId) {
      res.status(400).json({ error: 'regionId is required' });
      return;
    }

    const snapshot = await tacticalService.getSnapshot(regionId, since);

    res.json(snapshot);
  } catch (error) {
    console.error('TACTICAL_SNAPSHOT_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Tactical GeoJSON
// ==========================================================

// GET /api/tactical/geojson - Get tactical data as GeoJSON
router.get('/geojson', async (req, res) => {
  try {
    const regionId = req.query.regionId;

    if (!regionId) {
      res.status(400).json({ error: 'regionId is required' });
      return;
    }

    const geojson = await tacticalService.getGeoJSON(regionId);

    res.setHeader('Content-Type', 'application/geo+json');
    res.json(geojson);
  } catch (error) {
    console.error('TACTICAL_GEOJSON_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Tactical Delta
// ==========================================================

// GET /api/tactical/delta - Get tactical changes since timestamp
router.get('/delta', async (req, res) => {
  try {
    const regionId = req.query.regionId;
    const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 60000);

    if (!regionId) {
      res.status(400).json({ error: 'regionId is required' });
      return;
    }

    const snapshot = await tacticalService.getSnapshot(regionId, since);

    res.json(snapshot);
  } catch (error) {
    console.error('TACTICAL_DELTA_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/tactical/health - Health check
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