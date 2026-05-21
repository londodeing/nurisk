/**
 * Trend Analysis Routes
 * ==================
 * API routes for trend analysis
 */

const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trendAnalysisController');

// GET /analytics/trends/incidents?period=30d&type=BANJIR
router.get('/incidents', trendController.getIncidentTrends);

// GET /analytics/trends/anomalies?days=7
router.get('/anomalies', trendController.getAnomalies);

// POST /analytics/trends/anomalies/:id/acknowledge
router.post('/anomalies/:id/acknowledge', trendController.acknowledgeAnomaly);

// GET /analytics/trends/seasonality
router.get('/seasonality', trendController.getSeasonality);

// GET /analytics/trends/summary
router.get('/summary', trendController.getTrendSummary);

// GET /analytics/trends/region/:region?days=30
router.get('/region/:region', trendController.getTrendsByRegion);

// GET /analytics/trends/type/:type?days=30
router.get('/type/:type', trendController.getTrendsByType);

module.exports = router;