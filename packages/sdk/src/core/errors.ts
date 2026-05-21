// SDK Error Classes

export class SdkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'SdkError'
  }
}

export class NetworkError extends SdkError {
  constructor(message = 'Network error') {
    super(message, undefined, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class AuthError extends SdkError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthError'
  }
}

export class ValidationError extends SdkError {
  constructor(message: string, public fieldErrors?: Record<string, string[]>) {
    super(message, 422, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends SdkError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends SdkError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMITED')
    this.name = 'RateLimitError'
  }
}

export class ServerError extends SdkError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

/**
 * ApiContractError - Thrown when API response fails validation
 * Used by SDK parse layer to validate response contracts
 */
export class ApiContractError extends SdkError {
  constructor(
    message: string,
    public validationErrors?: { path: string; message: string }[],
    public receivedValue?: unknown,
  ) {
    super(message, 500, 'CONTRACT_VIOLATION')
    this.name = 'ApiContractError'
  }
}