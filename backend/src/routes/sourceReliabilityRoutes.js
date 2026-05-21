/**
 * Source Reliability Routes
 * =============
 * Express router for source reliability endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { SourceReliabilityService } = require('../services/source-reliability');

const sourceService = new SourceReliabilityService(pool);

// Initialize on startup
sourceService.initializeTables().catch(console.error);

// ==========================================================
// List All Sources
// ==========================================================

// GET /api/trust/sources - List all sources with reputation
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const sources = await sourceService.getAllSources(limit, offset);

    res.json(sources);
  } catch (error) {
    console.error('SOURCE_RELIABILITY_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Get Source Details
// ==========================================================

// GET /api/trust/sources/:id - Get source reliability details
router.get('/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;

    const source = await sourceService.getSourceReliability(sourceId);

    if (!source) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    res.json(source);
  } catch (error) {
    console.error('SOURCE_DETAIL_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Get Source History
// ==========================================================

// GET /api/trust/sources/:id/history - Get reputation history
router.get('/:sourceId/history', async (req, res) => {
  try {
    const { sourceId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const history = await sourceService.getReputationHistory(sourceId, days);

    res.json(history);
  } catch (error) {
    console.error('SOURCE_HISTORY_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Recalculate Source
// ==========================================================

// POST /api/trust/sources/:id/recalculate - Recalculate source reputation
router.post('/:sourceId/recalculate', async (req, res) => {
  try {
    const { sourceId } = req.params;

    const source = await sourceService.calculateReputation(sourceId);

    res.json(source);
  } catch (error) {
    console.error('SOURCE_RECALCULATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Batch Recalculate
// ==========================================================

// POST /api/trust/sources/batch-recalculate - Recalculate all sources
router.post('/batch-recalculate', async (req, res) => {
  try {
    const count = await sourceService.batchRecalculate();

    res.json({ updated: count });
  } catch (error) {
    console.error('SOURCE_BATCH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Bad Actors
// ==========================================================

// GET /api/trust/sources/bad-actors - List bad actors
router.get('/bad-actors/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM trust_bad_actors WHERE active = true
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('BAD_ACTORS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/trust/sources/bad-actors - Add bad actor
router.post('/bad-actors', async (req, res) => {
  try {
    const { sourceId, reason, addedBy } = req.body;

    if (!sourceId) {
      res.status(400).json({ error: 'sourceId is required' });
      return;
    }

    await sourceService.addBadActor(sourceId, reason, addedBy);

    res.json({ success: true });
  } catch (error) {
    console.error('ADD_BAD_ACTOR_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/trust/sources/bad-actors/:sourceId - Remove bad actor
router.delete('/bad-actors/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;

    await sourceService.removeBadActor(sourceId);

    res.json({ success: true });
  } catch (error) {
    console.error('REMOVE_BAD_ACTOR_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/trust/sources/health - Health check
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