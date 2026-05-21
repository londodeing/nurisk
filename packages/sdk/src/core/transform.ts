// Snake_case to camelCase transformer for API responses

type Primitive = string | number | boolean | null | undefined

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Transform a value recursively
 */
function transformValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformValue(item))
  }

  if (typeof value === 'object') {
    return transformObject(value as Record<string, unknown>)
  }

  return value
}

/**
 * Transform all keys in an object from snake_case to camelCase
 */
export function transformObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}

  for (const key of Object.keys(obj)) {
    const camelKey = snakeToCamel(key)
    const value = obj[key]

    // Skip keys that don't contain underscores (no transformation needed)
    if (key === camelKey && typeof value !== 'object') {
      result[key] = value
    } else {
      result[camelKey] = transformValue(value)
    }
  }

  return result as T
}

/**
 * Transform an array of objects
 */
export function transformArray<T extends Record<string, unknown>>(arr: unknown[]): T[] {
  return (arr as T[]).map((item) => {
    if (item && typeof item === 'object') {
      return transformObject(item as Record<string, unknown>) as T
    }
    return item as T
  })
}

/**
 * Check if a key is in snake_case format
 */
export function isSnakeCase(key: string): boolean {
  return key.includes('_')
}

/**
 * Check if an object has snake_case keys
 */
export function hasSnakeCaseKeys(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  return Object.keys(obj as Record<string, unknown>).some(isSnakeCase)
}