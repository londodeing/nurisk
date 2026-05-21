/**
 * Stream Analytics Routes
 * ======================
 * API routes for real-time stream analytics
 */

const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamAnalyticsController');

// GET /analytics/stream/incident-rate
router.get('/incident-rate', streamController.getIncidentRate);

// GET /analytics/stream/geographic-distribution
router.get('/geographic-distribution', streamController.getGeographicDistribution);

// GET /analytics/stream/severity-distribution
router.get('/severity-distribution', streamController.getSeverityDistribution);

// GET /analytics/stream/type-distribution
router.get('/type-distribution', streamController.getTypeDistribution);

// GET /analytics/stream/realtime
router.get('/realtime', streamController.getRealtimeStats);

// GET /analytics/stream/hourly-rates
router.get('/hourly-rates', streamController.getHourlyRates);

module.exports = router;