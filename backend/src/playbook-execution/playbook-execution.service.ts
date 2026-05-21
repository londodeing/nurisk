import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import {
  Playbook,
  PlaybookStep,
  Execution,
  ExecutionStep,
  ExecutionStatus,
  PlaybookSchema,
} from './playbook.schema';
import axios from 'axios';

@Injectable()
export class PlaybookExecutionService {
  private readonly logger = new Logger(PlaybookExecutionService.name);
  private readonly executions = new Map<string, Execution>();

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Create a new playbook
   */
  async createPlaybook(data: Partial<Playbook>): Promise<Playbook> {
    const playbook = PlaybookSchema.parse({
      ...data,
      id: `pb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    this.logger.log(`Created playbook: ${playbook.id}`);
    return playbook;
  }

  /**
   * Update a playbook
   */
  async updatePlaybook(id: string, data: Partial<Playbook>): Promise<Playbook> {
    // In production, fetch from database
    return { ...data, id } as Playbook;
  }

  /**
   * Delete a playbook
   */
  async deletePlaybook(id: string): Promise<void> {
    this.logger.log(`Deleted playbook: ${id}`);
  }

  /**
   * List all playbooks
   */
  async listPlaybooks(): Promise<Playbook[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Execute a playbook
   */
  async execute(
    playbookId: string,
    context: Record<string, any> = {},
    triggeredBy: string = 'manual'
  ): Promise<Execution> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Starting execution: ${executionId} for playbook: ${playbookId}`);

    // Create execution state
    const execution: Execution = {
      id: executionId,
      playbookId,
      playbookName: playbookId,
      status: ExecutionStatus.RUNNING,
      steps: [],
      context,
      triggeredBy,
      startedAt: new Date(),
    };

    this.executions.set(executionId, execution);

    // Execute in background
    this.runExecution(executionId).catch((err) => {
      this.logger.error(`Execution failed: ${executionId}`, err);
    });

    return execution;
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<Execution | null> {
    return this.executions.get(executionId) || null;
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    execution.status = ExecutionStatus.CANCELLED;
    execution.completedAt = new Date();

    this.logger.log(`Cancelled execution: ${executionId}`);
  }

  /**
   * Manual override - skip/step
   */
  async manualOverride(
    executionId: string,
    stepId: string,
    action: 'skip' | 'retry' | 'approve',
    data?: any
  ): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const step = execution.steps.find((s) => s.stepId === stepId);
    if (!step) return;

    if (action === 'skip') {
      step.status = ExecutionStatus.COMPLETED;
      step.completedAt = new Date();
      step.output = { manual_override: 'skipped' };
    } else if (action === 'retry') {
      step.status = ExecutionStatus.PENDING;
      step.retries = 0;
    } else if (action === 'approve') {
      step.output = { manual_override: 'approved', ...data };
    }

    this.logger.log(`Manual override on ${executionId}: ${action} step ${stepId}`);
  }

  /**
   * Run execution logic
   */
  private async runExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    try {
      // Get playbook steps (in production, fetch from database)
      const steps = await this.getPlaybookSteps(execution.playbookId);

      // Initialize step states
      execution.steps = steps.map((s) => ({
        stepId: s.id,
        status: ExecutionStatus.PENDING,
        retries: 0,
      }));

      // Execute steps in sequence
      for (const step of steps) {
        if (execution.status === ExecutionStatus.CANCELLED) break;

        execution.currentStepId = step.id;
        const stepState = execution.steps.find((s) => s.stepId === step.id)!;
        stepState.status = ExecutionStatus.RUNNING;
        stepState.startedAt = new Date();

        try {
          // Check dependencies
          await this.checkDependencies(step, execution);

          // Execute step
          const output = await this.executeStep(step, execution);

          stepState.status = ExecutionStatus.COMPLETED;
          stepState.completedAt = new Date();
          stepState.output = output;

          // Add to context
          execution.context[`step.${step.id}.output`] = output;
        } catch (error) {
          stepState.error = (error as Error).message;

          // Handle retry
          if (step.retry && stepState.retries < step.retry.maxAttempts) {
            stepState.retries++;
            await this.delay(step.retry.delay);
            continue;
          }

          // Handle failure
          if (step.onFailure === 'abort') {
            execution.status = ExecutionStatus.FAILED;
            execution.error = (error as Error).message;
            execution.completedAt = new Date();
            return;
          } else if (step.onFailure === 'continue') {
            stepState.status = ExecutionStatus.COMPLETED;
          } else {
            execution.status = ExecutionStatus.FAILED;
            execution.error = (error as Error).message;
            execution.completedAt = new Date();
            return;
          }
        }

        // Handle timeout
        if (step.timeout) {
          const timeoutPromise = this.delay(step.timeout);
          const stepPromise = Promise.resolve();

          await Promise.race([timeoutPromise, stepPromise]);
          stepState.status = ExecutionStatus.TIMED_OUT;
          execution.status = ExecutionStatus.TIMED_OUT;
          execution.error = `Step ${step.id} timed out`;
          execution.completedAt = new Date();
          return;
        }
      }

      execution.status = ExecutionStatus.COMPLETED;
      execution.completedAt = new Date();

      // Emit completion event
      this.eventEmitter.emit('playbook.completed', execution);
    } catch (error) {
      execution.status = ExecutionStatus.FAILED;
      execution.error = (error as Error).message;
      execution.completedAt = new Date();

      this.eventEmitter.emit('playbook.failed', execution);
    }
  }

  /**
   * Get playbook steps
   */
  private async getPlaybookSteps(playbookId: string): Promise<PlaybookStep[]> {
    // In production, fetch from database
    // For now, return sample steps
    return [
      {
        id: 'step-1',
        name: 'Assess Situation',
        type: 'action',
        config: { type: 'evaluate' },
      },
      {
        id: 'step-2',
        name: 'Check Weather',
        type: 'http',
        config: {
          url: process.env.WEATHER_API,
          method: 'GET',
        },
      },
      {
        id: 'step-3',
        name: 'Send Notification',
        type: 'notification',
        config: {
          channel: 'whatsapp',
          template: 'alert',
        },
      },
    ];
  }

  /**
   * Check step dependencies
   */
  private async checkDependencies(
    step: PlaybookStep,
    execution: Execution
  ): Promise<void> {
    const dependsOn = step.config?.dependsOn as string[] | undefined;
    if (!dependsOn) return;

    for (const depId of dependsOn) {
      const depStep = execution.steps.find((s) => s.stepId === depId);
      if (!depStep || depStep.status !== ExecutionStatus.COMPLETED) {
        throw new Error(`Dependency ${depId} not satisfied`);
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: PlaybookStep,
    execution: Execution
  ): Promise<any> {
    switch (step.type) {
      case 'action':
        return this.executeAction(step, execution);

      case 'condition':
        return this.evaluateCondition(step, execution);

      case 'delay':
        return this.delay(step.config?.duration as number || 1000);

      case 'notification':
        return this.sendNotification(step, execution);

      case 'http':
        return this.executeHttp(step, execution);

      case 'script':
        return this.executeScript(step, execution);

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute action step
   */
  private async executeAction(
    step: PlaybookStep,
    execution: Execution
  ): Promise<any> {
    const actionType = step.config?.type as string;

    if (actionType === 'evaluate') {
      return { result: 'evaluated', context: execution.context };
    }

    return { action: actionType };
  }

  /**
   * Evaluate condition
   */
  private async evaluateCondition(
    step: PlaybookStep,
    execution: Execution
  ): Promise<boolean> {
    const condition = step.config?.condition as Record<string, any>;
    if (!condition) return true;

    // Simple condition evaluation
    for (const [key, value] of Object.entries(condition)) {
      const contextValue = execution.context[key];
      if (contextValue !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send notification
   */
  private async sendNotification(
    step: PlaybookStep,
    execution: Execution
  ): Promise<any> {
    const channel = step.config?.channel as string;
    const template = step.config?.template as string;

    this.logger.log(`Sending ${channel} notification: ${template}`);

    // Emit notification event
    this.eventEmitter.emit('notification.send', {
      channel,
      template,
      context: execution.context,
    });

    return { sent: true, channel, template };
  }

  /**
   * Execute HTTP request
   */
  private async executeHttp(
    step: PlaybookStep,
    execution: Execution
  ): Promise<any> {
    const url = step.config?.url as string;
    const method = (step.config?.method as string) || 'GET';
    const headers = step.config?.headers as Record<string, string>;
    const body = step.config?.body;

    try {
      const response = await axios({
        url,
        method,
        headers,
        data: body,
        timeout: step.timeout || 30000,
      });

      return response.data;
    } catch (error) {
      throw new Error(`HTTP request failed: ${(error as Error).message}`);
    }
  }

  /**
   * Execute script
   */
  private async executeScript(
    step: PlaybookStep,
    execution: Execution
  ): Promise<any> {
    const script = step.config?.script as string;
    if (!script) return null;

    // In production, use a sandboxed executor
    // For now, return mock result
    return { scriptResult: 'executed' };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}