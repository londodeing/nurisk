/**
 * Escalation Routes
 * ===============
 * Express router for escalation endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { EscalationTimerService } = require('./timer-service');
const { EscalationRulesService } = require('./rules-service');

const timerService = new EscalationTimerService(pool);
const rulesService = new EscalationRulesService(pool, timerService);

// ==========================================================
// Escalation Rules
// ==========================================================

// GET /api/escalation/rules - List rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await rulesService.getActiveRules();
    res.json(rules);
  } catch (error) {
    console.error('ESCALATION_RULES_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/escalation/rules - Create rule
router.post('/rules', async (req, res) => {
  try {
    const rule = await rulesService.createRule(req.body);
    res.status(201).json(rule);
  } catch (error) {
    console.error('ESCALATION_CREATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/escalation/rules/:id - Update rule
router.patch('/rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rule = await rulesService.updateRule(id, req.body);
    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }
    res.json(rule);
  } catch (error) {
    console.error('ESCALATION_UPDATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/escalation/rules/:id - Delete rule
router.delete('/rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await rulesService.deleteRule(id);
    res.status(204).send();
  } catch (error) {
    console.error('ESCALATION_DELETE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Escalation Timers
// ==========================================================

// POST /api/escalation/timers - Start timer
router.post('/timers', async (req, res) => {
  try {
    const timer = await timerService.startTimer(req.body);
    res.status(201).json(timer);
  } catch (error) {
    console.error('TIMER_START_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/escalation/timers/:id - Cancel timer
router.delete('/timers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await timerService.cancelTimer(id);
    res.status(204).send();
  } catch (error) {
    console.error('TIMER_CANCEL_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/escalation/timers/execution/:id - Get timers for execution
router.get('/timers/execution/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const timers = await timerService.getTimersForExecution(id);
    res.json(timers);
  } catch (error) {
    console.error('TIMER_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Escalation Logs
// ==========================================================

// GET /api/escalation/logs - List logs
router.get('/logs', async (req, res) => {
  try {
    const executionId = req.query.execution_id;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    let query = 'SELECT * FROM escalation_logs';
    const params = [];
    
    if (executionId) {
      query += ' WHERE execution_id = $1';
      params.push(parseInt(executionId as string, 10));
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('ESCALATION_LOGS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/escalation/setup - Setup default rules
router.post('/setup', async (req, res) => {
  try {
    await rulesService.setupDefaultRules();
    res.json({ success: true });
  } catch (error) {
    console.error('ESCALATION_SETUP_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;