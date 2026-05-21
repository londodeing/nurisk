/**
 * Conflict Resolution Routes
 * ======================
 * Express router for conflict resolution endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { ConflictResolutionService } = require('./conflict-resolution');

const conflictService = new ConflictResolutionService(pool);

// ==========================================================
// Get Unresolved Conflicts
// ==========================================================

// GET /api/sync/conflicts - Get unresolved conflicts
router.get('/', async (req, res) => {
  try {
    const entityType = req.query.entity_type as string;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const conflicts = await conflictService.getUnresolvedConflicts(entityType, limit);

    res.json({
      conflicts,
      count: conflicts.length,
    });
  } catch (error) {
    console.error('CONFLICTS_GET_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Resolve Conflict
// ==========================================================

// POST /api/sync/conflicts/:id/resolve - Resolve conflict manually
router.post('/:id/resolve', async (req, res) => {
  try {
    const conflictId = parseInt(req.params.id, 10);
    const { resolution, merged_data } = req.body;

    if (!resolution || !['CLIENT', 'SERVER', 'MERGE'].includes(resolution)) {
      res.status(400).json({ error: 'Invalid resolution: must be CLIENT, SERVER, or MERGE' });
      return;
    }

    const success = await conflictService.resolveConflictManually(
      conflictId,
      resolution,
      merged_data
    );

    if (!success) {
      res.status(404).json({ error: 'Conflict not found' });
      return;
    }

    res.json({ success: true, message: `Conflict ${conflictId} resolved with ${resolution}` });
  } catch (error) {
    console.error('CONFLICT_RESOLVE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Conflict Statistics
// ==========================================================

// GET /api/sync/conflicts/stats - Get conflict statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await conflictService.getConflictStats();

    res.json(stats);
  } catch (error) {
    console.error('CONFLICTS_STATS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Detect Conflict (used during sync push)
// ==========================================================

// POST /api/sync/conflicts/detect - Detect and resolve conflict
router.post('/detect', async (req, res) => {
  try {
    const { entity_type, entity_id, client_version, client_data, server_version, server_data } = req.body;

    if (!entity_type || !entity_id) {
      res.status(400).json({ error: 'entity_type and entity_id required' });
      return;
    }

    const result = await conflictService.detectAndResolve(
      entity_type,
      entity_id,
      client_version,
      client_data,
      server_version,
      server_data
    );

    res.json(result);
  } catch (error) {
    console.error('CONFLICT_DETECT_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;