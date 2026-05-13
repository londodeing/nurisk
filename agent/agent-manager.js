const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class AgentManager extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.activeAgent = null;
    this.rotationQueue = [];
    this.isRotating = false;
    
    this.initializeManager();
  }

  async initializeManager() {
    console.log('[AgentManager] Initializing agent management system...');
    
    // Load all available agents
    await this.loadAvailableAgents();
    
    // Start with aider agent as primary
    await this.activateAgent('aider-agent');
    
    // Setup rotation monitoring
    this.setupRotationMonitoring();
    
    console.log('[AgentManager] Agent management system initialized');
  }

  async loadAvailableAgents() {
    const agentDir = __dirname;
    const entries = await fs.readdir(agentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith('-agent')) {
        try {
          const configPath = path.join(agentDir, entry.name, 'config.json');
          const configData = await fs.readFile(configPath, 'utf8');
          const config = JSON.parse(configData);
          
          // Load agent controller
          const AgentClass = require(path.join(agentDir, entry.name, `${entry.name.replace('-agent', '')}-controller.js`));
          const agent = new AgentClass(config);
          
          this.agents.set(entry.name, {
            instance: agent,
            config: config,
            isActive: false,
            lastUsed: null,
            tokenCount: 0
          });
          
          console.log(`[AgentManager] Loaded agent: ${entry.name}`);
          
        } catch (error) {
          console.error(`[AgentManager] Failed to load agent ${entry.name}:`, error.message);
        }
      }
    }
  }

  async activateAgent(agentName) {
    if (this.isRotating) {
      console.log('[AgentManager] Rotation in progress, queuing activation request');
      this.rotationQueue.push(agentName);
      return;
    }

    const agentData = this.agents.get(agentName);
    if (!agentData) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Deactivate current agent if any
    if (this.activeAgent) {
      await this.deactivateCurrentAgent();
    }

    // Activate new agent
    agentData.isActive = true;
    agentData.lastUsed = Date.now();
    this.activeAgent = agentName;

    await agentData.instance.activateAgent();

    console.log(`[AgentManager] Activated agent: ${agentName}`);
    
    this.emit('agentActivated', {
      agent: agentName,
      timestamp: new Date().toISOString()
    });
  }

  async deactivateCurrentAgent() {
    if (!this.activeAgent) return;

    const agentData = this.agents.get(this.activeAgent);
    if (agentData) {
      agentData.isActive = false;
      await agentData.instance.deactivateAgent();
    }

    console.log(`[AgentManager] Deactivated agent: ${this.activeAgent}`);
    
    this.emit('agentDeactivated', {
      agent: this.activeAgent,
      timestamp: new Date().toISOString()
    });

    this.activeAgent = null;
  }

  async rotateAgent(reason = 'automatic') {
    if (this.isRotating) {
      console.log('[AgentManager] Rotation already in progress');
      return;
    }

    this.isRotating = true;
    
    try {
      console.log(`[AgentManager] Starting agent rotation - Reason: ${reason}`);
      
      const currentAgent = this.activeAgent;
      const nextAgent = this.selectNextAgent();
      
      if (!nextAgent) {
        console.log('[AgentManager] No available agents for rotation');
        this.isRotating = false;
        return;
      }

      this.emit('rotationStarted', {
        from: currentAgent,
        to: nextAgent,
        reason: reason,
        timestamp: new Date().toISOString()
      });

      // Perform rotation
      await this.activateAgent(nextAgent);
      
      this.emit('rotationCompleted', {
        from: currentAgent,
        to: nextAgent,
        timestamp: new Date().toISOString()
      });

      console.log(`[AgentManager] Agent rotation completed: ${currentAgent} -> ${nextAgent}`);
      
    } catch (error) {
      console.error('[AgentManager] Agent rotation failed:', error);
      
      this.emit('rotationFailed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
    } finally {
      this.isRotating = false;
      
      // Process queued rotations
      if (this.rotationQueue.length > 0) {
        const nextAgentName = this.rotationQueue.shift();
        setTimeout(() => this.activateAgent(nextAgentName), 1000);
      }
    }
  }

  selectNextAgent() {
    const availableAgents = Array.from(this.agents.entries())
      .filter(([name, data]) => name !== this.activeAgent)
      .sort((a, b) => {
        // Prioritize agents that haven't been used recently
        const aLastUsed = a[1].lastUsed || 0;
        const bLastUsed = b[1].lastUsed || 0;
        return aLastUsed - bLastUsed;
      });

    return availableAgents.length > 0 ? availableAgents[0][0] : null;
  }

  setupRotationMonitoring() {
    // Monitor all agents for token exhaustion
    for (const [agentName, agentData] of this.agents) {
      agentData.instance.on('tokenWarning', (data) => {
        console.log(`[AgentManager] Token warning from ${agentName}:`, data);
        
        this.emit('tokenWarning', {
          agent: agentName,
          ...data
        });
      });

      agentData.instance.on('rotating', (data) => {
        console.log(`[AgentManager] Agent ${agentName} requesting rotation`);
        this.rotateAgent('token_exhaustion');
      });
    }

    // Periodic health check
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  async performHealthCheck() {
    if (!this.activeAgent) return;

    const agentData = this.agents.get(this.activeAgent);
    if (!agentData) return;

    const status = agentData.instance.getStatus();
    
    // Check if rotation is needed
    if (status.tokenCount >= agentData.config.token_management.rotation_threshold) {
      console.log(`[AgentManager] Health check triggered rotation for ${this.activeAgent}`);
      await this.rotateAgent('health_check');
    }
  }

  async executeTask(task) {
    if (!this.activeAgent) {
      throw new Error('No active agent available');
    }

    const agentData = this.agents.get(this.activeAgent);
    if (!agentData) {
      throw new Error(`Active agent ${this.activeAgent} not found`);
    }

    try {
      return await agentData.instance.executeTask(task);
    } catch (error) {
      console.error(`[AgentManager] Task execution failed on ${this.activeAgent}:`, error);
      
      // Try rotation and retry
      await this.rotateAgent('task_failure');
      
      if (this.activeAgent) {
        const newAgentData = this.agents.get(this.activeAgent);
        return await newAgentData.instance.executeTask(task);
      }
      
      throw error;
    }
  }

  getSystemStatus() {
    const agentStatuses = {};
    
    for (const [name, data] of this.agents) {
      agentStatuses[name] = {
        ...data.instance.getStatus(),
        isActive: data.isActive,
        lastUsed: data.lastUsed
      };
    }

    return {
      activeAgent: this.activeAgent,
      isRotating: this.isRotating,
      rotationQueueLength: this.rotationQueue.length,
      totalAgents: this.agents.size,
      agents: agentStatuses,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AgentManager;
