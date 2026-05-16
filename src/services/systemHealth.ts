import {
  GATEWAY_AGGREGATED_HEALTH_PATH,
  SCRAPPER_HEALTH_PATH,
  gatewayUrl,
  scrapperUrl,
  type SystemServiceConfig,
  type SystemServiceInfo,
  type SystemServiceStatus,
} from '../constants/systemServices';

export const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = 10000;

const HEALTHY_STATUS_VALUES = new Set(['ok', 'healthy', 'up', 'pass', 'ready']);

type DownstreamStatus = 'ok' | 'unhealthy' | 'unknown';

interface GatewayDownstreamHealth {
  name: string;
  status: DownstreamStatus;
  url: string;
  healthUrl: string;
  httpStatus?: number;
  responseTimeMs: number;
  version?: string;
  buildAt?: string;
  message?: string;
}

interface GatewayAggregatedHealthResponse {
  status: string;
  version?: string;
  buildAt?: string;
  aggregateStatus?: 'ok' | 'degraded' | 'unhealthy';
  services: GatewayDownstreamHealth[];
}

function buildHealthCheckUrl(baseUrl: string, healthPath: string): string {
  const normalizedBase = baseUrl.trim().replace(/\/+$/, '');
  const normalizedPath = healthPath.startsWith('/') ? healthPath : `/${healthPath}`;
  return `${normalizedBase}${normalizedPath}`;
}

function unwrapHealthPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const record = payload as Record<string, unknown>;
  if (record.data && typeof record.data === 'object') return record.data;
  return payload;
}

function parseHealthBody(body: string): {
  healthy: boolean;
  version?: string;
  buildAt?: string;
} {
  const trimmed = body.trim();
  if (!trimmed) return { healthy: true };
  if (HEALTHY_STATUS_VALUES.has(trimmed.toLowerCase())) return { healthy: true };

  try {
    const payload = unwrapHealthPayload(JSON.parse(trimmed) as unknown);
    if (!payload || typeof payload !== 'object') return { healthy: false };
    const record = payload as Record<string, unknown>;
    const status = record.status ?? record.health ?? record.state;
    if (typeof status === 'string' && HEALTHY_STATUS_VALUES.has(status.toLowerCase())) {
      return {
        healthy: true,
        version: typeof record.version === 'string' ? record.version : undefined,
        buildAt:
          typeof record.buildAt === 'string'
            ? record.buildAt
            : typeof record.timestamp === 'string'
              ? record.timestamp
              : undefined,
      };
    }
    return { healthy: record.ok === true };
  } catch {
    return { healthy: false };
  }
}

function mapDownstreamStatus(status: DownstreamStatus): SystemServiceStatus {
  switch (status) {
    case 'ok':
      return 'healthy';
    case 'unhealthy':
      return 'unhealthy';
    default:
      return 'unknown';
  }
}

function mapGatewaySelfStatus(payload: GatewayAggregatedHealthResponse): SystemServiceStatus {
  if (payload.status?.toLowerCase() === 'ok') return 'healthy';
  return 'unhealthy';
}

/** Scrapper — окремий сервіс, напряму з браузера (VITE_SCRAPPER_URL), не через gateway */
async function checkScrapperHealthDirect(
  timeoutMs: number,
  checkedAt: Date,
): Promise<SystemServiceInfo> {
  const healthUrl = buildHealthCheckUrl(scrapperUrl, SCRAPPER_HEALTH_PATH);
  const startedAt = performance.now();

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });

    const responseTimeMs = Math.round(performance.now() - startedAt);
    const { healthy, version, buildAt } = parseHealthBody(await response.text());

    if (!response.ok) {
      return {
        name: 'scrapper',
        url: scrapperUrl,
        status: 'unhealthy',
        healthUrl,
        httpStatus: response.status,
        responseTimeMs,
        statusMessage: `HTTP ${response.status}`,
        lastChecked: checkedAt,
      };
    }

    if (!healthy) {
      return {
        name: 'scrapper',
        url: scrapperUrl,
        status: 'unhealthy',
        healthUrl,
        httpStatus: response.status,
        responseTimeMs,
        version,
        buildAt,
        statusMessage: 'Invalid health response body',
        lastChecked: checkedAt,
      };
    }

    return {
      name: 'scrapper',
      url: scrapperUrl,
      status: 'healthy',
      healthUrl,
      httpStatus: response.status,
      responseTimeMs,
      version,
      buildAt,
      lastChecked: checkedAt,
    };
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? 'Timeout'
        : error instanceof TypeError
          ? 'Network error (CORS or unreachable)'
          : error instanceof Error
            ? error.message
            : 'Unknown error';

    return {
      name: 'scrapper',
      url: scrapperUrl,
      status: 'unknown',
      healthUrl,
      responseTimeMs: Math.round(performance.now() - startedAt),
      statusMessage: message,
      lastChecked: checkedAt,
    };
  }
}

/**
 * Gateway/auth/user — через GET /api/health/services.
 * Scrapper — напряму (VITE_SCRAPPER_URL), окрема логіка.
 */
export async function checkAllServicesHealthViaGateway(
  displayServices: readonly SystemServiceConfig[] = [],
  options?: { gatewayBaseUrl?: string; timeoutMs?: number },
): Promise<SystemServiceInfo[]> {
  const baseUrl = options?.gatewayBaseUrl ?? gatewayUrl;
  const healthUrl = buildHealthCheckUrl(baseUrl, GATEWAY_AGGREGATED_HEALTH_PATH);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_HEALTH_CHECK_TIMEOUT_MS;
  const checkedAt = new Date();

  const gatewayServices = displayServices.filter((s) => s.name !== 'scrapper');
  const scrapperConfig = displayServices.find((s) => s.name === 'scrapper');

  const [gatewayResults, scrapperResult] = await Promise.all([
    fetchGatewayServicesHealth(gatewayServices, healthUrl, timeoutMs, checkedAt),
    scrapperConfig ? checkScrapperHealthDirect(timeoutMs, checkedAt) : null,
  ]);

  if (!scrapperResult) {
    return gatewayResults;
  }

  return [...gatewayResults, scrapperResult];
}

async function fetchGatewayServicesHealth(
  displayServices: readonly SystemServiceConfig[],
  healthUrl: string,
  timeoutMs: number,
  checkedAt: Date,
): Promise<SystemServiceInfo[]> {
  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      return displayServices.map((service) => ({
        ...service,
        status: 'unknown' as const,
        healthUrl,
        httpStatus: response.status,
        statusMessage: `Gateway health failed: HTTP ${response.status}`,
        lastChecked: checkedAt,
      }));
    }

    const payload = (await response.json()) as GatewayAggregatedHealthResponse;
    const downstreamByName = new Map(
      (payload.services ?? []).map((service) => [service.name, service]),
    );

    return displayServices.map((service) => {
      if (service.name === 'gateway') {
        const aggregateNote =
          payload.aggregateStatus && payload.aggregateStatus !== 'ok'
            ? `Aggregate: ${payload.aggregateStatus}`
            : undefined;

        return {
          ...service,
          status: mapGatewaySelfStatus(payload),
          healthUrl,
          version: payload.version,
          buildAt: payload.buildAt,
          statusMessage: aggregateNote,
          lastChecked: checkedAt,
        };
      }

      const downstream = downstreamByName.get(service.name);

      if (!downstream) {
        return {
          ...service,
          status: 'not_monitored',
          healthUrl,
          statusMessage: 'Not configured on gateway',
          lastChecked: checkedAt,
        };
      }

      return {
        ...service,
        status: mapDownstreamStatus(downstream.status),
        healthUrl: downstream.healthUrl,
        httpStatus: downstream.httpStatus,
        responseTimeMs: downstream.responseTimeMs,
        version: downstream.version,
        buildAt: downstream.buildAt,
        statusMessage: downstream.message,
        lastChecked: checkedAt,
      };
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? 'Timeout waiting for gateway'
        : error instanceof TypeError
          ? 'Network error (gateway unreachable or CORS blocked)'
          : error instanceof Error
            ? error.message
            : 'Unknown error';

    return displayServices.map((service) => ({
      ...service,
      status: 'unknown' as const,
      healthUrl,
      statusMessage: message,
      lastChecked: checkedAt,
    }));
  }
}

/** @deprecated Use checkAllServicesHealthViaGateway */
export async function checkAllServicesHealth(
  services: readonly Pick<SystemServiceInfo, 'name' | 'url' | 'healthCheck'>[],
  options?: { timeoutMs?: number },
): Promise<SystemServiceInfo[]> {
  return checkAllServicesHealthViaGateway(services, options);
}
