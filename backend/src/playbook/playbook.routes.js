/**
 * Playbook Routes
 * ==============
 * Express router for playbook endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { PlaybookService } = require('./playbook.service');
const { 
  CreatePlaybookDTO, 
  UpdatePlaybookDTO, 
  CreatePlaybookFromTemplateDTO,
  PlaybookQueryParams 
} = require('./models');

const service = new PlaybookService(pool);

// Middleware to extract user from JWT
const extractUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { id: null };
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'PUSDATIN_JATENG_SECRET_2024');
    return decoded;
  } catch (e) {
    return { id: null };
  }
};

// ==========================================================
// Playbook CRUD
// ==========================================================

// POST /api/playbooks - Create playbook
router.post('/', async (req, res) => {
  try {
    const user = extractUser(req);
    const dto = CreatePlaybookDTO.parse(req.body);
    const playbook = await service.createPlaybook({
      ...dto,
      created_by: user.id,
    });
    res.status(201).json(playbook);
  } catch (error) {
    console.error('PLAYBOOK_CREATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/playbooks - List playbooks
router.get('/', async (req, res) => {
  try {
    const params = PlaybookQueryParams.parse({
      disaster_type: req.query.disaster_type,
      status: req.query.status,
      version: req.query.version ? parseInt(req.query.version, 10) : undefined,
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
    });

    const result = await service.getPlaybooks(params);
    res.json({
      data: result.data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / params.limit),
      },
    });
  } catch (error) {
    console.error('PLAYBOOK_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/playbooks/:id - Get playbook by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const playbook = await service.getPlaybook(id);

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    res.json(playbook);
  } catch (error) {
    console.error('PLAYBOOK_GET_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/playbooks/:id - Update playbook
router.patch('/:id', async (req, res) => {
  try {
    const user = extractUser(req);
    const id = parseInt(req.params.id, 10);
    const dto = UpdatePlaybookDTO.parse(req.body);
    const playbook = await service.updatePlaybook(id, dto, user.id);

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    res.json(playbook);
  } catch (error) {
    console.error('PLAYBOOK_UPDATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/playbooks/:id - Delete playbook
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await service.deletePlaybook(id);

    if (!deleted) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('PLAYBOOK_DELETE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Playbook Templates
// ==========================================================

// POST /api/playbooks/templates - Create template
router.post('/templates', async (req, res) => {
  try {
    const template = await service.createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('TEMPLATE_CREATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/playbooks/templates - List templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await service.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('TEMPLATE_LIST_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/playbooks/templates/:id - Get template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const template = await service.getTemplate(id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error('TEMPLATE_GET_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/playbooks/from-template/:templateId - Instantiate from template
router.post('/from-template/:templateId', async (req, res) => {
  try {
    const user = extractUser(req);
    const templateId = parseInt(req.params.templateId, 10);
    const dto = CreatePlaybookFromTemplateDTO.parse(req.body);
    const playbook = await service.instantiateFromTemplate(templateId, dto, user.id);
    res.status(201).json(playbook);
  } catch (error) {
    console.error('TEMPLATE_INSTANTIATE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Execution
// ==========================================================

// POST /api/playbooks/:id/execute - Execute playbook
router.post('/:id/execute', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const context = req.body.context || {};

    await service.executePlaybook(id, context);
    res.json({ success: true });
  } catch (error) {
    console.error('PLAYBOOK_EXECUTE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;