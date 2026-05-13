const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');
const DatabaseTaskHandler = require('./database-task-handler');

class AiderAgent extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.tokenCount = 0;
    this.isActive = false;
    this.currentSession = null;
    this.taskQueue = [];
    this.backupAgents = config.token_management.backup_agents;
    this.currentBackupIndex = 0;
    
    this.initializeAgent();
  }

  async initializeAgent() {
    console.log(`[AiderAgent] Initializing ${this.config.agent_name}...`);
    
    // Create workspace directory
    this.workspaceDir = path.join(__dirname, 'workspace');
    await this.ensureDirectory(this.workspaceDir);
    
    // Initialize database task handler
    this.databaseTaskHandler = new DatabaseTaskHandler(this.config);
    
    // Initialize session tracking
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    // Start monitoring
    this.startTokenMonitoring();
    
    this.emit('initialized', {
      agent: this.config.agent_name,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  async executeTask(task) {
    if (!this.isActive) {
      await this.activateAgent();
    }

    // Check token threshold before execution
    if (this.shouldRotate()) {
      await this.rotateToBackupAgent(task);
      return;
    }

    try {
      console.log(`[AiderAgent] Executing task: ${task.type}`);
      
      let result;
      
      // Handle database-specific tasks
      if (this.isDatabaseTask(task)) {
        result = await this.databaseTaskHandler.handleDatabaseTask(task);
      } else {
        // Handle regular aider tasks
        result = await this.runAiderCommand(task);
      }
      
      this.tokenCount += this.estimateTokenUsage(task, result);
      
      // Log task completion
      await this.logTaskExecution(task, result);
      
      this.emit('taskCompleted', {
        taskId: task.id,
        result: result,
        tokenCount: this.tokenCount,
        timestamp: new Date().toISOString()
      });

      return result;
      
    } catch (error) {
      console.error(`[AiderAgent] Task execution failed:`, error);
      
      // Try backup agent on failure
      if (task.retryCount < this.config.operational_parameters.error_retry_count) {
        task.retryCount = (task.retryCount || 0) + 1;
        return await this.rotateToBackupAgent(task);
      }
      
      throw error;
    }
  }

  isDatabaseTask(task) {
    const databaseTaskTypes = [
      'schema_analysis',
      'migration_planning', 
      'schema_modification',
      'seed_data_creation',
      'query_optimization'
    ];
    
    return databaseTaskTypes.includes(task.type);
  }

  async runAiderCommand(task) {
    return new Promise((resolve, reject) => {
      const aiderArgs = this.buildAiderArgs(task);
      
      console.log(`[AiderAgent] Running: aider ${aiderArgs.join(' ')}`);
      
      const aiderProcess = spawn('aider', aiderArgs, {
        cwd: this.workspaceDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      aiderProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      aiderProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Send task input to aider
      if (task.input) {
        aiderProcess.stdin.write(task.input + '\n');
      }
      
      aiderProcess.stdin.end();

      aiderProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdout,
            code: code,
            timestamp: new Date().toISOString()
          });
        } else {
          reject(new Error(`Aider process failed with code ${code}: ${stderr}`));
        }
      });

      // Timeout handling
      setTimeout(() => {
        aiderProcess.kill('SIGTERM');
        reject(new Error('Aider process timeout'));
      }, this.config.operational_parameters.session_timeout * 1000);
    });
  }

  buildAiderArgs(task) {
    const args = [];
    
    // Basic aider configuration
    args.push('--no-git');
    args.push('--yes');
    
    // Task-specific arguments
    switch (task.type) {
      case 'code_generation':
        args.push('--message', task.prompt);
        if (task.files) {
          args.push(...task.files);
        }
        break;
        
      case 'code_review':
        args.push('--review');
        args.push('--message', `Review: ${task.prompt}`);
        if (task.files) {
          args.push(...task.files);
        }
        break;
        
      case 'refactoring':
        args.push('--message', `Refactor: ${task.prompt}`);
        if (task.files) {
          args.push(...task.files);
        }
        break;
        
      case 'documentation':
        args.push('--message', `Document: ${task.prompt}`);
        args.push('--doc');
        break;
        
      default:
        args.push('--message', task.prompt);
    }
    
    return args;
  }

  shouldRotate() {
    return this.tokenCount >= this.config.token_management.rotation_threshold;
  }

  async rotateToBackupAgent(task) {
    console.log(`[AiderAgent] Token threshold reached (${this.tokenCount}). Rotating to backup agent...`);
    
    // Save current state
    await this.saveAgentState();
    
    // Get next backup agent
    const backupAgent = this.getNextBackupAgent();
    
    this.emit('rotating', {
      from: this.config.agent_name,
      to: backupAgent,
      tokenCount: this.tokenCount,
      task: task.id
    });
    
    // Deactivate current agent
    await this.deactivateAgent();
    
    // Execute task with backup agent
    return await this.executeWithBackupAgent(backupAgent, task);
  }

  async executeWithBackupAgent(backupAgentName, task) {
    try {
      // Load backup agent configuration
      const backupConfig = await this.loadBackupAgentConfig(backupAgentName);
      
      // Create backup agent instance
      const BackupAgentClass = require(`../${backupAgentName}/${backupAgentName}-controller.js`);
      const backupAgent = new BackupAgentClass(backupConfig);
      
      // Transfer task to backup agent
      const result = await backupAgent.executeTask(task);
      
      console.log(`[AiderAgent] Task successfully executed by backup agent: ${backupAgentName}`);
      
      return result;
      
    } catch (error) {
      console.error(`[AiderAgent] Backup agent execution failed:`, error);
      
      // Try next backup agent
      this.currentBackupIndex = (this.currentBackupIndex + 1) % this.backupAgents.length;
      
      if (this.currentBackupIndex === 0) {
        // All backup agents tried, reset and retry with original
        await this.resetAgent();
        return await this.executeTask(task);
      }
      
      const nextBackup = this.getNextBackupAgent();
      return await this.executeWithBackupAgent(nextBackup, task);
    }
  }

  getNextBackupAgent() {
    const agent = this.backupAgents[this.currentBackupIndex];
    this.currentBackupIndex = (this.currentBackupIndex + 1) % this.backupAgents.length;
    return agent;
  }

  async loadBackupAgentConfig(agentName) {
    const configPath = path.join(__dirname, '..', agentName, 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  }

  estimateTokenUsage(task, result) {
    // Simple token estimation based on input/output length
    const inputTokens = (task.prompt?.length || 0) / 4;
    const outputTokens = (result.output?.length || 0) / 4;
    return Math.ceil(inputTokens + outputTokens);
  }

  startTokenMonitoring() {
    setInterval(() => {
      if (this.tokenCount >= this.config.token_management.warning_threshold) {
        this.emit('tokenWarning', {
          current: this.tokenCount,
          threshold: this.config.token_management.warning_threshold,
          max: this.config.token_management.max_tokens_per_session
        });
      }
    }, 10000); // Check every 10 seconds
  }

  async activateAgent() {
    this.isActive = true;
    console.log(`[AiderAgent] Agent activated - Session: ${this.sessionId}`);
    
    this.emit('activated', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  async deactivateAgent() {
    this.isActive = false;
    console.log(`[AiderAgent] Agent deactivated - Session: ${this.sessionId}`);
    
    this.emit('deactivated', {
      sessionId: this.sessionId,
      tokenCount: this.tokenCount,
      timestamp: new Date().toISOString()
    });
  }

  async resetAgent() {
    console.log(`[AiderAgent] Resetting agent...`);
    
    this.tokenCount = 0;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.currentBackupIndex = 0;
    
    await this.activateAgent();
  }

  async saveAgentState() {
    const state = {
      sessionId: this.sessionId,
      tokenCount: this.tokenCount,
      startTime: this.startTime,
      taskQueue: this.taskQueue,
      currentBackupIndex: this.currentBackupIndex,
      timestamp: new Date().toISOString()
    };
    
    const statePath = path.join(this.workspaceDir, 'agent-state.json');
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }

  async logTaskExecution(task, result) {
    const logEntry = {
      taskId: task.id,
      type: task.type,
      prompt: task.prompt,
      result: result.success,
      tokenUsage: this.estimateTokenUsage(task, result),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };
    
    const logPath = path.join(this.workspaceDir, 'execution-log.jsonl');
    await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  generateSessionId() {
    return `aider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getStatus() {
    return {
      agent: this.config.agent_name,
      sessionId: this.sessionId,
      isActive: this.isActive,
      tokenCount: this.tokenCount,
      maxTokens: this.config.token_management.max_tokens_per_session,
      uptime: Date.now() - this.startTime,
      taskQueueLength: this.taskQueue.length,
      currentBackupIndex: this.currentBackupIndex
    };
  }
}

module.exports = AiderAgent;
