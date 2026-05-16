import {
  STANDARD_HEALTH_PATH,
  type SystemServiceInfo,
  type SystemServiceStatus,
} from '../constants/systemServices';

export const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = 5000;

const HEALTHY_STATUS_VALUES = new Set(['ok', 'healthy', 'up', 'pass', 'ready']);

export interface HealthCheckResult {
  status: SystemServiceStatus;
  healthUrl: string;
  httpStatus?: number;
  responseTimeMs: number;
  version?: string;
  buildAt?: string;
  message?: string;
}

export type HealthCheckTarget = Pick<
  SystemServiceInfo,
  'name' | 'url' | 'healthPath' | 'healthCheck'
>;

export function buildHealthCheckUrl(
  baseUrl: string,
  healthPath: string = STANDARD_HEALTH_PATH,
): string {
  const normalizedBase = baseUrl.trim().replace(/\/+$/, '');
  const normalizedPath = healthPath.startsWith('/') ? healthPath : `/${healthPath}`;
  return `${normalizedBase}${normalizedPath}`;
}

function unwrapHealthPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (data && typeof data === 'object') {
    return data;
  }

  return payload;
}

function extractVersion(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const version = record.version ?? record.appVersion ?? record.build;
  return typeof version === 'string' ? version : undefined;
}

function extractBuildAt(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const buildAt = record.buildAt ?? record.build_at ?? record.timestamp;
  return typeof buildAt === 'string' ? buildAt : undefined;
}

function isHealthyPayload(payload: unknown): boolean {
  if (payload === null || payload === undefined) return true;

  if (typeof payload === 'boolean') return payload;

  if (typeof payload === 'string') {
    return HEALTHY_STATUS_VALUES.has(payload.trim().toLowerCase());
  }

  if (typeof payload !== 'object') return false;

  const record = payload as Record<string, unknown>;

  if (record.ok === true) return true;

  const statusValue = record.status ?? record.health ?? record.state;
  if (typeof statusValue === 'string') {
    return HEALTHY_STATUS_VALUES.has(statusValue.toLowerCase());
  }

  if (typeof statusValue === 'number') {
    return statusValue >= 200 && statusValue < 300;
  }

  return false;
}

function parseHealthBody(body: string, contentType: string | null): {
  healthy: boolean;
  version?: string;
  buildAt?: string;
} {
  const trimmed = body.trim();

  if (!trimmed) {
    return { healthy: true };
  }

  if (isHealthyPayload(trimmed)) {
    return { healthy: true };
  }

  const isJson =
    contentType?.includes('application/json') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[');

  if (isJson) {
    try {
      const payload = unwrapHealthPayload(JSON.parse(trimmed) as unknown);
      return {
        healthy: isHealthyPayload(payload),
        version: extractVersion(payload),
        buildAt: extractBuildAt(payload),
      };
    } catch {
      return { healthy: false };
    }
  }

  return { healthy: false };
}

function getHealthCheckErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Timeout: no response within 5s';
  }

  if (error instanceof TypeError) {
    return 'Network error (service unreachable or CORS blocked)';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export async function checkServiceHealth(
  service: HealthCheckTarget,
  options?: { timeoutMs?: number; healthPath?: string },
): Promise<HealthCheckResult> {
  const isEnabled = service.healthCheck !== false;

  if (!isEnabled) {
    return {
      status: 'not_monitored',
      healthUrl: '',
      responseTimeMs: 0,
      message: 'No HTTP health endpoint (service is not HTTP-based)',
    };
  }

  const healthPath = options?.healthPath ?? service.healthPath ?? STANDARD_HEALTH_PATH;
  const healthUrl = buildHealthCheckUrl(service.url, healthPath);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_HEALTH_CHECK_TIMEOUT_MS;
  const startedAt = performance.now();

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });

    const responseTimeMs = Math.round(performance.now() - startedAt);
    const body = await response.text();
    const { healthy, version, buildAt } = parseHealthBody(
      body,
      response.headers.get('content-type'),
    );

    if (!response.ok) {
      return {
        status: 'unhealthy',
        healthUrl,
        httpStatus: response.status,
        responseTimeMs,
        message: `HTTP ${response.status}`,
      };
    }

    if (!healthy) {
      return {
        status: 'unhealthy',
        healthUrl,
        httpStatus: response.status,
        responseTimeMs,
        version,
        buildAt,
        message: 'Endpoint responded but body is not a standard health payload',
      };
    }

    return {
      status: 'healthy',
      healthUrl,
      httpStatus: response.status,
      responseTimeMs,
      version,
      buildAt,
    };
  } catch (error) {
    return {
      status: 'unknown',
      healthUrl,
      responseTimeMs: Math.round(performance.now() - startedAt),
      message: getHealthCheckErrorMessage(error),
    };
  }
}

export async function checkAllServicesHealth(
  services: readonly HealthCheckTarget[],
  options?: { timeoutMs?: number },
): Promise<SystemServiceInfo[]> {
  const checkedAt = new Date();

  return Promise.all(
    services.map(async (service) => {
      const result = await checkServiceHealth(service, options);

      return {
        name: service.name,
        url: service.url,
        healthPath: service.healthPath,
        healthCheck: service.healthCheck,
        status: result.status,
        healthUrl: result.healthUrl,
        httpStatus: result.httpStatus,
        responseTimeMs: result.responseTimeMs,
        statusMessage: result.message,
        version: result.version,
        buildAt: result.buildAt,
        lastChecked: checkedAt,
      };
    }),
  );
}
