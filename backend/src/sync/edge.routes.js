/**
 * Edge Node Routes
 * ==============
 * Express router for edge node endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { EdgeNodeService } = require('./edge-node');

const edgeService = new EdgeNodeService(pool);

// ==========================================================
// Edge Capabilities
// ==========================================================

// GET /api/edge/capabilities - Get edge node capabilities
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = edgeService.getCapabilities();

    res.json({
      capabilities,
      node_id: process.env.EDGE_NODE_ID || 'unknown',
      region: process.env.EDGE_REGION || 'default',
    });
  } catch (error) {
    console.error('EDGE_CAPABILITIES_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Sync Status
// ==========================================================

// GET /api/edge/sync - Get sync status
router.get('/sync', async (req, res) => {
  try {
    const status = await edgeService.getSyncStatus();

    res.json(status);
  } catch (error) {
    console.error('EDGE_SYNC_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Manual Sync
// ==========================================================

// POST /api/edge/sync - Trigger manual sync
router.post('/sync', async (req, res) => {
  try {
    const result = await edgeService.syncWithCloud();

    res.json(result);
  } catch (error) {
    console.error('EDGE_SYNC_TRIGGER_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Cloud Connectivity
// ==========================================================

// GET /api/edge/online - Check cloud connectivity
router.get('/online', async (req, res) => {
  try {
    const isOnline = await edgeService.checkCloudConnectivity();

    res.json({
      online: isOnline,
      cloud_endpoint: process.env.CLOUD_ENDPOINT,
      checked_at: new Date(),
    });
  } catch (error) {
    console.error('EDGE_ONLINE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Local Data (Read-only)
// ==========================================================

// GET /api/edge/incidents - Get local incidents
router.get('/incidents', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const result = await pool.query(
      `SELECT * FROM incidents ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      incidents: result.rows,
      count: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('EDGE_INCIDENTS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/edge/shelters - Get local shelters
router.get('/shelters', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const result = await pool.query(
      `SELECT * FROM shelters ORDER BY name ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      shelters: result.rows,
      count: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('EDGE_SHELTERS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/edge/assets - Get local assets
router.get('/assets', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const result = await pool.query(
      `SELECT * FROM assets ORDER BY name ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      assets: result.rows,
      count: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('EDGE_ASSETS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Local Write API
// ==========================================================

// POST /api/edge/checkins - Create local check-in
router.post('/checkins', async (req, res) => {
  try {
    const { volunteer_id, location, status, notes } = req.body;

    if (!volunteer_id || !location) {
      res.status(400).json({ error: 'volunteer_id and location required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO checkins (volunteer_id, location, status, notes, synced)
       VALUES ($1, $2, $3, $4, false)
       RETURNING *`,
      [volunteer_id, location, status || 'active', notes || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('EDGE_CHECKIN_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/edge/reports - Create local report
router.post('/reports', async (req, res) => {
  try {
    const { type, description, location, severity, data } = req.body;

    if (!type || !description) {
      res.status(400).json({ error: 'type and description required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO reports (type, description, location, severity, data, synced)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [type, description, location, severity || 'medium', JSON.stringify(data || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('EDGE_REPORT_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/edge/health - Edge node health check
router.get('/health', async (req, res) => {
  try {
    // Check database
    await pool.query('SELECT 1');

    // Get sync status
    const syncStatus = await edgeService.getSyncStatus();

    res.json({
      status: 'healthy',
      node_id: process.env.EDGE_NODE_ID || 'unknown',
      region: process.env.EDGE_REGION || 'default',
      online: syncStatus.online,
      sync: syncStatus,
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