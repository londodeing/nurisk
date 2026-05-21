/**
 * Panic Alert Routes
 * =============
 * Express router for panic alert endpoints
 */

const express = require('express');
const router = express.Router();

// In-memory panic alerts storage (in production, use database)
const panicAlerts = new Map();

/**
 * Get device ID from request or generate new one
 */
function getDeviceId(req) {
  return req.body.device_id || req.headers['x-device-id'] || `device_${Date.now()}`;
}

/**
 * Get client IP address
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// ==========================================================
// Panic Alert Endpoint
// ==========================================================

// POST /api/alerts/panic - Create panic alert
router.post('/panic', async (req, res) => {
  try {
    const { device_id, latitude, longitude, timestamp } = req.body;

    if (!device_id) {
      res.status(400).json({ error: 'device_id is required' });
      return;
    }

    const alertId = `panic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alert = {
      id: alertId,
      type: 'PANIC',
      severity: 'CRITICAL',
      device_id,
      location: latitude && longitude
        ? { lat: latitude, lng: longitude }
        : null,
      timestamp: timestamp || new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'NEW',
      assigned_to: null,
      notifications_sent: 0,
    };

    // Store alert
    panicAlerts.set(alertId, alert);

    // TODO: Notify nearest volunteers within 5km radius
    // TODO: Log in command center with high priority

    console.log(`[PANIC] Alert created: ${alertId} from device ${device_id}`);

    res.status(201).json({
      success: true,
      alert_id: alertId,
      message: 'Panic alert received',
    });
  } catch (error) {
    console.error('PANIC_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Get Panic Alert
// ==========================================================

// GET /api/alerts/panic/:id - Get panic alert by ID
router.get('/panic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alert = panicAlerts.get(id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(alert);
  } catch (error) {
    console.error('PANIC_GET_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// List Panic Alerts
// ==========================================================

// GET /api/alerts/panic - List all panic alerts
router.get('/panic', async (req, res) => {
  try {
    const alerts = Array.from(panicAlerts.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      total: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error('PANIC_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Update Panic Alert Status
// ==========================================================

// PATCH /api/alerts/panic/:id - Update panic alert status
router.patch('/panic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const alert = panicAlerts.get(id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    if (status) alert.status = status;
    if (assigned_to) alert.assigned_to = assigned_to;
    alert.updated_at = new Date().toISOString();

    panicAlerts.set(id, alert);

    res.json(alert);
  } catch (error) {
    console.error('PANIC_UPDATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/alerts/health - Health check
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      alerts_count: panicAlerts.size,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;