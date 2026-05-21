import { SdkClient, AuthApi, IncidentsApi, VolunteersApi, SheltersApi, WarehousesApi, ChatApi, NotificationsApi, InventoryApi, WeatherApi, TrendAnalysisApi, StreamAnalyticsApi, ResourceApi } from '@nurisk/sdk';
import type { AuthStorage } from '@nurisk/sdk';

const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.PROD) {
    return '/api/';
  }
  return '/api/';
};

class CompatibleAuthStorage implements AuthStorage {
  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return (
      localStorage.getItem('nurisk_auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('pusdatin_token') ||
      null
    );
  }

  setToken(token: string): void {
    localStorage.setItem('nurisk_auth_token', token);
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('nurisk_auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('pusdatin_token');
  }

  getRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('nurisk_refresh_token') || localStorage.getItem('refresh_token') || null;
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('nurisk_refresh_token', token);
    localStorage.setItem('refresh_token', token);
  }

  removeRefreshToken(): void {
    localStorage.removeItem('nurisk_refresh_token');
    localStorage.removeItem('refresh_token');
  }
}

const sdkClient = new SdkClient({
  baseURL: getBaseURL(),
  authStorage: new CompatibleAuthStorage(),
});

export const sdk = {
  auth: new AuthApi(sdkClient),
  incidents: new IncidentsApi(sdkClient),
  volunteers: new VolunteersApi(sdkClient),
  shelters: new SheltersApi(sdkClient),
  warehouses: new WarehousesApi(sdkClient),
  chat: new ChatApi(sdkClient),
  notifications: new NotificationsApi(sdkClient),
  inventory: new InventoryApi(sdkClient),
  weather: new WeatherApi(sdkClient),
  trendAnalysis: new TrendAnalysisApi({ baseUrl: getBaseURL() }),
  streamAnalytics: new StreamAnalyticsApi({ baseUrl: getBaseURL() }),
  resource: new ResourceApi(sdkClient),
};

// Backward compatibility: re-export axios client from lib/api
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import axiosApi from '@/lib/api';
export default axiosApi;

export { sdkClient };
