/**
 * Trend Analysis Controller
 * ======================
 * REST API controller for trend analysis
 */

const trendService = require('../services/trendAnalysisService');

/**
 * Get incident trends with MA overlay
 * GET /analytics/trends/incidents?period=30d&type=BANJIR
 */
async function getIncidentTrends(req, res) {
  try {
    const { period = 30, type } = req.query;
    const trends = await trendService.getIncidentTrends(parseInt(period), type);
    
    res.json({
      success: true,
      data: trends,
      meta: {
        period_days: parseInt(period),
        type_filter: type || 'all',
        record_count: trends.length,
      }
    });
  } catch (error) {
    console.error('Incident trends error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get recent anomalies
 * GET /analytics/trends/anomalies?days=7
 */
async function getAnomalies(req, res) {
  try {
    const { days = 7 } = req.query;
    const anomalies = await trendService.getAnomalies(parseInt(days));
    
    res.json({
      success: true,
      data: anomalies,
      meta: {
        days: parseInt(days),
        anomaly_count: anomalies.length,
      }
    });
  } catch (error) {
    console.error('Anomalies error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get seasonality patterns
 * GET /analytics/trends/seasonality
 */
async function getSeasonality(req, res) {
  try {
    const seasonality = await trendService.getSeasonality();
    
    res.json({
      success: true,
      data: seasonality,
      meta: {
        day_of_week_patterns: seasonality.day_of_week.length,
        month_patterns: seasonality.month.length,
      }
    });
  } catch (error) {
    console.error('Seasonality error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get trend summary
 * GET /analytics/trends/summary
 */
async function getTrendSummary(req, res) {
  try {
    const summary = await trendService.getTrendSummary();
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Trend summary error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Acknowledge an anomaly
 * POST /analytics/trends/anomalies/:id/acknowledge
 */
async function acknowledgeAnomaly(req, res) {
  try {
    const { id } = req.params;
    const { acknowledged_by } = req.body;
    
    if (!acknowledged_by) {
      return res.status(400).json({ error: 'acknowledged_by is required' });
    }
    
    const result = await trendService.acknowledgeAnomaly(parseInt(id), acknowledged_by);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Acknowledge anomaly error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get trends by region
 * GET /analytics/trends/region/:region?days=30
 */
async function getTrendsByRegion(req, res) {
  try {
    const { region } = req.params;
    const { days = 30 } = req.query;
    
    const trends = await trendService.getTrendsByRegion(region, parseInt(days));
    
    res.json({
      success: true,
      data: trends,
      meta: {
        region,
        days: parseInt(days),
        record_count: trends.length,
      }
    });
  } catch (error) {
    console.error('Trends by region error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get trends by disaster type
 * GET /analytics/trends/type/:type?days=30
 */
async function getTrendsByType(req, res) {
  try {
    const { type } = req.params;
    const { days = 30 } = req.query;
    
    const trends = await trendService.getTrendsByType(type, parseInt(days));
    
    res.json({
      success: true,
      data: trends,
      meta: {
        type,
        days: parseInt(days),
        record_count: trends.length,
      }
    });
  } catch (error) {
    console.error('Trends by type error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getIncidentTrends,
  getAnomalies,
  getSeasonality,
  getTrendSummary,
  acknowledgeAnomaly,
  getTrendsByRegion,
  getTrendsByType,
};