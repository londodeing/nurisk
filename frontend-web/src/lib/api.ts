import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import { toast } from '@/stores/use-ui-store';
import { useAuthStore } from '@/stores/auth-store';

// =============================================================================
// Configuration
// =============================================================================

const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.PROD) {
    return '/api/';
  }
  return '/api/';
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

// =============================================================================
// State for Token Refresh
// =============================================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });
  failedQueue = [];
};

// =============================================================================
// Generate Request ID
// =============================================================================

const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// =============================================================================
// Create Axios Instance
// =============================================================================

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// =============================================================================
// Request Interceptor
// =============================================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach token from auth store
    const authToken = useAuthStore.getState().token;
    const localToken = localStorage.getItem('token') || localStorage.getItem('pusdatin_token');
    const token = authToken || localToken;

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach additional headers
    config.headers['X-Request-ID'] = generateRequestId();
    config.headers['Accept'] = 'application/json';

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// =============================================================================
// Response Interceptor
// =============================================================================

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retryCount?: number };
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Public endpoints that don't require auth
    const publicEndpoints = ['/chat', '/incidents', '/reports', '/historical-data/map', '/auth/login', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(ep => url === ep || url.startsWith(ep + '?'));

    // Handle 401 - Token Expired
    if (status === 401 && !isPublicEndpoint) {
      if (!isRefreshing) {
        isRefreshing = true;

        // Process queue with error first
        processQueue(error);

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post(`${getBaseURL()}auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { token: newToken, refresh_token: newRefreshToken } = response.data;

          // Update tokens
          if (newToken) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('nurisk_auth_token', newToken);
            useAuthStore.getState().setUser(useAuthStore.getState().user);
          }
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
            localStorage.setItem('nurisk_refresh_token', newRefreshToken);
          }

          isRefreshing = false;
          processQueue(null);

          // Retry original request
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError as AxiosError);

          // Force logout
          useAuthStore.getState().logout();
          localStorage.removeItem('pusdatin_logged_in');
          localStorage.removeItem('pusdatin_user');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('nurisk_auth_token');
          localStorage.removeItem('nurisk_refresh_token');

          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Queue the request while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Retry original request after refresh
          if (originalRequest) {
            const token = localStorage.getItem('token');
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        })
        .catch((err) => Promise.reject(err));
    }

    // Handle 403 - Forbidden
    if (status === 403) {
      toast.error('Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.');
      return Promise.reject(error);
    }

    // Handle 404 - Not Found
    if (status === 404) {
      toast.error('Data tidak ditemukan.');
      return Promise.reject(error);
    }

    // Handle 409 - Conflict
    if (status === 409) {
      toast.error('Terjadi konflik data. Silakan muat ulang halaman.');
      return Promise.reject(error);
    }

    // Handle 422 - Validation Error
    if (status === 422) {
      const errors = error.response?.data;
      return Promise.reject(errors);
    }

    // Handle 429 - Rate Limit
    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY;
      
      // Retry after delay
      if (originalRequest && (!originalRequest._retryCount || originalRequest._retryCount < MAX_RETRIES)) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        return new Promise(resolve => setTimeout(resolve, delay)).then(() => api(originalRequest));
      }
      
      toast.error('Terlalu banyak permintaan. Silakan coba lagi nanti.');
      return Promise.reject(error);
    }

    // Handle 500 - Server Error
    if (status === 500) {
      toast.error('Terjadi kesalahan server. Silakan coba lagi.');
      return Promise.reject(error);
    }

    // Handle 502-504 - Gateway Error with Retry
    if (status && status >= 502 && status <= 504) {
      if (originalRequest && (!originalRequest._retryCount || originalRequest._retryCount < MAX_RETRIES)) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        return new Promise(resolve => setTimeout(resolve, RETRY_DELAY)).then(() => api(originalRequest));
      }
      toast.error('Gateway error. Silakan coba lagi.');
      return Promise.reject(error);
    }

    // Handle Network Error
    if (!status && error.message === 'Network Error') {
      // Check if online
      if (!navigator.onLine) {
        toast.warning('Anda sedang offline. Beberapa fitur mungkin tidak tersedia.');
        // Queue for later sync (integration point)
        return Promise.reject(error);
      }

      // Retry logic
      if (originalRequest && (!originalRequest._retryCount || originalRequest._retryCount < MAX_RETRIES)) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        return new Promise(resolve => setTimeout(resolve, RETRY_DELAY)).then(() => api(originalRequest));
      }

      toast.error('Koneksi terputus. Periksa koneksi internet Anda.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// =============================================================================
// Export
// =============================================================================

export default api;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await api.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all pending requests
 */
export function clearPendingRequests(): void {
  processQueue(new AxiosError('Request cancelled'));
}

/**
 * Get current refresh status
 */
export function isTokenRefreshing(): boolean {
  return isRefreshing;
}