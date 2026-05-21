/**
 * Rules Routes
 * ===========
 * Express router for rule orchestration endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { RulesService } = require('./rules.service');
const {
  CreateRuleDefinitionDTO,
  UpdateRuleDefinitionDTO,
  CreateRuleSetDTO,
  EvaluateRulesDTO,
} = require('./models');

const service = new RulesService(pool);

// ==========================================================
// Rule Definitions
// ==========================================================

// POST /api/rules - Create rule
router.post('/', async (req, res) => {
  try {
    const dto = CreateRuleDefinitionDTO.parse(req.body);
    const rule = await service.createRule(dto);
    res.status(201).json(rule);
  } catch (error) {
    console.error('RULE_CREATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/rules - List all rules
router.get('/', async (req, res) => {
  try {
    const rules = await service.getAllRules();
    res.json(rules);
  } catch (error) {
    console.error('RULE_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/rules/:id - Get rule by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rule = await service.getRule(id);

    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    res.json(rule);
  } catch (error) {
    console.error('RULE_GET_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/rules/:id - Update rule
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dto = UpdateRuleDefinitionDTO.parse(req.body);
    const rule = await service.updateRule(id, dto);

    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    res.json(rule);
  } catch (error) {
    console.error('RULE_UPDATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/rules/:id - Delete rule
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await service.deleteRule(id);

    if (!deleted) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('RULE_DELETE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Rule Sets
// ==========================================================

// POST /api/rules/sets - Create rule set
router.post('/sets', async (req, res) => {
  try {
    const dto = CreateRuleSetDTO.parse(req.body);
    const ruleSet = await service.createRuleSet(dto);
    res.status(201).json(ruleSet);
  } catch (error) {
    console.error('RULESET_CREATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/rules/sets - List all rule sets
router.get('/sets', async (req, res) => {
  try {
    const ruleSets = await service.getAllRuleSets();
    res.json(ruleSets);
  } catch (error) {
    console.error('RULESET_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/rules/sets/:id - Get rule set by ID
router.get('/sets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ruleSet = await service.getRuleSet(id);

    if (!ruleSet) {
      res.status(404).json({ error: 'Rule set not found' });
      return;
    }

    res.json(ruleSet);
  } catch (error) {
    console.error('RULESET_GET_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/rules/sets/:id/rules - Get rules in a set
router.get('/sets/:id/rules', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rules = await service.getRulesBySetId(id);
    res.json(rules);
  } catch (error) {
    console.error('RULESET_RULES_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Rule Evaluation
// ==========================================================

// POST /api/rules/evaluate - Evaluate rules
router.post('/evaluate', async (req, res) => {
  try {
    const dto = EvaluateRulesDTO.parse(req.body);
    const result = await service.evaluateRules(dto, pool);
    res.json(result);
  } catch (error) {
    console.error('RULE_EVALUATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;