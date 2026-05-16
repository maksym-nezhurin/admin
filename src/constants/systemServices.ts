export type SystemServiceStatus = 'healthy' | 'unhealthy' | 'unknown' | 'not_monitored';

/** Shown in System table; health is fetched via gateway only (see systemHealth.ts). */
export interface SystemServiceConfig {
  name: string;
  url: string;
  healthCheck?: boolean;
}

export interface SystemServiceInfo extends SystemServiceConfig {
  status: SystemServiceStatus;
  healthUrl?: string;
  httpStatus?: number;
  responseTimeMs?: number;
  statusMessage?: string;
  version?: string;
  buildAt?: string;
  lastChecked?: Date;
}

import { SCRAPPER_URL } from '../api/apiScrapperClient';

export const GATEWAY_AGGREGATED_HEALTH_PATH = '/api/health/services';

export const SCRAPPER_HEALTH_PATH = '/health';

const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, '');

export const gatewayUrl = normalizeBaseUrl(
  import.meta.env.VITE_GATEWAY_URL || 'https://gateway-17ki.onrender.com',
);

/** Окремий сервіс — той самий base URL, що й apiScrapperClient (VITE_SCRAPPER_URL) */
export const scrapperUrl = normalizeBaseUrl(SCRAPPER_URL);

export const INITIAL_SYSTEM_SERVICES: SystemServiceConfig[] = [
  { name: 'gateway', url: gatewayUrl },
  {
    name: 'auth',
    url: normalizeBaseUrl(
      import.meta.env.VITE_AUTH_SERVICE_URL ||
        'https://auth-service-still-silence-9406.fly.dev',
    ),
  },
  {
    name: 'user',
    url: normalizeBaseUrl(
      import.meta.env.VITE_USER_SERVICE_URL ||
        'https://user-service-nest-1.onrender.com',
    ),
  },
  { name: 'scrapper', url: scrapperUrl },
];

export function createInitialSystemServiceState(): SystemServiceInfo[] {
  return INITIAL_SYSTEM_SERVICES.map((service) => ({
    ...service,
    status: 'unknown',
  }));
}
