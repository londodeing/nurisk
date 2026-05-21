// SDK HTTP Client

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type { AuthStorage } from './auth-storage'
import { LocalStorageAuthStorage, MemoryAuthStorage } from './auth-storage'
import { setupRequestInterceptor, setupResponseInterceptor, type ApiResponse } from './interceptors'
import { shouldRetry, getRetryDelay, type RetryConfig, DEFAULT_RETRY } from './retry'
import { SdkError, NetworkError, AuthError, ValidationError, NotFoundError, RateLimitError, ServerError } from './errors'

export interface SdkClientConfig {
  baseURL: string
  timeout?: number
  retry?: Partial<RetryConfig>
  authStorage?: AuthStorage
  onTokenExpired?: () => void
}

export class SdkClient {
  private client: AxiosInstance
  private retryConfig: RetryConfig
  private authStorage: AuthStorage

  constructor(config: SdkClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.retryConfig = { ...DEFAULT_RETRY, ...config.retry }
    this.authStorage = config.authStorage ?? new MemoryAuthStorage()

    setupRequestInterceptor(this.client, this.authStorage)
    setupResponseInterceptor(this.client, this.authStorage, config.onTokenExpired)
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config)
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config)
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config)
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    let lastError: unknown

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.client.request<ApiResponse<T>>({
          method,
          url,
          data,
          ...config,
        })
        return response.data
      } catch (error) {
        lastError = this.normalizeError(error as AxiosError)
        
        if (!shouldRetry(lastError, attempt, this.retryConfig)) {
          throw lastError
        }
        
        const delay = getRetryDelay(attempt, this.retryConfig)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  private normalizeError(error: AxiosError): SdkError {
    const response = error.response
    const status = response?.status

    if (!status) {
      return new NetworkError(error.message)
    }

    switch (status) {
      case 401:
        return new AuthError()
      case 404:
        return new NotFoundError()
      case 422:
        const data = response.data as ApiResponse<unknown>
        return new ValidationError(
          data?.message || 'Validation failed',
          data?.error ? JSON.parse(data.error) : undefined,
        )
      case 429:
        return new RateLimitError()
      case 500:
      case 502:
      case 503:
        return new ServerError()
      default:
        return new SdkError(error.message, status)
    }
  }

  setAuthStorage(storage: AuthStorage): void {
    this.authStorage = storage
  }

  getAuthStorage(): AuthStorage {
    return this.authStorage
  }
}

// Default singleton client instance
const defaultClient = new SdkClient({
  baseURL: '/api',
})

export { defaultClient as client }