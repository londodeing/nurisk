// HTTP Interceptors

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { AuthStorage } from './auth-storage'
import { transformObject, hasSnakeCaseKeys } from './transform'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export function setupRequestInterceptor(
  client: AxiosInstance,
  storage: AuthStorage,
): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = storage.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )
}

export function setupResponseInterceptor(
  client: AxiosInstance,
  storage: AuthStorage,
  onTokenExpired?: () => void,
): void {
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      // Transform snake_case response data to camelCase
      const data = response.data?.data
      if (data && hasSnakeCaseKeys(data)) {
        if (Array.isArray(data)) {
          response.data.data = data.map((item: unknown) =>
            transformObject(item as Record<string, unknown>),
          ) as typeof data
        } else if (typeof data === 'object') {
          response.data.data = transformObject(data as Record<string, unknown>) as typeof data
        }
      }
      return response
    },
    async (error: AxiosError) => {
      const response = error.response
      if (response?.status === 401) {
        storage.removeToken()
        storage.removeRefreshToken()
        onTokenExpired?.()
      }
      return Promise.reject(error)
    },
  )
}