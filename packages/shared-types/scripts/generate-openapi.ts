// OpenAPI Spec Generator
// Generates OpenAPI spec from Zod validation schemas for Flutter integration

import { zodToJsonSchema } from 'zod-to-json-schema'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'

// Import all Zod schemas from validation package
import { loginSchema, registerSchema, userProfileSchema, changePasswordSchema } from '../../validation/src/auth/schemas'
import { createIncidentSchema, updateIncidentSchema, incidentFilterSchema } from '../../validation/src/incident/schemas'
import { createShelterSchema, updateShelterSchema, shelterCapacitySchema, shelterCrewSchema } from '../../validation/src/shelter/schemas'
import { createVolunteerSchema, updateVolunteerSchema, createTeamSchema, assignTeamSchema, checkInSchema } from '../../validation/src/volunteer/schemas'
import { createWarehouseSchema, updateWarehouseSchema, movementSchema, warehouseCrewSchema } from '../../validation/src/warehouse/schemas'
import { createSupplySchema, updateSupplySchema, supplyRequestSchema, allocationSchema } from '../../validation/src/inventory/schemas'
import { createNotificationSchema, markAsReadSchema, bulkMarkAsReadSchema } from '../../validation/src/notification/schemas'
import { createAssessmentSchema, updateAssessmentSchema } from '../../validation/src/assessment/schemas'
import { createConversationSchema, sendMessageSchema } from '../../validation/src/chat/schemas'

const OUTPUT_DIR = join(process.cwd(), '../../docs/api/schemas')

interface OpenAPISchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  items?: any
  enum?: string[]
  format?: string
  description?: string
  $ref?: string
}

interface OpenAPIParameter {
  name: string
  in: string
  required?: boolean
  schema: OpenAPISchema
  description?: string
}

interface OpenAPIOperation {
  tags: string[]
  summary: string
  requestBody?: {
    content: {
      'application/json': {
        schema: OpenAPISchema
      }
    }
  }
  parameters?: OpenAPIParameter[]
  responses: Record<string, any>
}

interface OpenAPIPath {
  [method: string]: OpenAPIOperation
}

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers: { url: string }[]
  paths: OpenAPIPath
  components: {
    schemas: Record<string, OpenAPISchema>
  }
}

function convertZodToOpenAPI(zodSchema: any, name: string): OpenAPISchema {
  const jsonSchema = zodToJsonSchema(zodSchema, name, {
    target: 'openApi3',
    definitions: {},
  })
  
  // Transform JSON Schema to OpenAPI Schema
  const openApiSchema: OpenAPISchema = {
    type: jsonSchema.type || 'object',
  }
  
  if (jsonSchema.properties) {
    openApiSchema.properties = {}
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      const prop = value as any
      const openApiProp: any = {}
      
      if (prop.type) openApiProp.type = prop.type
      if (prop.format) openApiProp.format = prop.format
      if (prop.enum) openApiProp.enum = prop.enum
      if (prop.items) openApiProp.items = prop.items
      if (prop.minLength) openApiProp.minLength = prop.minLength
      if (prop.maxLength) openApiProp.maxLength = prop.maxLength
      if (prop.minimum) openApiProp.minimum = prop.minimum
      if (prop.maximum) openApiProp.maximum = prop.maximum
      if (prop.description) openApiProp.description = prop.description
      if (prop.default) openApiProp.default = prop.default
      
      openApiSchema.properties[key] = openApiProp
    }
  }
  
  if (jsonSchema.required) {
    openApiSchema.required = jsonSchema.required
  }
  
  return openApiSchema
}

function generateOpenAPISpec(): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: 'NURisk API',
      version: '1.0.0',
      description: 'NURisk Disaster Management API - OpenAPI spec generated from Zod schemas for Flutter integration',
    },
    servers: [
      { url: process.env.API_URL || 'https://api.nurisk.pwnu.or.id' },
    ],
    paths: {},
    components: {
      schemas: {},
    },
  }

  // Auth Schemas
  spec.components.schemas.LoginRequest = convertZodToOpenAPI(loginSchema, 'LoginRequest')
  spec.components.schemas.RegisterRequest = convertZodToOpenAPI(registerSchema, 'RegisterRequest')
  spec.components.schemas.UserProfileRequest = convertZodToOpenAPI(userProfileSchema, 'UserProfileRequest')
  spec.components.schemas.ChangePasswordRequest = convertZodToOpenAPI(changePasswordSchema, 'ChangePasswordRequest')

  // Incident Schemas
  if (createIncidentSchema) {
    spec.components.schemas.CreateIncidentRequest = convertZodToOpenAPI(createIncidentSchema, 'CreateIncidentRequest')
  }
  if (updateIncidentSchema) {
    spec.components.schemas.UpdateIncidentRequest = convertZodToOpenAPI(updateIncidentSchema, 'UpdateIncidentRequest')
  }
  if (incidentFilterSchema) {
    spec.components.schemas.IncidentFilter = convertZodToOpenAPI(incidentFilterSchema, 'IncidentFilter')
  }

  // Shelter Schemas
  if (createShelterSchema) {
    spec.components.schemas.CreateShelterRequest = convertZodToOpenAPI(createShelterSchema, 'CreateShelterRequest')
  }
  if (updateShelterSchema) {
    spec.components.schemas.UpdateShelterRequest = convertZodToOpenAPI(updateShelterSchema, 'UpdateShelterRequest')
  }
  if (shelterCapacitySchema) {
    spec.components.schemas.ShelterCapacity = convertZodToOpenAPI(shelterCapacitySchema, 'ShelterCapacity')
  }
  if (shelterCrewSchema) {
    spec.components.schemas.ShelterCrew = convertZodToOpenAPI(shelterCrewSchema, 'ShelterCrew')
  }

  // Volunteer Schemas
  if (createVolunteerSchema) {
    spec.components.schemas.CreateVolunteerRequest = convertZodToOpenAPI(createVolunteerSchema, 'CreateVolunteerRequest')
  }
  if (updateVolunteerSchema) {
    spec.components.schemas.UpdateVolunteerRequest = convertZodToOpenAPI(updateVolunteerSchema, 'UpdateVolunteerRequest')
  }
  if (createTeamSchema) {
    spec.components.schemas.CreateTeamRequest = convertZodToOpenAPI(createTeamSchema, 'CreateTeamRequest')
  }
  if (assignTeamSchema) {
    spec.components.schemas.AssignTeamRequest = convertZodToOpenAPI(assignTeamSchema, 'AssignTeamRequest')
  }
  if (checkInSchema) {
    spec.components.schemas.CheckInRequest = convertZodToOpenAPI(checkInSchema, 'CheckInRequest')
  }

  // Warehouse Schemas
  if (createWarehouseSchema) {
    spec.components.schemas.CreateWarehouseRequest = convertZodToOpenAPI(createWarehouseSchema, 'CreateWarehouseRequest')
  }
  if (updateWarehouseSchema) {
    spec.components.schemas.UpdateWarehouseRequest = convertZodToOpenAPI(updateWarehouseSchema, 'UpdateWarehouseRequest')
  }
  if (movementSchema) {
    spec.components.schemas.MovementRequest = convertZodToOpenAPI(movementSchema, 'MovementRequest')
  }
  if (warehouseCrewSchema) {
    spec.components.schemas.WarehouseCrew = convertZodToOpenAPI(warehouseCrewSchema, 'WarehouseCrew')
  }

  // Logistics/Inventory Schemas
  if (createSupplySchema) {
    spec.components.schemas.CreateSupplyRequest = convertZodToOpenAPI(createSupplySchema, 'CreateSupplyRequest')
  }
  if (updateSupplySchema) {
    spec.components.schemas.UpdateSupplyRequest = convertZodToOpenAPI(updateSupplySchema, 'UpdateSupplyRequest')
  }
  if (supplyRequestSchema) {
    spec.components.schemas.SupplyRequest = convertZodToOpenAPI(supplyRequestSchema, 'SupplyRequest')
  }
  if (allocationSchema) {
    spec.components.schemas.AllocationRequest = convertZodToOpenAPI(allocationSchema, 'AllocationRequest')
  }

  // Notification Schemas
  if (createNotificationSchema) {
    spec.components.schemas.CreateNotificationRequest = convertZodToOpenAPI(createNotificationSchema, 'CreateNotificationRequest')
  }
  if (markAsReadSchema) {
    spec.components.schemas.MarkAsReadRequest = convertZodToOpenAPI(markAsReadSchema, 'MarkAsReadRequest')
  }
  if (bulkMarkAsReadSchema) {
    spec.components.schemas.BulkMarkAsReadRequest = convertZodToOpenAPI(bulkMarkAsReadSchema, 'BulkMarkAsReadRequest')
  }

  // Assessment Schemas
  if (createAssessmentSchema) {
    spec.components.schemas.CreateAssessmentRequest = convertZodToOpenAPI(createAssessmentSchema, 'CreateAssessmentRequest')
  }
  if (updateAssessmentSchema) {
    spec.components.schemas.UpdateAssessmentRequest = convertZodToOpenAPI(updateAssessmentSchema, 'UpdateAssessmentRequest')
  }

  // Chat Schemas
  if (createConversationSchema) {
    spec.components.schemas.CreateConversationRequest = convertZodToOpenAPI(createConversationSchema, 'CreateConversationRequest')
  }
  if (sendMessageSchema) {
    spec.components.schemas.SendMessageRequest = convertZodToOpenAPI(sendMessageSchema, 'SendMessageRequest')
  }

  // Define API Paths
  // Auth
  spec.paths['/auth/login'] = {
    post: {
      tags: ['Auth'],
      summary: 'User login',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Login successful' },
        '401': { description: 'Invalid credentials' },
      },
    },
  }

  spec.paths['/auth/register'] = {
    post: {
      tags: ['Auth'],
      summary: 'User registration',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Registration successful' },
        '400': { description: 'Validation error' },
      },
    },
  }

  // Incidents
  spec.paths['/incidents'] = {
    get: {
      tags: ['Incidents'],
      summary: 'List incidents',
      parameters: [
        {
          name: 'filter',
          in: 'query',
          schema: { $ref: '#/components/schemas/IncidentFilter' },
        },
      ],
      responses: {
        '200': { description: 'Success' },
      },
    },
    post: {
      tags: ['Incidents'],
      summary: 'Create incident',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateIncidentRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '400': { description: 'Validation error' },
      },
    },
  }

  // Shelters
  spec.paths['/shelters'] = {
    get: {
      tags: ['Shelters'],
      summary: 'List shelters',
      responses: {
        '200': { description: 'Success' },
      },
    },
    post: {
      tags: ['Shelters'],
      summary: 'Create shelter',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateShelterRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '400': { description: 'Validation error' },
      },
    },
  }

  // Volunteers
  spec.paths['/volunteers'] = {
    get: {
      tags: ['Volunteers'],
      summary: 'List volunteers',
      responses: {
        '200': { description: 'Success' },
      },
    },
    post: {
      tags: ['Volunteers'],
      summary: 'Create volunteer',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateVolunteerRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '400': { description: 'Validation error' },
      },
    },
  }

  // Warehouses
  spec.paths['/warehouses'] = {
    get: {
      tags: ['Warehouses'],
      summary: 'List warehouses',
      responses: {
        '200': { description: 'Success' },
      },
    },
    post: {
      tags: ['Warehouses'],
      summary: 'Create warehouse',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateWarehouseRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '400': { description: 'Validation error' },
      },
    },
  }

  // Logistics
  spec.paths['/logistics'] = {
    get: {
      tags: ['Logistics'],
      summary: 'List logistics requests',
      responses: {
        '200': { description: 'Success' },
      },
    },
    post: {
      tags: ['Logistics'],
      summary: 'Create logistics request',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSupplyRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '400': { description: 'Validation error' },
      },
    },
  }

  return spec
}

// Simple YAML stringifier
function toYAML(obj: any, indent: number = 0): string {
  let yaml = ''
  const spaces = '  '.repeat(indent)

  if (obj === null || obj === undefined) {
    return 'null'
  }

  if (typeof obj === 'string') {
    // Check if string needs quoting
    if (obj.includes(':') || obj.includes('#') || obj.includes('\n') || obj === '' || obj === 'true' || obj === 'false') {
      return `"${obj.replace(/"/g, '\\"')}"`
    }
    return obj
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj)
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        yaml += `${spaces}- ${toYAML(item, indent + 1).trimStart()}\n`
      } else {
        yaml += `${spaces}- ${toYAML(item, 0)}\n`
      }
    }
    return yaml.trimEnd()
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length === 0) {
            yaml += `${spaces}${key}: []\n`
          } else {
            yaml += `${spaces}${key}:\n${toYAML(value, indent + 1)}`
          }
        } else {
          yaml += `${spaces}${key}:\n${toYAML(value, indent + 1)}`
        }
      } else if (typeof value === 'string') {
        yaml += `${spaces}${key}: ${toYAML(value, 0)}\n`
      } else {
        yaml += `${spaces}${key}: ${value}\n`
      }
    }
    return yaml
  }

  return String(obj)
}

function main() {
  console.log('🔄 Generating OpenAPI spec from Zod schemas...')

  // Create output directory
  const specPath = join(process.cwd(), '../../docs/api/openapi.yaml')
  const dir = dirname(specPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  // Generate spec
  const spec = generateOpenAPISpec()

  // Write as JSON (more reliable than custom YAML)
  const jsonPath = specPath.replace('.yaml', '.json')
  writeFileSync(jsonPath, JSON.stringify(spec, null, 2), 'utf-8')

  // Also write YAML
  const yaml = toYAML(spec)
  writeFileSync(specPath, yaml, 'utf-8')

  console.log(`✅ OpenAPI spec generated: ${specPath}`)
  console.log(`📊 Total schemas: ${Object.keys(spec.components.schemas).length}`)
}

main()