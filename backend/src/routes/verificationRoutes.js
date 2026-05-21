/**
 * Verification Routes
 * =============
 * Express router for verification pipeline endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { VerificationPipeline } = require('../services/verification-pipeline');

const verificationPipeline = new VerificationPipeline(pool);

// ==========================================================
// Run Verification
// ==========================================================

// POST /api/verification/run - Run verification pipeline
router.post('/run', async (req, res) => {
  try {
    const {
      reportId,
      content,
      source,
      sourceType,
      location,
      metadata,
      webhookUrl,
    } = req.body;

    if (!reportId || !content || !source) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await verificationPipeline.verify({
      reportId,
      content,
      source,
      sourceType: sourceType || 'reporter',
      location,
      metadata,
      webhookUrl,
    });

    res.json(result);
  } catch (error) {
    console.error('VERIFICATION_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Get Verification Result
// ==========================================================

// GET /api/verification/result/:reportId - Get verification result
router.get('/result/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const result = await verificationPipeline.getResult(reportId);

    if (!result) {
      res.status(404).json({ error: 'Verification result not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('VERIFICATION_RESULT_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Batch Verification
// ==========================================================

// POST /api/verification/batch - Run verification for multiple reports
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
          // Get report content from database
          const reportResult = await pool.query(
            `SELECT id, content, source_id as source, source_type as "sourceType" FROM intel_reports WHERE id = $1`,
            [reportId]
          );

          if (reportResult.rows.length === 0) {
            return { report_id: reportId, error: 'Report not found' };
          }

          const report = reportResult.rows[0];
          return await verificationPipeline.verify({
            reportId: report.id,
            content: report.content,
            source: report.source,
            sourceType: report.sourceType || 'reporter',
          });
        } catch (error) {
          return { report_id: reportId, error: error.message };
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error('VERIFICATION_BATCH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Manual Review Queue
// ==========================================================

// GET /api/verification/manual-review - Get reports pending manual review
router.get('/manual-review', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const result = await pool.query(`
      SELECT v.report_id, v.status, v.confidence, v.processed_at, r.content, r.source_id
      FROM verification_results v
      JOIN intel_reports r ON v.report_id = r.id
      WHERE v.recommended_action = 'manual_review'
      ORDER BY v.processed_at DESC
      LIMIT $1
    `, [limit.toString()]);

    res.json(result.rows);
  } catch (error) {
    console.error('MANUAL_REVIEW_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Classification Stats
// ==========================================================

// GET /api/verification/stats - Get verification statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(confidence) as avg_confidence
      FROM verification_results
      GROUP BY status
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('VERIFICATION_STATS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/verification/health - Health check
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