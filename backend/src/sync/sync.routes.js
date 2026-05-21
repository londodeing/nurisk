/**
 * Sync Routes
 * ==========
 * Express router for sync endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { DeltaSyncService } = require('./delta-sync');

const syncService = new DeltaSyncService(pool);

// ==========================================================
// Push Changes
// ==========================================================

// POST /api/sync/push - Push changes from client
router.post('/push', async (req, res) => {
  try {
    const { changes, client_id } = req.body;

    if (!Array.isArray(changes) || changes.length === 0) {
      res.status(400).json({ error: 'Changes array required' });
      return;
    }

    // Add client_id to each change
    const changesWithClient = changes.map((change) => ({
      ...change,
      client_id: client_id || 'unknown',
    }));

    const result = await syncService.pushChanges(changesWithClient);

    res.json({
      accepted: result.accepted.length,
      rejected: result.rejected.length,
      details: result,
    });
  } catch (error) {
    console.error('SYNC_PUSH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Pull Changes
// ==========================================================

// GET /api/sync/pull - Pull changes since version
router.get('/pull', async (req, res) => {
  try {
    const since = parseInt(req.query.since as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const entityTypes = (req.query.entityTypes as string)?.split(',') || [];

    const changes = await syncService.pullChanges(entityTypes, since, limit);

    res.json({
      changes,
      count: changes.length,
      since,
      server_version: Date.now(),
    });
  } catch (error) {
    console.error('SYNC_PULL_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Vector Clock
// ==========================================================

// GET /api/sync/clock - Get server vector clock
router.get('/clock', async (req, res) => {
  try {
    const client_id = req.query.client_id as string;
    const clock = await syncService.getVectorClock(client_id || 'unknown');

    res.json({
      clock,
      server_version: Date.now(),
    });
  } catch (error) {
    console.error('SYNC_CLOCK_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/sync/clock/resolve - Resolve vector clock conflicts
router.post('/clock/resolve', async (req, res) => {
  try {
    const { client_clock } = req.body;

    if (!client_clock) {
      res.status(400).json({ error: 'client_clock required' });
      return;
    }

    const serverClock = await syncService.getVectorClock('server');
    const result = await syncService.resolveConflicts(client_clock, serverClock);

    res.json(result);
  } catch (error) {
    console.error('SYNC_CLOCK_RESOLVE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Sync Status
// ==========================================================

// GET /api/sync/status - Get sync status
router.get('/status', async (req, res) => {
  try {
    const client_id = req.query.client_id as string;

    // Get pending changes count
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as count FROM sync_changelog WHERE client_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [client_id || 'unknown']
    );

    res.json({
      pending_changes: parseInt(pendingResult.rows[0].count),
      server_version: Date.now(),
    });
  } catch (error) {
    console.error('SYNC_STATUS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;