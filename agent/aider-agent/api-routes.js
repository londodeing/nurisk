const express = require('express');
const AiderAgent = require('./aider-controller');
const config = require('./config.json');

const router = express.Router();
const aiderAgent = new AiderAgent(config);

// Agent status endpoint
router.get('/status', (req, res) => {
  try {
    const status = aiderAgent.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute task endpoint
router.post('/execute', async (req, res) => {
  try {
    const { type, prompt, files, priority } = req.body;
    
    if (!type || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, prompt'
      });
    }
    
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      prompt: prompt,
      files: files || [],
      priority: priority || 'normal',
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    // Execute task asynchronously
    const result = await aiderAgent.executeTask(task);
    
    res.json({
      success: true,
      taskId: task.id,
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Force rotation endpoint
router.post('/rotate', async (req, res) => {
  try {
    const { reason } = req.body;
    
    console.log(`[AiderAgent] Manual rotation requested: ${reason || 'No reason provided'}`);
    
    // Create dummy task to trigger rotation
    const rotationTask = {
      id: `rotation-${Date.now()}`,
      type: 'system',
      prompt: 'Manual rotation request',
      timestamp: new Date().toISOString()
    };
    
    await aiderAgent.rotateToBackupAgent(rotationTask);
    
    res.json({
      success: true,
      message: 'Agent rotation initiated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get execution logs
router.get('/logs', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const logPath = path.join(__dirname, 'workspace', 'execution-log.jsonl');
    
    try {
      const logData = await fs.readFile(logPath, 'utf8');
      const logs = logData.trim().split('\n').map(line => JSON.parse(line));
      
      // Apply filters if provided
      let filteredLogs = logs;
      
      if (req.query.sessionId) {
        filteredLogs = filteredLogs.filter(log => log.sessionId === req.query.sessionId);
      }
      
      if (req.query.type) {
        filteredLogs = filteredLogs.filter(log => log.type === req.query.type);
      }
      
      // Limit results
      const limit = parseInt(req.query.limit) || 100;
      filteredLogs = filteredLogs.slice(-limit);
      
      res.json({
        success: true,
        logs: filteredLogs,
        total: filteredLogs.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (fileError) {
      res.json({
        success: true,
        logs: [],
        total: 0,
        message: 'No logs found',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// WebSocket events for real-time monitoring
router.ws = (io) => {
  // Listen to agent events and broadcast via WebSocket
  aiderAgent.on('initialized', (data) => {
    io.emit('agent:initialized', data);
  });
  
  aiderAgent.on('activated', (data) => {
    io.emit('agent:activated', data);
  });
  
  aiderAgent.on('deactivated', (data) => {
    io.emit('agent:deactivated', data);
  });
  
  aiderAgent.on('taskCompleted', (data) => {
    io.emit('agent:taskCompleted', data);
  });
  
  aiderAgent.on('rotating', (data) => {
    io.emit('agent:rotating', data);
  });
  
  aiderAgent.on('tokenWarning', (data) => {
    io.emit('agent:tokenWarning', data);
  });
};

module.exports = router;
