/**
 * @deprecated Use SDK from @nurisk/sdk instead.
 *             Migrate to: import { sdk } from '@/services/api'
 */
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module './api' {
  const api: AxiosInstance;
  export default api;
}