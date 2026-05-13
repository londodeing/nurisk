# T02 - Define Agent Interfaces

**Task**: Create standardized interfaces for autonomous agent integration

**Agent Types** (based on mainprd.md analysis):
1. **Incident Processing Agent**: Auto-categorize and score incidents
2. **Data Scraping Agent**: Monitor intel_news and external sources
3. **Volunteer Coordination Agent**: Optimize deployment based on expertise/location
4. **Emergency Response Agent**: Trigger alerts and coordinate response
5. **Assessment Automation Agent**: Process building assessments and damage scoring

**Standard Agent Interface**:
```js
class BaseAgent {
  constructor(config) {
    this.name = config.name;
    this.database = config.database;
    this.apiEndpoints = config.apiEndpoints;
  }
  
  async process(input) { /* Override in subclass */ }
  async getStatus() { /* Health check */ }
  async configure(settings) { /* Runtime config */ }
}
```

**Database Integration Pattern**:
- Agents read from specific tables
- Write results to designated fields
- Use transactions for data consistency
- Log all agent actions to audit_logs

**API Requirements**:
- GET /api/agents/status - Agent health monitoring
- POST /api/agents/trigger - Manual agent execution
- GET /api/agents/logs - Agent activity logs
- PUT /api/agents/config - Runtime configuration

**Success Criteria**:
- Base agent interface defined
- Database integration pattern established
- API endpoints specified
- Logging mechanism implemented
- Configuration management ready

**Estimated Time**: 5 hours
