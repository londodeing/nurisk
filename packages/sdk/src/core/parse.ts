// SDK Parse Layer - Runtime validation using Zod
import { ZodError, ZodIssue, ZodType } from 'zod'
import { ApiContractError } from './errors'

/**
 * Parse and validate data against a Zod schema
 * Throws ApiContractError on validation failure
 */
export function parse<T>(schema: ZodType<T>, data: unknown, options?: { path?: string }): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map((e: ZodIssue) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
      throw new ApiContractError(
        `API contract validation failed: ${error.message}`,
        validationErrors,
        data,
      )
    }
    throw error
  }
}

/**
 * Parse optional - returns undefined if data is undefined
 */
export function parseOptional<T>(
  schema: ZodType<T>,
  data: unknown,
  options?: { path?: string },
): T | undefined {
  if (data === undefined) {
    return undefined
  }
  return parse(schema, data, options)
}

/**
 * Parse array - validates each item in array
 */
export function parseArray<T>(
  schema: ZodType<T>,
  data: unknown,
  options?: { path?: string },
): T[] {
  if (!Array.isArray(data)) {
    throw new ApiContractError(
      `Expected array at ${options?.path ?? 'root'}`,
      [],
      data,
    )
  }
  return data.map((item, index) => {
    try {
      return schema.parse(item)
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((e: ZodIssue) => ({
          path: `[${index}].${e.path.join('.')}`,
          message: e.message,
        }))
        throw new ApiContractError(
          `API contract validation failed at index ${index}: ${error.message}`,
          validationErrors,
          data,
        )
      }
      throw error
    }
  })
}