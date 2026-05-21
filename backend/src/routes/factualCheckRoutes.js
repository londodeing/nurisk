/**
 * Factual Check Routes
 * =============
 * Express router for AI factual check endpoints
 */

const express = require('express');
const router = express.Router();
const { AIFactualCheckService } = require('../services/ai-factual-check');

const factualCheckService = new AIFactualCheckService();

// ==========================================================
// Check Claim
// ==========================================================

// POST /api/trust/factual/check - Check a claim
router.post('/check', async (req, res) => {
  try {
    const {
      claim,
      context,
      knownFacts,
      source,
      sourceType,
      reportedAt,
      location,
    } = req.body;

    if (!claim) {
      res.status(400).json({ error: 'claim is required' });
      return;
    }

    const report = await factualCheckService.checkClaim({
      claim,
      context,
      knownFacts,
      source,
      sourceType,
      reportedAt,
      location,
    });

    res.json(report);
  } catch (error) {
    console.error('FACTUAL_CHECK_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Quick Check
// ==========================================================

// POST /api/trust/factual/quick - Quick claim check
router.post('/quick', async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim) {
      res.status(400).json({ error: 'claim is required' });
      return;
    }

    const result = await factualCheckService.quickCheck(claim);

    res.json(result);
  } catch (error) {
    console.error('FACTUAL_QUICK_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Batch Check
// ==========================================================

// POST /api/trust/factual/batch - Batch check multiple claims
router.post('/batch', async (req, res) => {
  try {
    const { claims } = req.body;

    if (!claims || !Array.isArray(claims)) {
      res.status(400).json({ error: 'claims array is required' });
      return;
    }

    const results = await factualCheckService.batchCheck(claims);

    res.json(results);
  } catch (error) {
    console.error('FACTUAL_BATCH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/trust/factual/health - Health check
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      gemini_configured: !!process.env.GEMINI_API_KEY,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;