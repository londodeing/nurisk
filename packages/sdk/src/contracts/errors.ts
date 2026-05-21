// SDK Contract Validation Errors
import { ZodError, ZodIssue } from 'zod'

/**
 * ApiContractError - Thrown when API response fails validation
 * Uses safeParse (no crash) in stabilization phase
 */
export class ApiContractError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public validationIssues: ZodIssue[] = [],
    public receivedValue?: unknown,
  ) {
    super(message)
    this.name = 'ApiContractError'
  }

  toString(): string {
    return `[SDK CONTRACT ERROR] Endpoint: ${this.endpoint}\nIssues: ${this.validationIssues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ')}`
  }
}

/**
 * ValidationResult - Result of safeParse validation
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: ApiContractError
  issues: ZodIssue[]
}

/**
 * ContractMetadata - Metadata about validation
 */
export interface ContractMetadata {
  endpoint: string
  validated: boolean
  validatedAt: string
  issues: ZodIssue[]
}