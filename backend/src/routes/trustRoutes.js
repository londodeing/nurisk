/**
 * Trust Routes
 * =============
 * Express router for trust score endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { TrustScoreService } = require('../services/trust-score');

const trustService = new TrustScoreService(pool);

// ==========================================================
// Calculate Trust Score
// ==========================================================

// POST /api/trust/calculate - Calculate trust score for a report
router.post('/calculate', async (req, res) => {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      res.status(400).json({ error: 'reportId is required' });
      return;
    }

    const trustScore = await trustService.calculateTrustScore(reportId);

    res.json(trustScore);
  } catch (error) {
    console.error('TRUST_CALCULATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Get Trust Score
// ==========================================================

// GET /api/trust/score/:reportId - Get trust score for a report
router.get('/score/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    let trustScore = await trustService.getTrustScore(reportId);

    // Calculate if not found
    if (!trustScore) {
      trustScore = await trustService.calculateTrustScore(reportId);
    }

    res.json(trustScore);
  } catch (error) {
    console.error('TRUST_SCORE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Get Source Reputation
// ==========================================================

// GET /api/trust/source/:sourceId - Get source reputation
router.get('/source/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;

    const reputation = await trustService.getSourceReputation(sourceId);

    if (!reputation) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    res.json(reputation);
  } catch (error) {
    console.error('TRUST_SOURCE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Batch Calculate
// ==========================================================

// POST /api/trust/batch - Calculate trust scores for multiple reports
router.post('/batch', async (req, res) => {
  try {
    const { reportIds } = req.body;

    if (!reportIds || !Array.isArray(reportIds)) {
      res.status(400).json({ error: 'reportIds array is required' });
      return;
    }

    const results = await Promise.all(
      reportIds.map(async (reportId) => {
        try {
          return await trustService.calculateTrustScore(reportId);
        } catch {
          return { report_id: reportId, error: true };
        })
      })
    );

    res.json(results);
  } catch (error) {
    console.error('TRUST_BATCH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/trust/health - Health check
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