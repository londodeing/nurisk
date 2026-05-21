/**
 * Tactical Update Emitter
 * ================
 * Emits tactical updates every 15 seconds
 */

const pool = require('../config/database');
const { TacticalAwarenessService } = require('./tactical-awareness');
const { emitTacticalUpdate } = require('./socketService');

const UPDATE_INTERVAL = 15000; // 15 seconds
let io = null;
let timer = null;
let tacticalService = null;

/**
 * Start tactical update emitter
 */
const startTacticalEmitter = (socketIO) => {
  io = socketIO;
  tacticalService = new TacticalAwarenessService(pool);

  console.log('[TACTICAL] Starting emitter...');

  timer = setInterval(async () => {
    await emitAllRegions();
  }, UPDATE_INTERVAL);

  // Initial emit
  emitAllRegions();
};

/**
 * Stop tactical update emitter
 */
const stopTacticalEmitter = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  console.log('[TACTICAL] Stopped emitter');
};

/**
 * Emit updates for all active regions
 */
const emitAllRegions = async () => {
  try {
    // Get active regions
    const result = await pool.query(`
      SELECT DISTINCT region FROM incidents 
      WHERE status NOT IN ('RESOLVED', 'CLOSED')
      AND created_at > NOW() - INTERVAL '24 hours'
    `);

    for (const row of result.rows) {
      const regionId = row.region;
      if (!regionId) continue;

      try {
        const snapshot = await tacticalService.getSnapshot(regionId);
        emitTacticalUpdate(io, regionId, snapshot);
      } catch (error) {
        console.error(`[TACTICAL] Error for region ${regionId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[TACTICAL] Emit error:', error.message);
  }
};

/**
 * Emit update for specific region
 */
const emitRegionUpdate = async (regionId) => {
  if (!tacticalService || !io) {
    console.error('[TACTICAL] Emitter not initialized');
    return;
  }

  try {
    const snapshot = await tacticalService.getSnapshot(regionId);
    emitTacticalUpdate(io, regionId, snapshot);
  } catch (error) {
    console.error(`[TACTICAL] Error for region ${regionId}:`, error.message);
  }
};

module.exports = {
  startTacticalEmitter,
  stopTacticalEmitter,
  emitRegionUpdate,
};