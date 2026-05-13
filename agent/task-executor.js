const AgentManager = require('./agent-manager');

class TaskExecutor {
  constructor() {
    this.agentManager = new AgentManager();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.agentManager.on('taskCompleted', (data) => {
      console.log(`[TaskExecutor] Task ${data.taskId} completed by ${data.agent}`);
    });

    this.agentManager.on('taskFailed', (data) => {
      console.log(`[TaskExecutor] Task ${data.taskId} failed on ${data.agent}: ${data.error}`);
    });

    this.agentManager.on('agentActivated', (data) => {
      console.log(`[TaskExecutor] Agent ${data.agent} activated`);
    });
  }

  async executeCodeTask(prompt, files = [], options = {}) {
    const task = {
      type: 'code_generation',
      prompt: prompt,
      files: files,
      context: options.context || {},
      model: options.model,
      flags: options.flags,
      workingDir: options.workingDir
    };

    return await this.agentManager.queueTask(task);
  }

  async executeRefactorTask(prompt, files = [], options = {}) {
    const task = {
      type: 'refactoring',
      prompt: prompt,
      files: files,
      context: options.context || {},
      model: options.model,
      flags: options.flags,
      workingDir: options.workingDir
    };

    return await this.agentManager.queueTask(task);
  }

  async executeReviewTask(prompt, files = [], options = {}) {
    const task = {
      type: 'code_review',
      prompt: prompt,
      files: files,
      context: options.context || {},
      model: options.model,
      flags: options.flags,
      workingDir: options.workingDir
    };

    return await this.agentManager.queueTask(task);
  }

  async executeMigrationTask(prompt, files = [], options = {}) {
    const task = {
      type: 'migration_tasks',
      prompt: prompt,
      files: files,
      context: options.context || { directory: 'apps/backend' },
      model: options.model,
      flags: options.flags,
      workingDir: options.workingDir
    };

    return await this.agentManager.queueTask(task);
  }

  async executeApiTask(prompt, files = [], options = {}) {
    const task = {
      type: 'api_development',
      prompt: prompt,
      files: files,
      context: options.context || { directory: 'apps/backend' },
      model: options.model,
      flags: options.flags,
      workingDir: options.workingDir
    };

    return await this.agentManager.queueTask(task);
  }

  async executeSchemaAnalysis(options = {}) {
    const task = {
      type: 'schema_analysis',
      prompt: 'Analyze the current Prisma schema',
      context: options.context || { directory: 'apps/backend' },
      data: options.data || {}
    };

    return await this.agentManager.queueTask(task);
  }

  async executeMigrationPlanning(requirements, options = {}) {
    const task = {
      type: 'migration_planning',
      prompt: 'Plan database migration',
      context: options.context || { directory: 'apps/backend' },
      data: {
        requirements: requirements,
        ...options.data
      }
    };

    return await this.agentManager.queueTask(task);
  }

  async executeSchemaModification(modifications, options = {}) {
    const task = {
      type: 'schema_modification',
      prompt: 'Modify Prisma schema',
      context: options.context || { directory: 'apps/backend' },
      data: {
        modifications: modifications,
        backupFirst: options.backupFirst !== false
      }
    };

    return await this.agentManager.queueTask(task);
  }

  async executeSeedDataCreation(entities, options = {}) {
    const task = {
      type: 'seed_data_creation',
      prompt: 'Create seed data',
      context: options.context || { directory: 'apps/backend' },
      data: {
        entities: entities,
        dataType: options.dataType || 'reference'
      }
    };

    return await this.agentManager.queueTask(task);
  }

  async executeQueryOptimization(queryPatterns, options = {}) {
    const task = {
      type: 'query_optimization',
      prompt: 'Optimize database queries',
      context: options.context || { directory: 'apps/backend' },
      data: {
        queryPatterns: queryPatterns,
        performanceTargets: options.performanceTargets || {}
      }
    };

    return await this.agentManager.queueTask(task);
  }

  async executeCustomTask(taskType, prompt, files = [], options = {}) {
    const task = {
      type: taskType,
      prompt: prompt,
      files: files,
      context: options.context || {},
      model: options.model,
      flags: options.flags,
      workingDir: options.workingDir
    };

    return await this.agentManager.queueTask(task);
  }

  getSystemStatus() {
    return this.agentManager.getSystemStatus();
  }

  async rotateAgent(reason = 'manual') {
    return await this.agentManager.rotateAgent(reason);
  }
}

module.exports = TaskExecutor;
