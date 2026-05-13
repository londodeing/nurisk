# Autonomous AI Agent System

This directory contains autonomous AI agents with automatic token management and role rotation capabilities.

## Architecture

### Agent Manager
- **File**: `agent-manager.js`
- **Purpose**: Centralized management of all AI agents
- **Features**:
  - Automatic agent rotation when tokens are exhausted
  - Health monitoring and failover
  - Task distribution and load balancing
  - Real-time status monitoring

### Aider Agent
- **Directory**: `aider-agent/`
- **Purpose**: Primary code assistant agent using Aider CLI
- **Features**:
  - Code generation and refactoring
  - Automatic code review
  - Documentation generation
  - Token usage monitoring
  - Seamless rotation to backup agents

## Configuration

### Token Management
Each agent monitors its token usage and automatically rotates when approaching limits:

```json
{
  "token_management": {
    "max_tokens_per_session": 100000,
    "warning_threshold": 80000,
    "rotation_threshold": 95000,
    "backup_agents": ["claude-agent", "gpt-agent", "gemini-agent"]
  }
}
```

### Rotation Strategy
1. **Primary Agent**: Aider agent handles initial requests
2. **Token Monitoring**: Continuous tracking of token usage
3. **Warning Phase**: Alert at 80% token usage
4. **Rotation Phase**: Automatic switch at 95% token usage
5. **Backup Agents**: Seamless handoff to available backup agents
6. **Reset Cycle**: Return to primary agent after cooldown

## API Endpoints

### Agent Status
```
GET /api/agents/aider/status
```
Returns current agent status, token count, and availability.

### Execute Task
```
POST /api/agents/aider/execute
{
  "type": "code_generation|code_review|refactoring|documentation",
  "prompt": "Task description",
  "files": ["file1.js", "file2.js"],
  "priority": "high|normal|low"
}
```

### Force Rotation
```
POST /api/agents/aider/rotate
{
  "reason": "manual_request"
}
```

### Execution Logs
```
GET /api/agents/aider/logs?sessionId=xxx&type=xxx&limit=100
```

## WebSocket Events

Real-time monitoring via Socket.IO:

- `agent:initialized` - Agent startup
- `agent:activated` - Agent becomes active
- `agent:deactivated` - Agent becomes inactive
- `agent:taskCompleted` - Task execution completed
- `agent:rotating` - Agent rotation in progress
- `agent:tokenWarning` - Token threshold warning

## Usage Examples

### Code Generation
```javascript
const task = {
  type: 'code_generation',
  prompt: 'Create a REST API endpoint for user authentication',
  files: ['routes/auth.js'],
  priority: 'high'
};

const result = await agentManager.executeTask(task);
```

### Code Review
```javascript
const task = {
  type: 'code_review',
  prompt: 'Review this code for security vulnerabilities',
  files: ['controllers/userController.js'],
  priority: 'normal'
};

const result = await agentManager.executeTask(task);
```

### Automatic Refactoring
```javascript
const task = {
  type: 'refactoring',
  prompt: 'Optimize database queries and add error handling',
  files: ['models/incident.js', 'controllers/incidentController.js'],
  priority: 'normal'
};

const result = await agentManager.executeTask(task);
```

## Integration with NURisk System

### Database Integration
Agents can access the NURisk database for:
- Reading incident data for analysis
- Generating reports and documentation
- Optimizing database queries
- Creating data validation scripts

### RBAC Integration
Agents respect the 10-tier role system:
- Code changes require appropriate permissions
- Audit logging for all agent actions
- Regional access control for data processing

### Map Layer Integration
Agents can assist with:
- WMS layer configuration optimization
- GeoJSON processing and validation
- Coordinate system transformations
- Performance optimization for map rendering

## Monitoring and Logging

### Execution Logs
All agent activities are logged in JSONL format:
```json
{
  "taskId": "task-1234567890",
  "type": "code_generation",
  "prompt": "Create API endpoint",
  "result": true,
  "tokenUsage": 1250,
  "timestamp": "2024-05-14T10:30:00Z",
  "sessionId": "aider-1234567890-abc123"
}
```

### Performance Metrics
- Token usage per session
- Task completion rates
- Agent rotation frequency
- Error rates and recovery times

## Backup Agent Configuration

### Claude Agent
- **Purpose**: Natural language processing and analysis
- **Strengths**: Complex reasoning and documentation
- **Token Limit**: 200,000 per session

### GPT Agent  
- **Purpose**: General-purpose code assistance
- **Strengths**: Broad knowledge and versatility
- **Token Limit**: 128,000 per session

### Gemini Agent
- **Purpose**: Multimodal analysis and optimization
- **Strengths**: Code analysis and performance optimization
- **Token Limit**: 1,000,000 per session

## Deployment

### Prerequisites
```bash
npm install aider-chat
pip install aider-chat
```

### Environment Variables
```env
AIDER_API_KEY=your_api_key
AGENT_WORKSPACE_DIR=/path/to/workspace
AGENT_LOG_LEVEL=info
```

### Starting the Agent System
```bash
cd agent
npm install
npm start
```

### Integration with Main Application
```javascript
const AgentManager = require('./agent/agent-manager');
const agentManager = new AgentManager();

// Use in Express routes
app.use('/api/agents', require('./agent/aider-agent/api-routes'));
```

## Security Considerations

1. **Token Security**: API keys stored in environment variables
2. **Access Control**: Agents respect RBAC permissions
3. **Audit Trail**: All actions logged with user attribution
4. **Sandboxing**: Agents operate in isolated workspaces
5. **Rate Limiting**: Token usage monitoring prevents abuse

## Troubleshooting

### Common Issues
1. **Agent Not Responding**: Check token limits and rotation status
2. **Task Failures**: Review execution logs for error details
3. **Rotation Loops**: Verify backup agent configurations
4. **Performance Issues**: Monitor token usage and optimize prompts

### Debug Commands
```bash
# Check agent status
curl http://localhost:7860/api/agents/aider/status

# View recent logs
curl http://localhost:7860/api/agents/aider/logs?limit=10

# Force rotation
curl -X POST http://localhost:7860/api/agents/aider/rotate \
  -H "Content-Type: application/json" \
  -d '{"reason": "debug_test"}'
```
