/**
 * Forecast Routes
 * ==============
 * API routes for forecasting
 */

const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

// GET /analytics/forecast/incidents?days=7&model=arima|prophet|ensemble
router.get('/incidents', forecastController.getIncidentForecast);

// GET /analytics/forecast/arima?days=7&type=BANJIR
router.get('/arima', forecastController.getArimaForecast);

// GET /analytics/forecast/prophet?days=7&type=BANJIR
router.get('/prophet', forecastController.getProphetForecast);

// GET /analytics/forecast/components?days=7
router.get('/components', forecastController.getForecastComponents);

// GET /analytics/forecast/accuracy?days=7
router.get('/accuracy', forecastController.getForecastAccuracy);

module.exports = router;