export type SystemServiceStatus = 'healthy' | 'unhealthy' | 'unknown' | 'not_monitored';

export interface SystemServiceConfig {
  name: string;
  url: string;
  /** Standard probe path for all HTTP services */
  healthPath?: string;
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

export const STANDARD_HEALTH_PATH = '/api/health';

const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, '');

const gatewayUrl = normalizeBaseUrl(
  import.meta.env.VITE_GATEWAY_URL || 'https://gateway-17ki.onrender.com',
);

const authUrl = normalizeBaseUrl(
  import.meta.env.VITE_AUTH_SERVICE_URL ||
    'https://auth-service-still-silence-9406.fly.dev',
);

const userUrl = normalizeBaseUrl(
  import.meta.env.VITE_USER_SERVICE_URL || 'https://user-service-nest-1.onrender.com',
);

const scrapperUrl = normalizeBaseUrl(
  import.meta.env.VITE_SCRAPPER_URL || 'https://node-scrapper-rtfu.onrender.com',
);

export const INITIAL_SYSTEM_SERVICES: SystemServiceConfig[] = [
  {
    name: 'gateway',
    url: gatewayUrl,
    healthPath: STANDARD_HEALTH_PATH,
  },
  {
    name: 'auth',
    url: authUrl,
    healthPath: STANDARD_HEALTH_PATH,
  },
  {
    name: 'user',
    url: userUrl,
    healthPath: STANDARD_HEALTH_PATH,
  },
  {
    name: 'scrapper',
    url: scrapperUrl,
    healthPath: '/health',
  },
];

export function createInitialSystemServiceState(): SystemServiceInfo[] {
  return INITIAL_SYSTEM_SERVICES.map((service) => ({
    ...service,
    status: 'unknown',
  }));
}
