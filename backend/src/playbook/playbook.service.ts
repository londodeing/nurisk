/**
 * Playbook Service
 * ============
 * Business logic for playbook management
 */

import { Pool } from 'pg';
import { PlaybookRepository } from './playbook.repository';
import { ListResponse } from '@nurisk/shared-types';
import {
  Playbook,
  PlaybookTemplate,
  PlaybookQueryParams,
  CreatePlaybookDTO,
  UpdatePlaybookDTO,
  CreatePlaybookFromTemplateDTO,
  substituteVariables,
} from './models';

export class PlaybookService {
  private repository: PlaybookRepository;

  constructor(pool: Pool) {
    this.repository = new PlaybookRepository(pool);
  }

  // ==========================================================
  // Playbook Operations
  // ==========================================================

  async createPlaybook(dto: CreatePlaybookDTO): Promise<Playbook> {
    // Validate steps order
    const orders = dto.steps.map((s) => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Duplicate step orders are not allowed');
    }

    // Sort steps by order
    const sortedSteps = [...dto.steps].sort((a, b) => a.order - b.order);

    return this.repository.create({
      ...dto,
      steps: sortedSteps,
      created_by: dto.created_by,
      updated_by: dto.created_by,
    });
  }

  async getPlaybook(id: number): Promise<Playbook | null> {
    return this.repository.getById(id);
  }

  async getPlaybooks(params: PlaybookQueryParams): Promise<ListResponse<Playbook>> {
    return this.repository.findAll(params);
  }

  async updatePlaybook(id: number, dto: UpdatePlaybookDTO, updatedBy: number): Promise<Playbook | null> {
    // Validate steps order if provided
    if (dto.steps) {
      const orders = dto.steps.map((s) => s.order);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        throw new Error('Duplicate step orders are not allowed');
      }

      // Sort steps by order
      dto.steps = [...dto.steps].sort((a, b) => a.order - b.order);
    }

    return this.repository.update(id, dto, updatedBy);
  }

  async deletePlaybook(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }

  // ==========================================================
  // Template Operations
  // ==========================================================

  async createTemplate(
    template: Omit<PlaybookTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PlaybookTemplate> {
    // Validate steps order
    const orders = template.steps.map((s) => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Duplicate step orders are not allowed');
    }

    // Sort steps by order
    const sortedSteps = [...template.steps].sort((a, b) => a.order - b.order);

    return this.repository.createTemplate({
      ...template,
      steps: sortedSteps,
    });
  }

  async getTemplate(id: number): Promise<PlaybookTemplate | null> {
    return this.repository.getTemplateById(id);
  }

  async getTemplates(): Promise<PlaybookTemplate[]> {
    return this.repository.findAllTemplates();
  }

  async instantiateFromTemplate(
    templateId: number,
    dto: CreatePlaybookFromTemplateDTO,
    createdBy: number
  ): Promise<Playbook> {
    const template = await this.repository.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate required variables
    for (const variable of template.variables || []) {
      if (variable.required && !dto.variables[variable.name]) {
        throw new Error(`Required variable "${variable.name}" is missing`);
      }
    }

    // Substitute variables in step configs
    const variables = {
      ...Object.fromEntries(
        (template.variables || []).map((v) => [v.name, v.default_value])
      ),
      ...dto.variables,
    };

    const substitutedSteps = template.steps.map((step) => ({
      ...step,
      config: substituteVariables(step.config as Record<string, unknown>, variables),
    }));

    return this.repository.create({
      name: dto.name,
      description: dto.description || '',
      disaster_type: template.disaster_type,
      status: 'DRAFT',
      steps: substitutedSteps,
      triggers: [],
      created_by: createdBy,
      updated_by: createdBy,
    });
  }

  // ==========================================================
  // Execution
  // ==========================================================

  async executePlaybook(playbookId: number, context: Record<string, unknown>): Promise<void> {
    const playbook = await this.repository.getById(playbookId);
    if (!playbook) {
      throw new Error(`Playbook ${playbookId} not found`);
    }

    if (playbook.status !== 'ACTIVE') {
      throw new Error('Playbook is not active');
    }

    // Execute each step
    for (const step of playbook.steps) {
      await this.executeStep(step, context);
    }
  }

  private async executeStep(
    step: { action_type: string; config: Record<string, unknown>; on_failure: string },
    context: Record<string, unknown>
  ): Promise<void> {
    try {
      // Substitute variables in config
      const config = substituteVariables(step.config, context);

      switch (step.action_type) {
        case 'NOTIFY':
          await this.executeNotify(config);
          break;
        case 'ESCALATE':
          await this.executeEscalate(config);
          break;
        case 'ASSIGN_VOLUNTEER':
          await this.executeAssignVolunteer(config);
          break;
        case 'CREATE_TASK':
          await this.executeCreateTask(config);
          break;
        case 'SEND_BROADCAST':
          await this.executeBroadcast(config);
          break;
        case 'UPDATE_STATUS':
          await this.executeUpdateStatus(config);
          break;
        case 'WAIT':
          await this.executeWait(config);
          break;
        case 'HTTP_REQUEST':
          await this.executeHttpRequest(config);
          break;
        case 'WEBHOOK':
          await this.executeWebhook(config);
          break;
        default:
          console.log(`Unknown action type: ${step.action_type}`);
      }
    } catch (error) {
      if (step.on_failure === 'STOP') {
        throw error;
      }
      console.error(`Step failed: ${error}`);
    }
  }

  private async executeNotify(config: Record<string, unknown>): Promise<void> {
    console.log('NOTIFY:', config);
  }

  private async executeEscalate(config: Record<string, unknown>): Promise<void> {
    console.log('ESCALATE:', config);
  }

  private async executeAssignVolunteer(config: Record<string, unknown>): Promise<void> {
    console.log('ASSIGN_VOLUNTEER:', config);
  }

  private async executeCreateTask(config: Record<string, unknown>): Promise<void> {
    console.log('CREATE_TASK:', config);
  }

  private async executeBroadcast(config: Record<string, unknown>): Promise<void> {
    console.log('SEND_BROADCAST:', config);
  }

  private async executeUpdateStatus(config: Record<string, unknown>): Promise<void> {
    console.log('UPDATE_STATUS:', config);
  }

  private async executeWait(config: Record<string, unknown>): Promise<void> {
    const seconds = (config.seconds as number) || 60;
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  private async executeHttpRequest(config: Record<string, unknown>): Promise<void> {
    console.log('HTTP_REQUEST:', config);
  }

  private async executeWebhook(config: Record<string, unknown>): Promise<void> {
    console.log('WEBHOOK:', config);
  }
}