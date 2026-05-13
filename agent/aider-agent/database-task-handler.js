const path = require('path');
const fs = require('fs').promises;

class DatabaseTaskHandler {
  constructor(config) {
    this.config = config;
    this.backendPath = path.resolve(__dirname, '../../apps/backend');
    this.schemaPath = path.join(this.backendPath, 'prisma/schema.prisma');
  }

  async handleDatabaseTask(task) {
    console.log(`[DatabaseTaskHandler] Processing database task: ${task.type}`);
    
    switch (task.type) {
      case 'schema_analysis':
        return await this.analyzeSchema(task);
      
      case 'migration_planning':
        return await this.planMigration(task);
      
      case 'schema_modification':
        return await this.modifySchema(task);
      
      case 'seed_data_creation':
        return await this.createSeedData(task);
      
      case 'query_optimization':
        return await this.optimizeQueries(task);
      
      default:
        throw new Error(`Unknown database task type: ${task.type}`);
    }
  }

  async analyzeSchema(task) {
    try {
      const schemaContent = await fs.readFile(this.schemaPath, 'utf8');
      
      const analysis = {
        models: this.extractModels(schemaContent),
        enums: this.extractEnums(schemaContent),
        relations: this.extractRelations(schemaContent),
        indexes: this.extractIndexes(schemaContent),
        constraints: this.extractConstraints(schemaContent)
      };

      return {
        success: true,
        analysis: analysis,
        recommendations: this.generateRecommendations(analysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Schema analysis failed: ${error.message}`);
    }
  }

  async planMigration(task) {
    const { fromSchema, toSchema, requirements } = task.data;
    
    const migrationPlan = {
      steps: [],
      risks: [],
      estimatedTime: 0,
      backupRequired: true
    };

    // Analyze differences and create migration steps
    if (requirements.includes('add_models')) {
      migrationPlan.steps.push({
        type: 'CREATE_MODELS',
        description: 'Create new database models',
        sql: this.generateCreateModelSQL(task.newModels || [])
      });
    }

    if (requirements.includes('modify_relations')) {
      migrationPlan.steps.push({
        type: 'UPDATE_RELATIONS',
        description: 'Update model relationships',
        sql: this.generateRelationSQL(task.relationChanges || [])
      });
    }

    return {
      success: true,
      migrationPlan: migrationPlan,
      timestamp: new Date().toISOString()
    };
  }

  async modifySchema(task) {
    const { modifications, backupFirst = true } = task.data;
    
    try {
      // Create backup if requested
      if (backupFirst) {
        await this.createSchemaBackup();
      }

      // Apply modifications
      let schemaContent = await fs.readFile(this.schemaPath, 'utf8');
      
      for (const modification of modifications) {
        schemaContent = await this.applyModification(schemaContent, modification);
      }

      // Validate modified schema
      const isValid = await this.validateSchema(schemaContent);
      if (!isValid) {
        throw new Error('Modified schema failed validation');
      }

      // Write modified schema
      await fs.writeFile(this.schemaPath, schemaContent);

      return {
        success: true,
        message: 'Schema modified successfully',
        modificationsApplied: modifications.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Schema modification failed: ${error.message}`);
    }
  }

  async createSeedData(task) {
    const { entities, dataType = 'reference' } = task.data;
    const seedPath = path.join(this.backendPath, 'prisma/seed.ts');
    
    try {
      let seedContent = await fs.readFile(seedPath, 'utf8');
      
      // Generate seed data for specified entities
      const seedDataCode = this.generateSeedDataCode(entities, dataType);
      
      // Insert seed data into existing seed file
      seedContent = this.insertSeedData(seedContent, seedDataCode);
      
      await fs.writeFile(seedPath, seedContent);

      return {
        success: true,
        message: 'Seed data created successfully',
        entitiesProcessed: entities.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Seed data creation failed: ${error.message}`);
    }
  }

  async optimizeQueries(task) {
    const { queryPatterns, performanceTargets } = task.data;
    
    const optimizations = [];
    
    for (const pattern of queryPatterns) {
      const optimization = await this.analyzeQueryPattern(pattern);
      if (optimization.recommendations.length > 0) {
        optimizations.push(optimization);
      }
    }

    return {
      success: true,
      optimizations: optimizations,
      totalRecommendations: optimizations.reduce((sum, opt) => sum + opt.recommendations.length, 0),
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods
  extractModels(schemaContent) {
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
    const models = [];
    let match;
    
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      models.push({
        name: match[1],
        fields: this.parseModelFields(match[2])
      });
    }
    
    return models;
  }

  extractEnums(schemaContent) {
    const enumRegex = /enum\s+(\w+)\s*{([^}]+)}/g;
    const enums = [];
    let match;
    
    while ((match = enumRegex.exec(schemaContent)) !== null) {
      enums.push({
        name: match[1],
        values: match[2].trim().split('\n').map(line => line.trim()).filter(line => line)
      });
    }
    
    return enums;
  }

  extractRelations(schemaContent) {
    // Extract relationship information from schema
    const relations = [];
    const models = this.extractModels(schemaContent);
    
    models.forEach(model => {
      model.fields.forEach(field => {
        if (field.isRelation) {
          relations.push({
            from: model.name,
            to: field.type,
            field: field.name,
            relationType: field.relationType
          });
        }
      });
    });
    
    return relations;
  }

  extractIndexes(schemaContent) {
    const indexRegex = /@@index\(\[([^\]]+)\]/g;
    const indexes = [];
    let match;
    
    while ((match = indexRegex.exec(schemaContent)) !== null) {
      indexes.push({
        fields: match[1].split(',').map(f => f.trim()),
        type: 'index'
      });
    }
    
    return indexes;
  }

  extractConstraints(schemaContent) {
    // Extract unique constraints, foreign keys, etc.
    const constraints = [];
    
    // Extract unique constraints
    const uniqueRegex = /@@unique\(\[([^\]]+)\]/g;
    let match;
    
    while ((match = uniqueRegex.exec(schemaContent)) !== null) {
      constraints.push({
        type: 'unique',
        fields: match[1].split(',').map(f => f.trim())
      });
    }
    
    return constraints;
  }

  parseModelFields(fieldsContent) {
    const lines = fieldsContent.trim().split('\n');
    const fields = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@')) {
        const fieldMatch = trimmed.match(/(\w+)\s+(\w+[\[\]?]*)/);
        if (fieldMatch) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2],
            isOptional: trimmed.includes('?'),
            isArray: trimmed.includes('[]'),
            isRelation: /^[A-Z]/.test(fieldMatch[2]) && !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json'].includes(fieldMatch[2])
          });
        }
      }
    });
    
    return fields;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Check for missing indexes on foreign keys
    analysis.relations.forEach(relation => {
      const hasIndex = analysis.indexes.some(index => 
        index.fields.includes(relation.field)
      );
      
      if (!hasIndex) {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          message: `Consider adding index on ${relation.from}.${relation.field} for better query performance`
        });
      }
    });
    
    // Check for models without timestamps
    analysis.models.forEach(model => {
      const hasCreatedAt = model.fields.some(f => f.name === 'createdAt');
      const hasUpdatedAt = model.fields.some(f => f.name === 'updatedAt');
      
      if (!hasCreatedAt || !hasUpdatedAt) {
        recommendations.push({
          type: 'best_practice',
          priority: 'low',
          message: `Consider adding createdAt/updatedAt timestamps to ${model.name} model`
        });
      }
    });
    
    return recommendations;
  }

  async createSchemaBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backendPath, `prisma/schema.backup.${timestamp}.prisma`);
    
    const schemaContent = await fs.readFile(this.schemaPath, 'utf8');
    await fs.writeFile(backupPath, schemaContent);
    
    console.log(`[DatabaseTaskHandler] Schema backup created: ${backupPath}`);
  }

  async validateSchema(schemaContent) {
    // Basic validation - check for syntax errors
    try {
      // Check for balanced braces
      const openBraces = (schemaContent.match(/{/g) || []).length;
      const closeBraces = (schemaContent.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        return false;
      }
      
      // Check for required sections
      if (!schemaContent.includes('generator client')) {
        return false;
      }
      
      if (!schemaContent.includes('datasource db')) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async applyModification(schemaContent, modification) {
    switch (modification.type) {
      case 'add_field':
        return this.addFieldToModel(schemaContent, modification);
      
      case 'remove_field':
        return this.removeFieldFromModel(schemaContent, modification);
      
      case 'add_model':
        return this.addModel(schemaContent, modification);
      
      case 'add_enum':
        return this.addEnum(schemaContent, modification);
      
      case 'add_index':
        return this.addIndex(schemaContent, modification);
      
      default:
        throw new Error(`Unknown modification type: ${modification.type}`);
    }
  }

  addFieldToModel(schemaContent, modification) {
    const { modelName, field } = modification;
    const modelRegex = new RegExp(`(model\\s+${modelName}\\s*{[^}]*)(})`);
    
    return schemaContent.replace(modelRegex, (match, modelContent, closingBrace) => {
      return `${modelContent}\n  ${field.name}  ${field.type}${field.optional ? '?' : ''}${field.attributes || ''}\n${closingBrace}`;
    });
  }

  removeFieldFromModel(schemaContent, modification) {
    const { modelName, fieldName } = modification;
    const fieldRegex = new RegExp(`\\s*${fieldName}\\s+[^\\n]+\\n`, 'g');
    
    return schemaContent.replace(fieldRegex, '');
  }

  addModel(schemaContent, modification) {
    const { model } = modification;
    const modelCode = this.generateModelCode(model);
    
    return schemaContent + '\n\n' + modelCode;
  }

  addEnum(schemaContent, modification) {
    const { enumDef } = modification;
    const enumCode = `enum ${enumDef.name} {\n${enumDef.values.map(v => `  ${v}`).join('\n')}\n}`;
    
    return schemaContent + '\n\n' + enumCode;
  }

  addIndex(schemaContent, modification) {
    const { modelName, fields } = modification;
    const indexCode = `  @@index([${fields.join(', ')}])`;
    
    const modelRegex = new RegExp(`(model\\s+${modelName}\\s*{[^}]*)(})`);
    
    return schemaContent.replace(modelRegex, (match, modelContent, closingBrace) => {
      return `${modelContent}\n${indexCode}\n${closingBrace}`;
    });
  }

  generateModelCode(model) {
    const fields = model.fields.map(field => {
      return `  ${field.name}  ${field.type}${field.optional ? '?' : ''}${field.attributes || ''}`;
    }).join('\n');
    
    const indexes = (model.indexes || []).map(index => {
      return `  @@index([${index.fields.join(', ')}])`;
    }).join('\n');
    
    return `model ${model.name} {\n${fields}${indexes ? '\n\n' + indexes : ''}\n}`;
  }

  generateSeedDataCode(entities, dataType) {
    // Generate TypeScript code for seeding data
    let code = '\n  // Generated seed data\n';
    
    entities.forEach(entity => {
      code += `  const ${entity.name.toLowerCase()}Data = await prisma.${entity.name.toLowerCase()}.createMany({\n`;
      code += `    data: [\n`;
      
      // Generate sample data based on entity structure
      const sampleData = this.generateSampleData(entity, dataType);
      sampleData.forEach(item => {
        code += `      ${JSON.stringify(item, null, 6).replace(/^/gm, '      ')},\n`;
      });
      
      code += `    ],\n`;
      code += `    skipDuplicates: true\n`;
      code += `  });\n\n`;
    });
    
    return code;
  }

  generateSampleData(entity, dataType) {
    // Generate appropriate sample data based on entity type and dataType
    const sampleData = [];
    
    if (dataType === 'reference') {
      // Generate reference/lookup data
      for (let i = 1; i <= 3; i++) {
        const item = {
          name: `${entity.name} ${i}`,
          code: `${entity.name.toUpperCase()}_${i.toString().padStart(2, '0')}`
        };
        
        if (entity.fields.includes('description')) {
          item.description = `Sample ${entity.name.toLowerCase()} ${i}`;
        }
        
        sampleData.push(item);
      }
    }
    
    return sampleData;
  }

  insertSeedData(seedContent, seedDataCode) {
    // Insert the seed data code into the main function
    const mainFunctionRegex = /(async function main\(\) {[^}]*)(}\s*$)/s;
    
    return seedContent.replace(mainFunctionRegex, (match, functionContent, closingPart) => {
      return functionContent + seedDataCode + closingPart;
    });
  }

  async analyzeQueryPattern(pattern) {
    // Analyze query patterns and suggest optimizations
    const recommendations = [];
    
    if (pattern.includes('findMany') && !pattern.includes('take')) {
      recommendations.push({
        type: 'pagination',
        message: 'Consider adding pagination (take/skip) to findMany queries',
        priority: 'medium'
      });
    }
    
    if (pattern.includes('include') && pattern.includes('where')) {
      recommendations.push({
        type: 'index',
        message: 'Ensure indexes exist on WHERE clause fields for included relations',
        priority: 'high'
      });
    }
    
    return {
      pattern: pattern,
      recommendations: recommendations
    };
  }
}

module.exports = DatabaseTaskHandler;
