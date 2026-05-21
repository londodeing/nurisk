/**
 * Playbook Execution Routes
 * =======================
 * Express router for playbook execution endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { PlaybookSequencer } = require('./sequencer');
const {
  StartExecutionDTO,
  PauseExecutionDTO,
  ResumeExecutionDTO,
} = require('./models');

const sequencer = new PlaybookSequencer(pool);

// ==========================================================
// Execution Management
// ==========================================================

// POST /api/playbooks/execution - Start execution
router.post('/execution', async (req, res) => {
  try {
    const dto = StartExecutionDTO.parse(req.body);
    const result = await sequencer.start(dto);
    res.status(201).json(result);
  } catch (error) {
    console.error('EXECUTION_START_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/playbooks/execution/:id - Get execution status
router.get('/execution/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = await sequencer.getStatus(id);
    res.json(status);
  } catch (error) {
    console.error('EXECUTION_STATUS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/playbooks/execution/:id/pause - Pause execution
router.post('/execution/:id/pause', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dto = PauseExecutionDTO.parse(req.body || {});
    await sequencer.pause(id, dto.reason);
    res.json({ success: true });
  } catch (error) {
    console.error('EXECUTION_PAUSE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/playbooks/execution/:id/resume - Resume execution
router.post('/execution/:id/resume', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dto = ResumeExecutionDTO.parse(req.body || {});
    const result = await sequencer.resume(id, dto.context);
    res.json(result);
  } catch (error) {
    console.error('EXECUTION_RESUME_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/playbooks/executions - List executions
router.get('/executions', async (req, res) => {
  try {
    const playbookId = req.query.playbook_id;
    const incidentId = req.query.incident_id;
    const status = req.query.status;

    let query = 'SELECT * FROM playbook_executions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (playbookId) {
      query += ` AND playbook_id = $${paramIndex++}`;
      params.push(parseInt(playbookId, 10));
    }
    if (incidentId) {
      query += ` AND incident_id = $${paramIndex++}`;
      params.push(parseInt(incidentId, 10));
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('EXECUTION_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;