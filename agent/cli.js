#!/usr/bin/env node

const TaskExecutor = require('./task-executor');
const readline = require('readline');
const path = require('path');

class AgentCLI {
  constructor() {
    this.taskExecutor = new TaskExecutor();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🤖 Agent System CLI Started');
    console.log('Available commands:');
    console.log('  code <prompt> [files...]     - Generate code');
    console.log('  refactor <prompt> [files...] - Refactor code');
    console.log('  review <prompt> [files...]   - Review code');
    console.log('  migrate <prompt> [files...]  - Migration task');
    console.log('  api <prompt> [files...]      - API development');
    console.log('  db:analyze                   - Analyze database schema');
    console.log('  db:plan <requirements>       - Plan database migration');
    console.log('  db:seed <entities>           - Create seed data');
    console.log('  status                       - Show system status');
    console.log('  rotate                       - Rotate agent');
    console.log('  exit                         - Exit CLI');
    console.log('');

    this.promptUser();
  }

  promptUser() {
    this.rl.question('agent> ', async (input) => {
      try {
        await this.processCommand(input.trim());
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      if (input.trim() !== 'exit') {
        this.promptUser();
      }
    });
  }

  async processCommand(input) {
    const parts = input.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'code':
        await this.executeCodeCommand(args);
        break;
      
      case 'refactor':
        await this.executeRefactorCommand(args);
        break;
      
      case 'review':
        await this.executeReviewCommand(args);
        break;
      
      case 'migrate':
        await this.executeMigrateCommand(args);
        break;
      
      case 'api':
        await this.executeApiCommand(args);
        break;
      
      case 'db:analyze':
        await this.executeDbAnalyzeCommand();
        break;
      
      case 'db:plan':
        await this.executeDbPlanCommand(args);
        break;
      
      case 'db:seed':
        await this.executeDbSeedCommand(args);
        break;
      
      case 'status':
        this.showStatus();
        break;
      
      case 'rotate':
        await this.rotateAgent();
        break;
      
      case 'exit':
        console.log('Goodbye!');
        this.rl.close();
        process.exit(0);
        break;
      
      default:
        console.log('Unknown command. Type "exit" to quit.');
    }
  }

  async executeCodeCommand(args) {
    if (args.length === 0) {
      console.log('Usage: code <prompt> [files...]');
      return;
    }

    const prompt = args[0];
    const files = args.slice(1);
    
    console.log(`Executing code generation task: "${prompt}"`);
    if (files.length > 0) {
      console.log(`Files: ${files.join(', ')}`);
    }

    try {
      const result = await this.taskExecutor.executeCodeTask(prompt, files);
      console.log('✅ Task completed successfully');
      console.log('Output:', result.output?.substring(0, 500) + (result.output?.length > 500 ? '...' : ''));
    } catch (error) {
      console.log('❌ Task failed:', error.message);
    }
  }

  async executeRefactorCommand(args) {
    if (args.length === 0) {
      console.log('Usage: refactor <prompt> [files...]');
      return;
    }

    const prompt = args[0];
    const files = args.slice(1);
    
    console.log(`Executing refactor task: "${prompt}"`);
    
    try {
      const result = await this.taskExecutor.executeRefactorTask(prompt, files);
      console.log('✅ Refactor completed successfully');
    } catch (error) {
      console.log('❌ Refactor failed:', error.message);
    }
  }

  async executeReviewCommand(args) {
    if (args.length === 0) {
      console.log('Usage: review <prompt> [files...]');
      return;
    }

    const prompt = args[0];
    const files = args.slice(1);
    
    console.log(`Executing code review: "${prompt}"`);
    
    try {
      const result = await this.taskExecutor.executeReviewTask(prompt, files);
      console.log('✅ Review completed successfully');
    } catch (error) {
      console.log('❌ Review failed:', error.message);
    }
  }

  async executeMigrateCommand(args) {
    if (args.length === 0) {
      console.log('Usage: migrate <prompt> [files...]');
      return;
    }

    const prompt = args[0];
    const files = args.slice(1);
    
    console.log(`Executing migration task: "${prompt}"`);
    
    try {
      const result = await this.taskExecutor.executeMigrationTask(prompt, files);
      console.log('✅ Migration task completed successfully');
    } catch (error) {
      console.log('❌ Migration task failed:', error.message);
    }
  }

  async executeApiCommand(args) {
    if (args.length === 0) {
      console.log('Usage: api <prompt> [files...]');
      return;
    }

    const prompt = args[0];
    const files = args.slice(1);
    
    console.log(`Executing API development task: "${prompt}"`);
    
    try {
      const result = await this.taskExecutor.executeApiTask(prompt, files);
      console.log('✅ API task completed successfully');
    } catch (error) {
      console.log('❌ API task failed:', error.message);
    }
  }

  async executeDbAnalyzeCommand() {
    console.log('🔍 Analyzing database schema...');
    
    try {
      const result = await this.taskExecutor.executeSchemaAnalysis();
      console.log('✅ Schema analysis completed');
      console.log(`Models found: ${result.analysis?.models?.length || 0}`);
      console.log(`Enums found: ${result.analysis?.enums?.length || 0}`);
      console.log(`Relations found: ${result.analysis?.relations?.length || 0}`);
      
      if (result.recommendations?.length > 0) {
        console.log('\n📋 Recommendations:');
        result.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. [${rec.priority}] ${rec.message}`);
        });
      }
    } catch (error) {
      console.log('❌ Schema analysis failed:', error.message);
    }
  }

  async executeDbPlanCommand(args) {
    if (args.length === 0) {
      console.log('Usage: db:plan <requirements> (e.g., "add_models,modify_relations")');
      return;
    }

    const requirements = args[0].split(',');
    console.log(`📋 Planning migration with requirements: ${requirements.join(', ')}`);
    
    try {
      const result = await this.taskExecutor.executeMigrationPlanning(requirements);
      console.log('✅ Migration planning completed');
      console.log(`Steps planned: ${result.migrationPlan?.steps?.length || 0}`);
      console.log(`Estimated time: ${result.migrationPlan?.estimatedTime || 'Unknown'}`);
      
      if (result.migrationPlan?.risks?.length > 0) {
        console.log('\n⚠️  Risks identified:');
        result.migrationPlan.risks.forEach((risk, i) => {
          console.log(`  ${i + 1}. ${risk}`);
        });
      }
    } catch (error) {
      console.log('❌ Migration planning failed:', error.message);
    }
  }

  async executeDbSeedCommand(args) {
    if (args.length === 0) {
      console.log('Usage: db:seed <entities> (e.g., "User,Role,Permission")');
      return;
    }

    const entityNames = args[0].split(',');
    const entities = entityNames.map(name => ({ name: name.trim() }));
    
    console.log(`🌱 Creating seed data for: ${entityNames.join(', ')}`);
    
    try {
      const result = await this.taskExecutor.executeSeedDataCreation(entities);
      console.log('✅ Seed data creation completed');
      console.log(`Entities processed: ${result.entitiesProcessed}`);
    } catch (error) {
      console.log('❌ Seed data creation failed:', error.message);
    }
  }

  showStatus() {
    const status = this.taskExecutor.getSystemStatus();
    console.log('\n📊 System Status:');
    console.log(`Active Agent: ${status.activeAgent || 'None'}`);
    console.log(`Total Agents: ${status.totalAgents}`);
    console.log(`Is Rotating: ${status.isRotating}`);
    console.log(`Queue Length: ${status.rotationQueueLength}`);
    
    if (status.agents) {
      console.log('\nAgent Details:');
      Object.entries(status.agents).forEach(([name, agent]) => {
        console.log(`  ${name}: ${agent.isActive ? '🟢 Active' : '⚪ Inactive'} (Tokens: ${agent.tokenCount}/${agent.maxTokens})`);
      });
    }
    console.log('');
  }

  async rotateAgent() {
    console.log('🔄 Rotating agent...');
    try {
      await this.taskExecutor.rotateAgent('manual');
      console.log('✅ Agent rotation completed');
    } catch (error) {
      console.log('❌ Agent rotation failed:', error.message);
    }
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new AgentCLI();
  cli.start().catch(console.error);
}

module.exports = AgentCLI;
