/**
 * Playbook Controller
 * ===============
 * REST API endpoints for playbook management
 */

import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Pool } from 'pg';
import { PlaybookService } from './playbook.service';
import {
  CreatePlaybookDTO,
  UpdatePlaybookDTO,
  CreatePlaybookFromTemplateDTO,
  PlaybookQueryParams,
} from './models';
import { authenticate, requirePermissions } from '../auth/middleware/auth.js';

/**
 * JWT User type from decoded token
 */
interface JwtUser {
  id: number;
  username: string;
  role: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Helper to extract user ID from request (handles Express.User type)
 * Returns 0 as default when user is not present
 */
function getUserId(req: Request): number {
  const user = req.user as JwtUser | undefined;
  return user?.id ?? 0;
}

/**
 * Helper to extract a single string from query param (handles Express query param types)
 */
function getQueryString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

/**
 * Helper to extract route param as number (handles string | string[])
 */
function getRouteParam(req: Request, paramName: string): number {
  const value = req.params[paramName];
  if (!value) return 0;
  const strValue = Array.isArray(value) ? value[0] : value;
  const parsed = parseInt(strValue, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function createPlaybookController(pool: Pool): Router {
  const router = Router();
  const service = new PlaybookService(pool);

  // ==========================================================
  // Playbook CRUD
  // ==========================================================

  /**
   * POST /playbooks
   * Create a new playbook
   */
  router.post(
    '/',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const dto = CreatePlaybookDTO.parse(req.body);
      const playbook = await service.createPlaybook({
        ...dto,
        created_by: getUserId(req),
      });
      res.status(201).json(playbook);
    })
  );

  /**
   * GET /playbooks
   * List all playbooks with filters
   */
  router.get(
    '/',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const params = PlaybookQueryParams.parse({
        disaster_type: getQueryString(req.query.disaster_type),
        status: getQueryString(req.query.status),
        version: req.query.version ? parseInt(getQueryString(req.query.version) || '', 10) : undefined,
        page: req.query.page ? parseInt(getQueryString(req.query.page) || '', 10) : 1,
        limit: req.query.limit ? parseInt(getQueryString(req.query.limit) || '', 10) : 20,
      });

      const result = await service.getPlaybooks(params);
      res.json(result);
    })
  );

  /**
   * GET /playbooks/:id
   * Get playbook by ID
   */
  router.get(
    '/:id',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const id = getRouteParam(req, 'id');
      const playbook = await service.getPlaybook(id);

      if (!playbook) {
        res.status(404).json({ error: 'Playbook not found' });
        return;
      }

      res.json(playbook);
    })
  );

  /**
   * PATCH /playbooks/:id
   * Update playbook (increments version)
   */
  router.patch(
    '/:id',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const id = getRouteParam(req, 'id');
      const dto = UpdatePlaybookDTO.parse(req.body);
      const playbook = await service.updatePlaybook(id, dto, getUserId(req));

      if (!playbook) {
        res.status(404).json({ error: 'Playbook not found' });
        return;
      }

      res.json(playbook);
    })
  );

  /**
   * DELETE /playbooks/:id
   * Delete playbook
   */
  router.delete(
    '/:id',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const id = getRouteParam(req, 'id');
      const deleted = await service.deletePlaybook(id);

      if (!deleted) {
        res.status(404).json({ error: 'Playbook not found' });
        return;
      }

      res.status(204).send();
    })
  );

  // ==========================================================
  // Playbook Templates
  // ==========================================================

  /**
   * POST /playbooks/templates
   * Create a new template
   */
  router.post(
    '/templates',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const template = await service.createTemplate(req.body);
      res.status(201).json(template);
    })
  );

  /**
   * GET /playbooks/templates
   * List all templates
   */
  router.get(
    '/templates',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const templates = await service.getTemplates();
      res.json(templates);
    })
  );

  /**
   * GET /playbooks/templates/:id
   * Get template by ID
   */
  router.get(
    '/templates/:id',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const id = getRouteParam(req, 'id');
      const template = await service.getTemplate(id);

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      res.json(template);
    })
  );

  /**
   * POST /playbooks/from-template/:templateId
   * Instantiate playbook from template
   */
  router.post(
    '/from-template/:templateId',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const templateId = getRouteParam(req, 'templateId');
      const dto = CreatePlaybookFromTemplateDTO.parse(req.body);
      const playbook = await service.instantiateFromTemplate(templateId, dto, getUserId(req));
      res.status(201).json(playbook);
    })
  );

  // ==========================================================
  // Execution
  // ==========================================================

  /**
   * POST /playbooks/:id/execute
   * Execute a playbook
   */
  router.post(
    '/:id/execute',
    authenticate,
    requirePermissions(['playbooks']),
    asyncHandler(async (req: Request, res: Response) => {
      const id = getRouteParam(req, 'id');
      const context = req.body.context || {};

      await service.executePlaybook(id, context);
      res.json({ success: true });
    })
  );

  return router;
}