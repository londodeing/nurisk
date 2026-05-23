// Safe Validator - WARN-FIRST, FAIL-LATER
// Uses safeParse (no crash) in stabilization phase
import { ZodType } from 'zod'
import { ApiContractError, ValidationResult, ContractMetadata } from './errors'

// Environment check
const isDev = process.env.NODE_ENV !== 'production'

/**
 * safeParseApiResponse - Safe validation without crashing
 * 
 * DEVELOPMENT: Logs errors, returns ValidationResult with error
 * PRODUCTION (canonical): Throws ApiContractError
 * PRODUCTION (non-critical): Logs + fails gracefully
 */
export function safeParseApiResponse<T>(
  schema: ZodType<T>,
  data: unknown,
  options: {
    endpoint: string
    isCanonical?: boolean // Only hard-fail on canonical endpoints
  },
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return {
      success: true,
      data: result.data,
      issues: [],
    }
  }

  const issues = result.error.issues
  const error = new ApiContractError(
    `Contract validation failed for ${options.endpoint}`,
    options.endpoint,
    issues,
    data,
  )

  if (isDev) {
    console.error(`[SDK CONTRACT ERROR] Endpoint: ${options.endpoint}`)
    issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })

    return {
      success: false,
      error,
      issues,
    }
  }

  if (options.isCanonical) {
    throw error
  }

  return {
    success: false,
    error,
    issues,
  }
}

/**
 * getContractMetadata - Get validation metadata
 */
export function getContractMetadata(
  endpoint: string,
  result: ValidationResult<unknown>,
): ContractMetadata {
  return {
    endpoint,
    validated: result.success,
    validatedAt: new Date().toISOString(),
    issues: result.issues,
  }
}

/**
 * isValidListResponse - Quick check for list response structure
 */
export function isValidListResponse(data: unknown): data is { items: unknown[]; pagination: unknown } {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as any).items) &&
    typeof (data as any).pagination === 'object'
  )
}