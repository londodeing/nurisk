/**
 * Briefing Routes
 * =============
 * Express router for executive briefing endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { ExecutiveBriefingService } = require('../services/executive-briefing');

const briefingService = new ExecutiveBriefingService(pool);

// ==========================================================
// Executive Briefing
// ==========================================================

// GET /api/briefing - Get executive briefing
router.get('/', async (req, res) => {
  try {
    const incidentId = req.query.incidentId;

    const briefing = await briefingService.generateBriefing(incidentId);

    res.json(briefing);
  } catch (error) {
    console.error('BRIEFING_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Situation Summary
// ==========================================================

// GET /api/briefing/situation - Get situation summary only
router.get('/situation', async (req, res) => {
  try {
    const incidentId = req.query.incidentId;

    const briefing = await briefingService.generateBriefing(incidentId);

    res.json(briefing.sections.situation);
  } catch (error) {
    console.error('BRIEFING_SITUATION_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Operations Summary
// ==========================================================

// GET /api/briefing/operations - Get operations summary only
router.get('/operations', async (req, res) => {
  try {
    const briefing = await briefingService.generateBriefing();

    res.json(briefing.sections.operations);
  } catch (error) {
    console.error('BRIEFING_OPERATIONS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Risk Summary
// ==========================================================

// GET /api/briefing/risks - Get risk summary only
router.get('/risks', async (req, res) => {
  try {
    const briefing = await briefingService.generateBriefing();

    res.json(briefing.sections.risks);
  } catch (error) {
    console.error('BRIEFING_RISKS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Recommendations
// ==========================================================

// GET /api/briefing/recommendations - Get recommendations only
router.get('/recommendations', async (req, res) => {
  try {
    const briefing = await briefingService.generateBriefing();

    res.json(briefing.sections.recommendations);
  } catch (error) {
    console.error('BRIEFING_RECOMMENDATIONS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/briefing/health - Health check
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