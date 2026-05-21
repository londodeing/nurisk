// Retry Logic

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  multiplier: number
}

export const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  multiplier: 2,
}

export function shouldRetry(error: unknown, attempt: number, config: RetryConfig): boolean {
  if (attempt >= config.maxRetries) return false

  // Network errors (TypeError from axios)
  if (error instanceof TypeError) return true

  // Check for status code in error response
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response
    if (response?.status) {
      // Retry on 5xx errors or 429 rate limit
      return response.status >= 500 || response.status === 429
    }
  }

  return false
}

export function getRetryDelay(attempt: number, config: RetryConfig): number {
  return config.baseDelay * Math.pow(config.multiplier, attempt)
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!shouldRetry(error, attempt, config)) {
        throw error
      }
      const delay = getRetryDelay(attempt, config)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}