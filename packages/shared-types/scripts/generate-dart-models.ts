// Dart Model Generator
// Generates Dart classes from OpenAPI spec for Flutter integration

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'

const OPENAPI_PATH = join(process.cwd(), '../../docs/api/openapi.json')
const OUTPUT_DIR = join(process.cwd(), '../../frontend-apk/lib/models')

interface OpenAPISchema {
  type?: string
  properties?: Record<string, any>
  required?: string[]
  items?: any
  enum?: string[]
  format?: string
  description?: string
  $ref?: string
}

interface OpenAPISpec {
  openapi: string
  info: { title: string; version: string; description: string }
  servers: { url: string }[]
  paths: Record<string, any>
  components: {
    schemas: Record<string, OpenAPISchema>
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
}

function dartType(jsonType: string, format?: string): string {
  switch (jsonType) {
    case 'string':
      if (format === 'date-time') return 'DateTime'
      if (format === 'uuid') return 'String'
      return 'String'
    case 'number':
      if (format === 'double') return 'double'
      return 'num'
    case 'integer':
      return 'int'
    case 'boolean':
      return 'bool'
    case 'array':
      return 'List<dynamic>'
    case 'object':
      return 'Map<String, dynamic>'
    default:
      return 'dynamic'
  }
}

function convertSchemaToDart(schema: OpenAPISchema, name: string): string {
  let dartCode = ''

  if (schema.$ref) {
    const refName = schema.$ref.replace('#/components/schemas/', '')
    return refName
  }

  if (schema.enum) {
    return `String // enum: ${schema.enum.join(', ')}`
  }

  if (schema.type === 'array' && schema.items) {
    const itemType = convertSchemaToDart(schema.items, name + 'Item')
    return `List<${itemType}>`
  }

  if (schema.type === 'object' && schema.properties) {
    const props: string[] = []
    const required = schema.required || []

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const prop = propSchema as OpenAPISchema
      const isRequired = required.includes(propName)
      const dartTypeStr = convertSchemaToDart(prop, capitalize(propName))
      const defaultValue = isRequired ? '' : '?'

      props.push(`  ${dartTypeStr}${defaultValue} ${propName};`)
    }

    return `{\n${props.join('\n')}\n}`
  }

  return dartType(schema.type || 'string', schema.format)
}

function generateDartClass(className: string, schema: OpenAPISchema): string {
  let code = `// Auto-generated from OpenAPI spec\n// Do not edit manually\n\nimport 'package:json_annotation/json_annotation.dart';\n\npart '${toSnakeCase(className)}.g.dart';\n\n@JsonSerializable()\nclass ${className} {\n`

  if (schema.properties) {
    const props: string[] = []
    const required = schema.required || []

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const prop = propSchema as OpenAPISchema
      const isRequired = required.includes(propName)
      let dartTypeStr = convertSchemaToDart(prop, capitalize(propName))

      // Handle List types
      if (dartTypeStr.startsWith('List<')) {
        // Keep as is
      } else if (dartTypeStr.includes('// enum:')) {
        dartTypeStr = 'String'
      }

      props.push(`  @JsonKey(name: '${propName}')\n  ${isRequired ? '' : 'final '} ${dartTypeStr} ${propName};`)
    }

    code += props.join('\n\n')
  }

  code += `\n\n  ${className}({`

  if (schema.properties) {
    const params: string[] = []
    for (const propName of Object.keys(schema.properties)) {
      params.push(`    this.${propName},`)
    }
    code += '\n' + params.join('\n')
  }

  code += `\n  });\n\n`

  code += `  factory ${className}.fromJson(Map<String, dynamic> json) =>\n      _$${className}FromJson(json);\n\n`
  code += `  Map<String, dynamic> toJson() => _$${className}ToJson(this);\n`

  code += `}\n`

  return code
}

function main() {
  console.log('🔄 Generating Dart models from OpenAPI spec...')

  // Read OpenAPI spec
  if (!existsSync(OPENAPI_PATH)) {
    console.error(`❌ OpenAPI spec not found: ${OPENAPI_PATH}`)
    process.exit(1)
  }

  const jsonContent = readFileSync(OPENAPI_PATH, 'utf-8')
  const spec = JSON.parse(jsonContent) as OpenAPISpec

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Generate models
  const schemas = spec.components?.schemas || {}
  let generatedCount = 0

  for (const [className, schema] of Object.entries(schemas)) {
    // Skip filter schemas
    if (className.includes('Filter')) continue

    const dartCode = generateDartClass(className, schema)
    const filePath = join(OUTPUT_DIR, `${toSnakeCase(className)}.dart`)

    writeFileSync(filePath, dartCode, 'utf-8')
    generatedCount++
    console.log(`  ✅ Generated: ${filePath}`)
  }

  console.log(`\n✅ Generated ${generatedCount} Dart models to: ${OUTPUT_DIR}`)
  console.log(`\n📝 Next steps:`)
  console.log(`   1. Run 'flutter pub get' in frontend-apk/`)
  console.log(`   2. Run 'dart run build_runner build' to generate .g.dart files`)
}

main()