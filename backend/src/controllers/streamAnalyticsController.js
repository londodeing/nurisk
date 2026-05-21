/**
 * Stream Analytics Controller
 * ===========================
 * REST API controller for real-time analytics
 */

const streamService = require('../services/streamAnalyticsService');

/**
 * Get current incident rate per type
 * GET /analytics/stream/incident-rate
 */
async function getIncidentRate(req, res) {
  try {
    const { type } = req.query;
    const rates = await streamService.calculateSlidingWindowRate();
    
    res.json({
      success: true,
      data: rates,
      meta: {
        window_hours: 24,
        stride_hours: 1,
        type_filter: type || 'all',
      }
    });
  } catch (error) {
    console.error('Incident rate error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get geographic distribution
 * GET /analytics/stream/geographic-distribution
 */
async function getGeographicDistribution(req, res) {
  try {
    const distribution = await streamService.getGeographicDistribution();
    
    res.json({
      success: true,
      data: distribution,
      meta: {
        time_window: '24 hours',
        region_count: distribution.length,
      }
    });
  } catch (error) {
    console.error('Geographic distribution error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get severity distribution histogram
 * GET /analytics/stream/severity-distribution
 */
async function getSeverityDistribution(req, res) {
  try {
    const distribution = await streamService.getSeverityDistribution();
    
    res.json({
      success: true,
      data: distribution,
      meta: {
        time_window: '24 hours',
        buckets: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'],
      }
    });
  } catch (error) {
    console.error('Severity distribution error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get incident type distribution
 * GET /analytics/stream/type-distribution
 */
async function getTypeDistribution(req, res) {
  try {
    const distribution = await streamService.getTypeDistribution();
    
    res.json({
      success: true,
      data: distribution,
      meta: {
        time_window: '24 hours',
        type_count: distribution.length,
      }
    });
  } catch (error) {
    console.error('Type distribution error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get real-time statistics
 * GET /analytics/stream/realtime
 */
async function getRealtimeStats(req, res) {
  try {
    const stats = await streamService.getRealtimeStats();
    
    res.json({
      success: true,
      data: stats,
      meta: {
        last_1h: stats.last1h,
        last_24h: stats.last24h,
        active: stats.active,
      }
    });
  } catch (error) {
    console.error('Realtime stats error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get hourly incident rates
 * GET /analytics/stream/hourly-rates
 */
async function getHourlyRates(req, res) {
  try {
    const { type } = req.query;
    const rates = await streamService.calculateIncidentRate(type);
    
    res.json({
      success: true,
      data: rates,
      meta: {
        window_hours: 24,
        bucket_interval: '1 hour',
      }
    });
  } catch (error) {
    console.error('Hourly rates error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getIncidentRate,
  getGeographicDistribution,
  getSeverityDistribution,
  getTypeDistribution,
  getRealtimeStats,
  getHourlyRates,
};